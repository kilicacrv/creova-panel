import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamList from './TeamList'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch only team and admin profiles
  const { data: team } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('role', ['admin', 'team'])
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto">
      <TeamList initialTeam={team || []} />
    </div>
  )
}
