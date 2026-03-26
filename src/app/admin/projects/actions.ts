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

export async function createProject(formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  const clientId = formData.get('client_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const startDate = formData.get('start_date') as string || null
  const endDate = formData.get('end_date') as string || null
  const budget = formData.get('budget') ? Number(formData.get('budget')) : null

  const { error } = await supabase.from('projects').insert({
    client_id: clientId,
    title,
    description,
    status,
    start_date: startDate,
    end_date: endDate,
    budget
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  return { success: true }
}

export async function updateProject(id: string, formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  const clientId = formData.get('client_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const startDate = formData.get('start_date') as string || null
  const endDate = formData.get('end_date') as string || null
  const budget = formData.get('budget') ? Number(formData.get('budget')) : null

  const { error } = await supabase.from('projects').update({
    client_id: clientId,
    title,
    description,
    status,
    start_date: startDate,
    end_date: endDate,
    budget
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  return { success: true }
}

export async function deleteProject(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('projects').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  return { success: true }
}
