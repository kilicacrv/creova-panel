'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateContentApproval(id: string, status: 'approved' | 'rejected', feedback?: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('content_calendar')
    .update({ 
      status, 
      feedback,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/client/approvals')
}
