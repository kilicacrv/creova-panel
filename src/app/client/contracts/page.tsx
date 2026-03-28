import { createServerSupabaseClient } from '@/lib/supabase-server'
import ContractSigning from './ContractSigning'
import { ShieldCheck } from 'lucide-react'

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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Legal Protocols</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Master Service Agreements & Integrated Registry Contracts</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <div className="p-3 bg-black rounded-2xl shadow-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
           </div>
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">Encrypted_Vault_Active</span>
        </div>
      </div>
      
      <ContractSigning initialContracts={contracts || []} />
    </div>
  )
}
