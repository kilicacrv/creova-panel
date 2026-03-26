import { createServerSupabaseClient } from '@/lib/supabase-server'
import ManagementPanel from './ManagementPanel'

export const dynamic = 'force-dynamic'

export default async function ManagementPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
        <p className="text-sm text-gray-500 mt-1">Unified panel for role authorizations and quick operational shortcuts.</p>
      </div>
      <ManagementPanel profiles={profiles || []} />
    </div>
  )
}
