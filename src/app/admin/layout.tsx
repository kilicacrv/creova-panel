import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

export const dynamic = 'force-dynamic'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Temporary bypass for site preview
  // if (!user) redirect('/login')

  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() : { data: null }

  // if (profile?.role !== 'admin') redirect('/login')

  return (
    <AdminLayout 
      userEmail={user?.email || 'guest@example.com'} 
      userName={profile?.full_name || 'Guest Admin'}
    >
      {children}
    </AdminLayout>
  )
}
