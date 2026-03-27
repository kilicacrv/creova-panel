import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientMetaAnalytics from '@/app/client/campaigns/ClientMetaAnalytics'
import { verifyShareToken } from '@/lib/share-utils'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SharedAdsPage({ 
  params, 
  searchParams 
}: { 
  params: { clientId: string }, 
  searchParams: { token?: string } 
}) {
  const { clientId } = params
  const { token } = searchParams

  if (!token || !verifyShareToken(token, clientId)) {
    return notFound()
  }

  const supabase = await createServerSupabaseClient()
  
  // Fetch Client Name for Header
  const { data: clientData } = await supabase
    .from('clients')
    .select('company_name, meta_ad_account_id')
    .eq('id', clientId)
    .single()

  if (!clientData) return notFound()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{clientData.company_name} - Performance Report</h1>
            <p className="text-gray-500 font-medium text-sm">Shared securely via Creova Media CRM</p>
          </div>
          <div className="text-right">
             <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-widest">
                Active Shared Link
             </div>
             <p className="text-[10px] text-gray-400 mt-1">Valid for 7 days</p>
          </div>
        </div>

        <ClientMetaAnalytics 
          clientId={clientId} 
          hasAdAccount={!!clientData.meta_ad_account_id} 
          isSharedView 
          shareToken={token}
        />
        
        <footer className="text-center text-gray-400 text-xs py-12 pb-24">
          Powered by Creova Media &copy; 2026. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
