import { createServerSupabaseClient } from '@/lib/supabase-server'
import { 
  Building2, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

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

  const { data: recentActivity } = await supabase
    .from('tasks')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Active Clients', value: String(clientCount ?? 0), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Projects', value: String(projectCount ?? 0), icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Pending Invoices', value: String(pendingInvoiceCount ?? 0), icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Open Tasks', value: String(taskCount ?? 0), icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is what's happening today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((metric) => (
          <div key={metric.label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
            <div className="text-sm font-medium text-gray-500">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Snapshot */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Financial Snapshot</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div className="text-sm font-medium text-gray-500 mb-1">Total Pending Receivables</div>
              <div className="text-2xl font-bold text-gray-900">{pendingAmount.toLocaleString()} AED</div>
            </div>
            <div className="bg-blue-50/50 rounded-lg p-5 border border-blue-100">
              <div className="text-sm font-medium text-blue-600 mb-1">Monthly Active Revenue</div>
              <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                — <span className="text-xs text-gray-400 font-normal">(Needs integration)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map(task => (
                <div key={task.id} className="flex justify-between items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Updated {new Date(task.updated_at).toLocaleDateString()}</p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}