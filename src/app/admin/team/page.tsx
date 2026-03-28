import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamList from './TeamList'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch only team and admin profiles
  const { data: team, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('role', ['admin', 'team'])
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl border border-red-100 mb-6">
          <h2 className="text-xl font-bold mb-2">Veritabanı Hatası (Team)</h2>
          <p className="font-mono text-sm bg-red-100 p-4 rounded-lg">{error.message}</p>
          <p className="mt-4 text-sm">Lütfen tablonuzda <code>created_at</code> sütununun olduğuna ve RLS (Row Level Security) ayarlarınızın doğru olduğuna emin olun.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <TeamList initialTeam={team || []} />
    </div>
  )
}
