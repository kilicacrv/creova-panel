'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
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

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const project_id = formData.get('project_id') as string
  const assigned_to = formData.get('assigned_to') as string || null
  const due_date = formData.get('due_date') as string || null
  const priority = formData.get('priority') as string
  const status = formData.get('status') as string

  const { error } = await supabase.from('tasks').insert({
    title,
    description,
    project_id,
    assigned_to,
    due_date,
    priority,
    status
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/tasks')
  revalidatePath('/team/tasks')
  return { success: true }
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const project_id = formData.get('project_id') as string
  const assigned_to = formData.get('assigned_to') as string || null
  const due_date = formData.get('due_date') as string || null
  const priority = formData.get('priority') as string
  const status = formData.get('status') as string

  const { error } = await supabase.from('tasks').update({
    title,
    description,
    project_id,
    assigned_to,
    due_date,
    priority,
    status
  }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/tasks')
  revalidatePath('/team/tasks')
  return { success: true }
}

export async function updateTaskStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required.' }

  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/tasks')
  revalidatePath('/team/tasks')
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required.' }

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/tasks')
  revalidatePath('/team/tasks')
  return { success: true }
}
