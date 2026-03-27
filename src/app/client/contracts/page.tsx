import { createServerSupabaseClient } from '@/lib/supabase-server'
import ContractSigning from './ContractSigning'

export const dynamic = 'force-dynamic'

export default async function ClientContractsPage({ searchParams }: { searchParams: { preview_id?: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Shadowing check
  const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'team'
  const activeClientId = (isAdmin && searchParams.preview_id) ? searchParams.preview_id : profile?.client_id

  let query = supabase.from('contracts').select('*').order('created_at', { ascending: false })
  if (activeClientId) {
    query = query.eq('client_id', activeClientId)
  }

  const { data: contracts } = await query

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal Contracts & Agreements</h1>
      <p className="text-gray-500 mb-8">Review, sign, and download your agency agreements securely.</p>
      
      <ContractSigning initialContracts={contracts || []} />
    </div>
  )
}
