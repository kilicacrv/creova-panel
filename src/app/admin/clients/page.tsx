import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientList from './ClientList'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*, contracts(id, status)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Clients Page Fetch Error:', error)
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-center">
          <span className="font-bold mr-2">Database Error:</span> {error.message}. Please ensure the 'contracts' table exists and RLS policies are correct.
        </div>
      )}
      <ClientList initialClients={clients || []} />
    </div>
  )
}
