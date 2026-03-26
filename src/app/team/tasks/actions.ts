'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateMyTaskStatus(id: string, status: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication required" }

  // Verify ownership before updating
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('assigned_to')
    .eq('id', id)
    .single()

  if (fetchError || !task) return { error: "Task not found" }

  if (task.assigned_to !== user.id) {
    return { error: "You can only update tasks assigned to you." }
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/team/tasks')
  revalidatePath('/team')
  return { success: true }
}
