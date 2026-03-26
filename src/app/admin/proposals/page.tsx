import { createServerSupabaseClient } from '@/lib/supabase-server'
import ProposalList from './ProposalList'
import ContractList from './ContractList'

export const dynamic = 'force-dynamic'

export default async function ProposalsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, clients(company_name), projects(title)')
    .order('created_at', { ascending: false })

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, clients(company_name)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name', { ascending: true })

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, client_id')
    .order('title', { ascending: true })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-12">
      <ContractList 
        initialContracts={contracts || []} 
        clients={clients || []} 
      />
      <ProposalList 
        initialProposals={proposals || []} 
        clients={clients || []} 
        projects={projects || []}
      />
    </div>
  )
}
