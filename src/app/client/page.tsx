import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ClientPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Gerçek veriler
  const clientId = clientData?.id

  const { count: projectCount } = clientId
    ? await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('status', 'active')
    : { count: 0 }

  const { count: invoiceCount } = clientId
    ? await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .in('status', ['sent', 'overdue'])
    : { count: 0 }

  const { count: approvalCount } = clientId
    ? await supabase
        .from('content_approvals')
        .select('*, projects!inner(client_id)', { count: 'exact', head: true })
        .eq('projects.client_id', clientId)
        .eq('status', 'pending')
    : { count: 0 }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="2,14 7,8 11,12 16,6 22,4"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Creova Media</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Client Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{clientData?.company_name || user.email}</span>
          <form action="/auth/logout" method="POST">
            <button 
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome, {clientData?.company_name || 'Client'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">Track your projects, invoices and content approvals.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Active Projects', value: String(projectCount ?? 0), icon: '📁' },
            { label: 'Pending Invoices', value: String(invoiceCount ?? 0), icon: '📄' },
            { label: 'Pending Approvals', value: String(approvalCount ?? 0), icon: '✅' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-gray-500">{item.label}</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}