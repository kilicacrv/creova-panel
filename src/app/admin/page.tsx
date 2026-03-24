import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

  // Gerçek dashboard verileri
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: clientCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingInvoiceCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .in('status', ['sent', 'overdue'])

  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .in('status', ['sent', 'overdue'])

  const pendingAmount = pendingInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0

  const { count: taskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .in('status', ['todo', 'in_progress'])

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
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{profile?.full_name || user.email}</span>
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

      {/* Dashboard */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Projects', value: String(projectCount ?? 0), icon: '📁' },
            { label: 'Active Clients', value: String(clientCount ?? 0), icon: '👥' },
            { label: 'Pending Invoices', value: String(pendingInvoiceCount ?? 0), icon: '📄' },
            { label: 'Open Tasks', value: String(taskCount ?? 0), icon: '✅' },
          ].map((metric) => (
            <div key={metric.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{metric.icon}</span>
                <span className="text-sm text-gray-500">{metric.label}</span>
              </div>
              <div className="text-3xl font-semibold text-gray-900">{metric.value}</div>
            </div>
          ))}
        </div>

        {pendingAmount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 font-medium">
              💰 Total Pending Amount: {pendingAmount.toLocaleString()} AED
            </p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Welcome to Creova Media Admin Panel</h2>
          <p className="text-sm text-gray-500">
            Manage your clients, projects, tasks, invoices and content approvals from this dashboard. 
            All data is live from your Supabase database.
          </p>
        </div>
      </div>
    </div>
  )
}