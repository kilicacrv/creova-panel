'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const companyName = formData.get('company_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as string

  const { error } = await supabase.from('clients').insert({
    company_name: companyName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    address,
    notes,
    status
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/clients')
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const companyName = formData.get('company_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const address = formData.get('address') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as string

  const { error } = await supabase.from('clients').update({
    company_name: companyName,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    address,
    notes,
    status
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/clients')
}

export async function deleteClient(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/clients')
}
