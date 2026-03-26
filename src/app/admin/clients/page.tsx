import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientList from './ClientList'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('*, contracts(id, status)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <ClientList initialClients={clients || []} />
    </div>
  )
}
