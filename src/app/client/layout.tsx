import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ClientLayout from '@/components/ClientLayout'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Authorize only clients
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'client' && profile?.role !== 'admin' && profile?.role !== 'team') {
    // Admins and team can technically view the client portal for testing, but they won't see data 
    // unless they have a matching `user_id` in `clients` table.
    redirect('/login')
  }

  return <ClientLayout>{children}</ClientLayout>
}
