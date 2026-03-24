import { createServerSupabaseClient } from '@/lib/supabase-server'
import TimeList from './TimeList'

export const dynamic = 'force-dynamic'

export default async function TimeTrackingPage() {
  const supabase = await createServerSupabaseClient()
  
  // As this is Admin view, we fetch ALL time tracking logs joined with users and projects
  const { data: entries } = await supabase
    .from('time_tracking')
    .select('*, profiles(full_name), tasks(title, project_id), projects(title, client_id, clients(company_name))')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Data for the modals
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, client_id, clients(company_name)')
    .eq('status', 'active')
    .order('title', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, project_id')
    .in('status', ['todo', 'in_progress', 'review'])

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <TimeList 
        initialTime={entries || []} 
        projects={projects || []}
        tasks={tasks || []}
      />
    </div>
  )
}
