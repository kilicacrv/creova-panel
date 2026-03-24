import { createServerSupabaseClient } from '@/lib/supabase-server'
import CalendarList from './CalendarList'

export const dynamic = 'force-dynamic'

export default async function ContentCalendarPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: items } = await supabase
    .from('content_calendar')
    .select('*, projects(title, client_id, clients(company_name))')
    .order('scheduled_for', { ascending: true })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, clients(company_name)')
    .eq('status', 'active')
    .order('title', { ascending: true })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <CalendarList 
        initialItems={items || []} 
        projects={projects || []}
      />
    </div>
  )
}
