'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Admin permissions required' }
  }
  return { supabase, user }
}

export async function createContract(formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  const client_id = formData.get('client_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const monthly_fee = parseFloat(formData.get('monthly_fee') as string) || 0
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const payment_terms = formData.get('payment_terms') as string
  const clauses = formData.get('clauses') as string
  
  const { error } = await supabase.from('contracts').insert({
    client_id,
    title,
    description,
    monthly_fee,
    start_date,
    end_date,
    payment_terms,
    clauses,
    status: 'pending' // Initial status before client signs
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/proposals')
  return { success: true }
}

export async function deleteContract(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('contracts').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/proposals')
  return { success: true }
}
