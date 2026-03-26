import { createServerSupabaseClient } from '@/lib/supabase-server'
import WatchPanel from './WatchPanel'

export const dynamic = 'force-dynamic'

export default async function RemoteWatchPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch profiles that are 'team' or 'admin' to monitor them
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_online, current_activity, shift_start_time')
    .in('role', ['team', 'admin'])
    .order('is_online', { ascending: false }) // online first
    .order('full_name', { ascending: true })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Remote Watch Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Live monitoring for remote team members. Track shifts and active tasks.</p>
      </div>
      
      <WatchPanel initialProfiles={profiles || []} />
    </div>
  )
}
