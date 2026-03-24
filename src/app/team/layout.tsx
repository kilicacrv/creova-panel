import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import TeamLayout from '@/components/TeamLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  // Temporary bypass for site preview
  // if (!session) {
  //   redirect('/login')
  // }

  // Authorize only team members and admins
  const { data: profile } = session ? await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single() : { data: null }

  // if (profile?.role !== 'team' && profile?.role !== 'admin') {
  //   redirect('/login')
  // }

  return <TeamLayout>{children}</TeamLayout>
}
