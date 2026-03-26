'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Permission denied. Only admins can update roles.' }
  }

  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)

  if (error) {
    console.error('Role Update Error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/management')
  revalidatePath('/admin/team')
  return { success: true }
}
