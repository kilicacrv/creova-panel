'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createCampaign(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  revalidatePath('/admin/campaigns')
}

export async function updateCampaign(id: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
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

  if (error) throw new Error(error.message)
  revalidatePath('/admin/campaigns')
}

export async function deleteCampaign(id: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('ad_campaigns').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/campaigns')
}

export async function updateCampaignStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.from('ad_campaigns').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/campaigns')
}
