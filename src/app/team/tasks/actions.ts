'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateMyTaskStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify ownership before updating
  const { data: task } = await supabase
    .from('tasks')
    .select('assigned_to')
    .eq('id', id)
    .single()

  if (task?.assigned_to !== user.id) {
    throw new Error("You can only update tasks assigned to you.")
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/team/tasks')
  revalidatePath('/team')
}
