import { createServerSupabaseClient } from '@/lib/supabase-server'
import TaskList from './TaskList'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch tasks with project names and assignee names
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, projects(title), profiles(full_name)')
    .order('created_at', { ascending: false })

  // Fetch projects for the dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .eq('status', 'active')
    .order('title', { ascending: true })

  // Fetch team members for the assignee dropdown
  const { data: team } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('role', ['admin', 'team'])
    .order('full_name', { ascending: true })

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
      <TaskList 
        initialTasks={tasks || []} 
        projects={projects || []} 
        team={team || []} 
      />
    </div>
  )
}
