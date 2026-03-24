'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createContent(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const projectId = formData.get('project_id') as string || null
  const title = formData.get('title') as string
  const description = formData.get('description') as string || null
  const content = formData.get('content') as string || null
  const platform = formData.get('platform') as string
  const imageUrl = formData.get('image_url') as string || null
  const scheduledFor = formData.get('scheduled_for') as string || null
  const status = formData.get('status') as string

  const { error } = await supabase.from('content_calendar').insert({
    project_id: projectId,
    title,
    description,
    content,
    platform,
    image_url: imageUrl,
    scheduled_for: scheduledFor,
    status,
    submitted_by: user?.id
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/content')
}

export async function updateContent(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const projectId = formData.get('project_id') as string || null
  const title = formData.get('title') as string
  const description = formData.get('description') as string || null
  const content = formData.get('content') as string || null
  const platform = formData.get('platform') as string
  const imageUrl = formData.get('image_url') as string || null
  const scheduledFor = formData.get('scheduled_for') as string || null
  const status = formData.get('status') as string

  const { error } = await supabase.from('content_calendar').update({
    project_id: projectId,
    title,
    description,
    content,
    platform,
    image_url: imageUrl,
    scheduled_for: scheduledFor,
    status
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/content')
}

export async function deleteContent(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('content_calendar').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/content')
}

export async function updateContentStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('content_calendar').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/content')
}
