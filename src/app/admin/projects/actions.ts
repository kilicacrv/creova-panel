'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  revalidatePath('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  revalidatePath('/admin/projects')
}

export async function deleteProject(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/projects')
}
