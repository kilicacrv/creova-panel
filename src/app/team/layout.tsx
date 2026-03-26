import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamLayout from '@/components/TeamLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Authorize only team members and admins
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'team' && profile?.role !== 'admin') {
    redirect('/login')
  }

  return <TeamLayout profile={profile}>{children}</TeamLayout>
}
