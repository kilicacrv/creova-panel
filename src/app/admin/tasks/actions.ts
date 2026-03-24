'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const projectId = formData.get('project_id') as string
  const assignedTo = formData.get('assigned_to') as string || null
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const priority = formData.get('priority') as string
  const dueDate = formData.get('due_date') as string || null

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    assigned_to: assignedTo,
    title,
    description,
    status,
    priority,
    due_date: dueDate
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tasks')
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/tasks')
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const projectId = formData.get('project_id') as string
  const assignedTo = formData.get('assigned_to') as string || null
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const priority = formData.get('priority') as string
  const dueDate = formData.get('due_date') as string || null

  const { error } = await supabase.from('tasks').update({
    project_id: projectId,
    assigned_to: assignedTo,
    title,
    description,
    status,
    priority,
    due_date: dueDate
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/tasks')
}

export async function deleteTask(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/tasks')
}
