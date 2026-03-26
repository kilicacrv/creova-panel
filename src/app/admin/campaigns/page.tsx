import { createServerSupabaseClient } from '@/lib/supabase-server'
import CampaignList from './CampaignList'
import MetaAnalytics from './MetaAnalytics'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: campaigns } = await supabase
    .from('ad_campaigns')
    .select('*, projects(title, client_id, clients(company_name))')
    .order('created_at', { ascending: false })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, client_id, clients(company_name)')
    .eq('status', 'active')
    .order('title', { ascending: true })

  // Extract unique clients from projects
  const uniqueClientsMap = new Map()
  projects?.forEach(p => {
    const clientData: any = p.clients
    if (clientData && p.client_id) {
      if (!uniqueClientsMap.has(p.client_id)) {
        uniqueClientsMap.set(p.client_id, {
          id: p.client_id,
          company_name: clientData.company_name || clientData[0]?.company_name || 'Unknown'
        })
      }
    }
  })
  const uniqueClients = Array.from(uniqueClientsMap.values())

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <MetaAnalytics clients={uniqueClients} />
      <div className="mt-8">
        <CampaignList 
          initialCampaigns={campaigns || []} 
          projects={projects || []}
        />
      </div>
    </div>
  )
}
