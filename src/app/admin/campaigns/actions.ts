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

export async function createCampaign(formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  const projectId = formData.get('project_id') as string
  const name = formData.get('name') as string
  const platform = formData.get('platform') as string
  const budget = Number(formData.get('budget'))
  const spent = Number(formData.get('spent')) || 0
  const roas = Number(formData.get('roas')) || 0
  const status = formData.get('status') as string
  const startDate = formData.get('start_date') as string || null
  const endDate = formData.get('end_date') as string || null

  const { error } = await supabase.from('ad_campaigns').insert({
    project_id: projectId,
    name,
    platform,
    budget,
    spent,
    roas,
    status,
    start_date: startDate,
    end_date: endDate
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/campaigns')
  return { success: true }
}

export async function updateCampaign(id: string, formData: FormData) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase
  
  const projectId = formData.get('project_id') as string
  const name = formData.get('name') as string
  const platform = formData.get('platform') as string
  const budget = Number(formData.get('budget'))
  const spent = Number(formData.get('spent')) || 0
  const roas = Number(formData.get('roas')) || 0
  const status = formData.get('status') as string
  const startDate = formData.get('start_date') as string || null
  const endDate = formData.get('end_date') as string || null

  const { error } = await supabase.from('ad_campaigns').update({
    project_id: projectId,
    name,
    platform,
    budget,
    spent,
    roas,
    status,
    start_date: startDate,
    end_date: endDate
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/campaigns')
  return { success: true }
}

export async function deleteCampaign(id: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/campaigns')
  return { success: true }
}

export async function updateCampaignStatus(id: string, status: string) {
  const check = await checkAdmin()
  if (check.error || !check.supabase) return { error: check.error || 'Server error' }
  const supabase = check.supabase

  const { error } = await supabase.from('ad_campaigns').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/campaigns')
  return { success: true }
}
