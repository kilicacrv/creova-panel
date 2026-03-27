import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientMetaAnalytics from './ClientMetaAnalytics'

export const dynamic = 'force-dynamic'

export default async function ClientCampaignsPage({ searchParams }: { searchParams: { preview_id?: string } }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Admin Shadowing Check
  const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'team'
  const activeClientId = (isAdmin && searchParams.preview_id) ? searchParams.preview_id : profile?.client_id

  if (!activeClientId) {
    return (
      <div className="p-8 text-center text-gray-500">
        No client profile linked to this session.
      </div>
    )
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('meta_ad_account_id')
    .eq('id', activeClientId)
    .single()

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <ClientMetaAnalytics 
        clientId={activeClientId} 
        hasAdAccount={!!clientData?.meta_ad_account_id} 
      />
    </div>
  )
}
