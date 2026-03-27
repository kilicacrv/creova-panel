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
    .select('company_name, id, meta_ad_account_id, logo_url, role') // Added role back
    .eq('id', session.user.id) // Reverted to original eq clause, as user is not defined
    .single()

  if (profile?.role !== 'client' && profile?.role !== 'admin' && profile?.role !== 'team') {
    // Admins and team can technically view the client portal for testing
    redirect('/login')
  }

  const isSimulating = profile?.role === 'admin' || profile?.role === 'team'

  return <ClientLayout>{children}</ClientLayout>
}
