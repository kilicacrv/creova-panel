'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createTimeEntry(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

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

  if (error) throw new Error(error.message)
  revalidatePath('/admin/time')
}

export async function updateTimeEntry(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  revalidatePath('/admin/time')
}

export async function deleteTimeEntry(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('time_tracking').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/time')
}
