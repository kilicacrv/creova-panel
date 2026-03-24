import { createServerSupabaseClient } from '@/lib/supabase-server'
import InvoiceList from './InvoiceList'

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch invoices with client and project relationships
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(company_name), projects(title)')
    .order('created_at', { ascending: false })

  // Fetch clients for the dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, company_name')
    .order('company_name', { ascending: true })

  // Fetch projects to dynamically filter in the form
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, client_id')
    .order('title', { ascending: true })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <InvoiceList 
        initialInvoices={invoices || []} 
        clients={clients || []} 
        projects={projects || []}
      />
    </div>
  )
}
