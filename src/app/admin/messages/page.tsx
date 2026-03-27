import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import MessengerClient from '@/components/MessengerClient'

export const dynamic = 'force-dynamic'

export default async function AdminMessagesPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect('/login')
  }

  // Fetch only Admin and Team profiles for the contact list
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .in('role', ['admin', 'team'])
    .order('full_name', { ascending: true })

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] p-0 m-0">
      <MessengerClient currentUser={userData.user} profiles={profiles || []} />
    </div>
  )
}
