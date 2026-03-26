'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function clockIn() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      is_online: true,
      shift_start_time: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/team')
  revalidatePath('/admin/watch')
  return { success: true }
}

export async function clockOut() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      is_online: false,
      shift_start_time: null,
      current_activity: null
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/team')
  revalidatePath('/admin/watch')
  return { success: true }
}

export async function updateActivity(activity: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ current_activity: activity })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/team')
  revalidatePath('/admin/watch')
  return { success: true }
}
