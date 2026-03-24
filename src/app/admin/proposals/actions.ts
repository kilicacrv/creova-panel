'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createProposal(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const clientId = formData.get('client_id') as string
  const projectId = formData.get('project_id') as string || null
  const title = formData.get('title') as string
  const fileUrl = formData.get('file_url') as string || null
  const status = formData.get('status') as string

  const { error } = await supabase.from('proposals').insert({
    client_id: clientId,
    project_id: projectId,
    title,
    file_url: fileUrl,
    status
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/proposals')
}

export async function updateProposal(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const clientId = formData.get('client_id') as string
  const projectId = formData.get('project_id') as string || null
  const title = formData.get('title') as string
  const fileUrl = formData.get('file_url') as string || null
  const status = formData.get('status') as string

  const { error } = await supabase.from('proposals').update({
    client_id: clientId,
    project_id: projectId,
    title,
    file_url: fileUrl,
    status
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/proposals')
}

export async function deleteProposal(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('proposals').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/proposals')
}

export async function updateProposalStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('proposals').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/proposals')
}
