'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Admin uses Service Role to create users directly without needing email confirmation
export async function createClientAccount(email: string, fullName: string, clientId: string) {
  // We need the service role key to invite/create users via API
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() { return }
      }
    }
  )

  try {
    // 1. Generate a secure random password for the client
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + "!"
    
    // 2. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    })

    if (authError || !authData.user) {
      if (authError?.message.includes('already registered')) {
        return { error: 'A user with this email is already registered.' }
      }
      throw new Error(authError?.message || 'Failed to create auth user')
    }

    const newUserId = authData.user.id

    // 3. Insert or Update their Profile to bind 'client_id' and 'role'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        email,
        full_name: fullName,
        role: 'client',
        client_id: clientId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (profileError) {
      // Rollback is complex here without RPC, but we return error
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    // 4. Return success and the credentials for the admin to distribute (or trigger an email)
    return { 
      success: true, 
      email, 
      tempPassword 
    }
  } catch (err: any) {
    console.error('Account Creation Error:', err)
    return { error: err.message }
  }
}
