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

export async function createContent(formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase || !check.user) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  const user = check.user
  
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
    submitted_by: user.id
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/content')
  return { success: true }
}

export async function updateContent(id: string, formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
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

  if (error) return { error: error.message }
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteContent(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('content_calendar').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/content')
  return { success: true }
}

export async function updateContentStatus(id: string, status: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('content_calendar').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/content')
  return { success: true }
}
