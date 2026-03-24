'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createInvoice(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const clientId = formData.get('client_id') as string
  const projectId = formData.get('project_id') as string || null
  const invoiceNumber = formData.get('invoice_number') as string
  const amount = Number(formData.get('amount'))
  const status = formData.get('status') as string
  const dueDate = formData.get('due_date') as string || null
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('invoices').insert({
    client_id: clientId,
    project_id: projectId,
    invoice_number: invoiceNumber,
    amount,
    status,
    due_date: dueDate,
    notes
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/invoices')
}

export async function updateInvoice(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const clientId = formData.get('client_id') as string
  const projectId = formData.get('project_id') as string || null
  const invoiceNumber = formData.get('invoice_number') as string
  const amount = Number(formData.get('amount'))
  const status = formData.get('status') as string
  const dueDate = formData.get('due_date') as string || null
  const notes = formData.get('notes') as string

  const payload: any = {
    client_id: clientId,
    project_id: projectId,
    invoice_number: invoiceNumber,
    amount,
    status,
    due_date: dueDate,
    notes
  }

  // If status is paid, auto-mark paid_at if not already set, otherwise nullify if changing from paid
  if (status === 'paid') {
    payload.paid_at = new Date().toISOString()
  } else {
    payload.paid_at = null
  }

  const { error } = await supabase.from('invoices').update(payload).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/invoices')
}

export async function deleteInvoice(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/invoices')
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const payload: any = { status }
  if (status === 'paid') {
    payload.paid_at = new Date().toISOString()
  } else {
    payload.paid_at = null
  }
  
  const { error } = await supabase.from('invoices').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/invoices')
}
