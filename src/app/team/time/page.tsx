import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamTimeList from './TeamTimeList'

export const dynamic = 'force-dynamic'

export default async function TeamTimePage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch only the current user's time entries
  const { data: entries } = await supabase
    .from('time_tracking')
    .select('*, projects(title, client_id, clients(company_name)), tasks(title, project_id)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, client_id, clients(company_name)')
    .eq('status', 'active')
    .order('title', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, project_id')
    .eq('assigned_to', user.id)
    .in('status', ['todo', 'in_progress', 'review'])

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <TeamTimeList 
        initialTime={entries || []} 
        projects={projects || []}
        tasks={tasks || []}
      />
    </div>
  )
}
