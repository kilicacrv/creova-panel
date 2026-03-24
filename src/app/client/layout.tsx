import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientLayout from '@/components/ClientLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  // Temporary bypass for site preview
  // if (!session) {
  //   redirect('/login')
  // }

  // Authorize only clients
  const { data: profile } = session ? await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single() : { data: null }

  // if (profile?.role !== 'client' && profile?.role !== 'admin' && profile?.role !== 'team') {
  //   redirect('/login')
  // }

  return <ClientLayout>{children}</ClientLayout>
}
