import { createServerSupabaseClient } from '@/lib/supabase-server'
import ContractSigning from './ContractSigning'

export const dynamic = 'force-dynamic'

export default async function ClientContractsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Thanks to Supabase RLS, this naturally only fetches contracts belonging to this client.
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal Contracts & Agreements</h1>
      <p className="text-gray-500 mb-8">Review, sign, and download your agency agreements securely.</p>
      
      <ContractSigning initialContracts={contracts || []} />
    </div>
  )
}
