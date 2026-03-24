import { createServerSupabaseClient } from '@/lib/supabase-server'
import CampaignList from './CampaignList'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: campaigns } = await supabase
    .from('ad_campaigns')
    .select('*, projects(title, client_id, clients(company_name))')
    .order('created_at', { ascending: false })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, clients(company_name)')
    .eq('status', 'active')
    .order('title', { ascending: true })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <CampaignList 
        initialCampaigns={campaigns || []} 
        projects={projects || []}
      />
    </div>
  )
}
