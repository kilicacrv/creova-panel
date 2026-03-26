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

export async function createProposal(formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
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

  if (error) return { error: error.message }
  revalidatePath('/admin/proposals')
  return { success: true }
}

export async function updateProposal(id: string, formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
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

  if (error) return { error: error.message }
  revalidatePath('/admin/proposals')
  return { success: true }
}

export async function deleteProposal(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('proposals').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/proposals')
  return { success: true }
}

export async function updateProposalStatus(id: string, status: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('proposals').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/proposals')
  return { success: true }
}
