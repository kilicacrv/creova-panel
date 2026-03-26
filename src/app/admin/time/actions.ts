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

export async function createTimeEntry(formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase || !check.user) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  const user = check.user

  const projectId = formData.get('project_id') as string || null
  const taskId = formData.get('task_id') as string || null
  const hours = Number(formData.get('hours'))
  const date = formData.get('date') as string
  const billable = formData.get('billable') === 'on' || formData.get('billable') === 'true'
  const notes = formData.get('notes') as string || null

  const { error } = await supabase.from('time_tracking').insert({
    user_id: user.id,
    project_id: projectId,
    task_id: taskId,
    hours,
    date,
    billable,
    notes
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/time')
  return { success: true }
}

export async function updateTimeEntry(id: string, formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  const projectId = formData.get('project_id') as string || null
  const taskId = formData.get('task_id') as string || null
  const hours = Number(formData.get('hours'))
  const date = formData.get('date') as string
  const billable = formData.get('billable') === 'on' || formData.get('billable') === 'true'
  const notes = formData.get('notes') as string || null

  const { error } = await supabase.from('time_tracking').update({
    project_id: projectId,
    task_id: taskId,
    hours,
    date,
    billable,
    notes
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/time')
  return { success: true }
}

export async function deleteTimeEntry(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('time_tracking').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/time')
  return { success: true }
}
