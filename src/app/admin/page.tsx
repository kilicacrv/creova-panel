import { createServerSupabaseClient } from '@/lib/supabase-server'
import { 
  Briefcase, 
  AlertCircle,
  Film,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  FileSignature,
  Megaphone,
  CreditCard,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import DashboardCharts from './DashboardCharts'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch stats
  const { count: pendingMediaCount } = await supabase
    .from('media_production')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_admin')

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const now = new Date().toISOString()
  const { count: overdueTaskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .lt('due_date', now)
    .neq('status', 'done')

  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('status', 'paid')
  
  const monthlyRevenue = paidInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0

  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('amount')
    .in('status', ['sent', 'overdue'])

  const pendingAmount = pendingInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0

  // Fetch recent tasks for activity feed
  const { data: recentActivity } = await supabase
    .from('tasks')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(6)

  // Fetch active projects with client info
  const { data: activeProjects } = await supabase
    .from('projects')
    .select('id, title, status, budget, start_date, end_date, clients(company_name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch top clients by revenue
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('amount, status, projects(client_id, clients(company_name))')
    .eq('status', 'paid')

  const clientRevenueMap: Record<string, { name: string; revenue: number }> = {}
  allInvoices?.forEach((inv: any) => {
    const name = inv.projects?.clients?.company_name || (Array.isArray(inv.projects?.clients) ? inv.projects.clients[0]?.company_name : null)
    if (name) {
      if (!clientRevenueMap[name]) clientRevenueMap[name] = { name, revenue: 0 }
      clientRevenueMap[name].revenue += Number(inv.amount)
    }
  })
  const topClients = Object.values(clientRevenueMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Fetch recent media
  const { data: recentMedia } = await supabase
    .from('media_production')
    .select('id, file_name, file_type, status, created_at, projects(clients(company_name))')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { 
      label: 'Pending Media', 
      value: pendingMediaCount ?? 0, 
      icon: Film, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      href: '/admin/media'
    },
    { 
      label: 'Active Projects', 
      value: projectCount ?? 0, 
      icon: Briefcase, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      href: '/admin/projects'
    },
    { 
      label: 'Overdue Tasks', 
      value: overdueTaskCount ?? 0, 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      href: '/admin/tasks'
    },
    { 
      label: 'Monthly Revenue', 
      value: monthlyRevenue, 
      icon: DollarSign, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      isCurrency: true,
      href: '/admin/invoices'
    },
  ]

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      done: 'bg-emerald-50 text-emerald-700',
      completed: 'bg-emerald-50 text-emerald-700',
      active: 'bg-blue-50 text-blue-700',
      in_progress: 'bg-blue-50 text-blue-700',
      pending: 'bg-gray-100 text-gray-600',
      todo: 'bg-gray-100 text-gray-600',
      overdue: 'bg-red-50 text-red-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-600'
  }

  function getActivityIcon(status: string) {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  function getMediaStatus(status: string) {
    const map: Record<string, { label: string; style: string }> = {
      pending_admin: { label: 'Pending', style: 'bg-amber-50 text-amber-700' },
      pending_client: { label: 'Client Review', style: 'bg-blue-50 text-blue-700' },
      approved: { label: 'Ready', style: 'bg-emerald-50 text-emerald-700' },
      rejected: { label: 'Rejected', style: 'bg-red-50 text-red-700' },
      revision: { label: 'Revision', style: 'bg-purple-50 text-purple-700' },
    }
    return map[status] || { label: status, style: 'bg-gray-100 text-gray-600' }
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((metric) => (
          <Link key={metric.label} href={metric.href} className="block group">
            <div className="bg-white border border-gray-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300 group-hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.bg}`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Live</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1 tabular-nums">
                {(metric as any).isCurrency 
                  ? `${Number(metric.value).toLocaleString()} AED` 
                  : String(metric.value)
                }
              </div>
              <div className="text-[13px] text-gray-500">{metric.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue + Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Revenue Overview */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Collected vs pending revenue</p>
            </div>
            <Link href="/admin/invoices" className="text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <div className="text-xs text-emerald-600 font-medium mb-1">Collected</div>
              <div className="text-xl font-bold text-emerald-800 tabular-nums">{monthlyRevenue.toLocaleString()} AED</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="text-xs text-amber-600 font-medium mb-1">Pending</div>
              <div className="text-xl font-bold text-amber-800 tabular-nums">{pendingAmount.toLocaleString()} AED</div>
            </div>
          </div>

          <DashboardCharts topClients={topClients} />
        </div>

        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Active Projects</h2>
            <Link href="/admin/projects" className="text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3 flex-grow">
            {activeProjects && activeProjects.length > 0 ? (
              activeProjects.map((project: any) => (
                <div key={project.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{project.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {(project.clients as any)?.company_name || (Array.isArray(project.clients) ? project.clients[0]?.company_name : 'No client')}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <FolderOpen className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No active projects</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/admin/tasks" className="text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((task, idx) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5 shrink-0">
                    {getActivityIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(task.updated_at)}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md ${getStatusBadge(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                <Clock className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Clients by Revenue */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Top Clients by Revenue</h2>
            <Link href="/admin/clients" className="text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, idx) => {
                const maxRevenue = topClients[0]?.revenue || 1
                const pct = (client.revenue / maxRevenue) * 100
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500']
                return (
                  <div key={client.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${colors[idx] || 'bg-gray-400'} text-white text-xs font-bold flex items-center justify-center`}>
                          {client.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{client.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">{client.revenue.toLocaleString()} AED</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors[idx] || 'bg-gray-400'} transition-all duration-700 ease-out`} 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 py-12">
              <Users className="w-8 h-8 mb-2 text-gray-300" />
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Production Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-gray-900">Media Production</h2>
          <Link href="/admin/media" className="text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentMedia && recentMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentMedia.map((item: any) => {
              const mediaStatus = getMediaStatus(item.status)
              const clientName = item.projects?.clients?.company_name || (Array.isArray(item.projects?.clients) ? item.projects.clients[0]?.company_name : 'Unknown')
              return (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div className="w-full h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center">
                    <Film className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">{item.file_name}</p>
                  <p className="text-xs text-gray-500 truncate mb-2">{clientName}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${mediaStatus.style}`}>
                      {mediaStatus.label}
                    </span>
                    <span className="text-[11px] text-gray-400">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 py-12">
            <Film className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm">No media uploads yet</p>
          </div>
        )}
      </div>
    </div>
  )
}