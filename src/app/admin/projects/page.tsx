import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProjectList from './ProjectList'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch projects with client company names joined
  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients(company_name)')
    .order('created_at', { ascending: false })

  // Fetch list of clients for the Add/Edit project dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name', { ascending: true })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <ProjectList 
        initialProjects={projects || []} 
        clients={clients || []} 
      />
    </div>
  )
}
