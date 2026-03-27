'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  // 1. Permission Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: `Permission denied. Your current role is: ${profile?.role || 'none'}. Please ensure your role is set to 'admin' in the profiles table.` }
  }

  const companyName = formData.get('company_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as string
  const metaAdAccountId = formData.get('meta_ad_account_id') as string
  const logoUrl = formData.get('logo_url') as string

  // 2. Insert Data
  const { error } = await supabase.from('clients').insert({
    company_name: companyName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    address,
    notes,
    status,
    meta_ad_account_id: metaAdAccountId,
    logo_url: logoUrl
  })

  if (error) {
    console.error('Database Error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/clients')
  return { success: true }
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required.' }

  const companyName = formData.get('company_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as string
  const metaAdAccountId = formData.get('meta_ad_account_id') as string
  const logoUrl = formData.get('logo_url') as string

  const { error } = await supabase.from('clients').update({
    company_name: companyName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    address,
    notes,
    status,
    meta_ad_account_id: metaAdAccountId,
    logo_url: logoUrl
  }).eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/clients')
  return { success: true }
}

export async function deleteClient(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/clients')
  return { success: true }
}
