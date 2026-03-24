import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamTaskList from './TeamTaskList'

export const dynamic = 'force-dynamic'

export default async function TeamTasksPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, projects(title)')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
        <p className="text-gray-500 mt-1">Focus on your assigned work and keep your statuses updated for the team.</p>
      </div>

      <TeamTaskList initialTasks={tasks || []} />
    </div>
  )
}
