import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientMetaAnalytics from './ClientMetaAnalytics'

export const dynamic = 'force-dynamic'

export default async function ClientCampaignsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('client_id')
    .eq('id', user.id)
    .single()

  if (!profile?.client_id) {
    return (
      <div className="p-8 text-center text-gray-500">
        Your account is not linked to a client profile. Please contact Support.
      </div>
    )
  }

  const { data: clientData } = await supabase
    .from('clients')
    .select('meta_ad_account_id')
    .eq('id', profile.client_id)
    .single()

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <ClientMetaAnalytics 
        clientId={profile.client_id} 
        hasAdAccount={!!clientData?.meta_ad_account_id} 
      />
    </div>
  )
}
