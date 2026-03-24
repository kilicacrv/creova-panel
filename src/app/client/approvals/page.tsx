import { createServerSupabaseClient } from '@/lib/supabase-server'
import ApprovalList from './ApprovalList'

export const dynamic = 'force-dynamic'

export default async function ClientApprovalsPage() {
  const supabase = await createServerSupabaseClient()
  
  // RLS will ensure we only see posts from projects linked to the client's company
  const { data: items } = await supabase
    .from('content_calendar')
    .select('*')
    .in('status', ['pending', 'approved', 'rejected']) // Don't show drafts to clients
    .order('scheduled_for', { ascending: true })

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Content Approvals</h1>
        <p className="text-gray-500 mt-2 text-lg font-medium">
          Review your upcoming social media calendar. Make sure everything looks perfect before we go live!
        </p>
      </div>

      <ApprovalList initialItems={items || []} />
    </div>
  )
}
