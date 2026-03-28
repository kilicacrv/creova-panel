import { createServerSupabaseClient } from '@/lib/supabase-server'
import { 
  Briefcase, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Film,
  DollarSign,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

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

  const { data: recentActivity } = await supabase
    .from('tasks')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Pending Production', value: String(pendingMediaCount ?? 0), icon: Film, subtitle: 'Queue Verification', color: 'text-brand-red', bg: 'bg-red-50' },
    { label: 'Operational Nodes', value: String(projectCount ?? 0), icon: Briefcase, subtitle: 'Active Projects', color: 'text-black', bg: 'bg-gray-50' },
    { label: 'Integrity Alerts', value: String(overdueTaskCount ?? 0), icon: AlertCircle, subtitle: 'Overdue Tasking', color: 'text-brand-red', bg: 'bg-red-50' },
    { label: 'Accrued Revenue', value: `${monthlyRevenue.toLocaleString()}`, icon: Zap, subtitle: 'AED Monthly Cycle', color: 'text-black', bg: 'bg-gray-50' },
  ]

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Command Center</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Global Agency Operations & Telemetry Overview</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Status</div>
              <div className="flex items-center gap-2 justify-end">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">Root_Access</span>
              </div>
           </div>
           <div className="p-4 bg-black rounded-2xl shadow-2xl">
              <ShieldCheck className="w-6 h-6 text-white" />
           </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((metric) => (
          <div key={metric.label} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity -mr-12 -mt-12"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-50 group-hover:scale-110 transition-transform ${metric.bg}`}>
                 <metric.icon className={`w-5 h-5 ${metric.color}`} />
               </div>
               <div className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">+Live</div>
            </div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mb-1 relative z-10">{metric.value}</div>
            <div className="flex justify-between items-center relative z-10">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{metric.label}</div>
               <p className="text-[8px] font-black text-gray-300 uppercase italic tracking-widest">{metric.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
        {/* Revenue Snapshot */}
        <div className="lg:col-span-8 bg-black border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red rounded-full blur-[120px] opacity-10 -mr-48 -mt-48 transition-all duration-1000 group-hover:scale-125"></div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center">
                 <Activity className="w-6 h-6 mr-4 text-brand-red" /> Financial Architecture
               </h2>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Treasury Liquidity & Pending Asset Flow</p>
            </div>
            <Link href="/admin/invoices" className="bg-white hover:bg-brand-red hover:text-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Full Ledger</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-white/5 rounded-[2rem] p-10 border border-white/5 shadow-inner group/card hover:bg-white/10 transition-all">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 italic">Pending Receivables_</div>
              <div className="text-4xl font-black text-white italic tracking-tighter">{pendingAmount.toLocaleString()} <span className="text-xs text-gray-600 not-italic uppercase tracking-widest">AED</span></div>
              <div className="mt-6 flex items-center text-[8px] font-black text-brand-red uppercase tracking-widest gap-2">
                 <div className="w-1 h-1 rounded-full bg-brand-red animate-ping"></div> Awaiting Liquidation
              </div>
            </div>
            <div className="bg-brand-red rounded-[2rem] p-10 shadow-2xl relative overflow-hidden group/card">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 -mr-16 -mb-16"></div>
              <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4 italic">Settled Revenue_</div>
              <div className="text-4xl font-black text-white italic tracking-tighter">{monthlyRevenue.toLocaleString()} <span className="text-xs text-white/40 not-italic uppercase tracking-widest">AED</span></div>
              <div className="mt-6 flex items-center text-[8px] font-black text-white uppercase tracking-widest gap-2">
                 <div className="w-1 h-1 rounded-full bg-white"></div> Current Cycle
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic flex items-center">
               <Target className="w-4 h-4 mr-3 text-brand-red" /> Active Directives
            </h2>
            <Link href="/admin/tasks" className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-mono">ALL_NODES</Link>
          </div>
          <div className="space-y-8 flex-grow">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map(task => (
                <div key={task.id} className="relative flex items-start gap-5 group pb-2">
                  <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-brand-red group-hover:scale-150 transition-transform shadow-lg shadow-red-500/20"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate italic group-hover:text-brand-red transition-colors">{task.title}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Ref: {task.id.slice(0,8)} • {new Date(task.updated_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                    task.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                 <AlertCircle className="w-10 h-10 mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">No Active Nodes</p>
              </div>
            )}
          </div>
          <button className="w-full mt-10 bg-gray-50 hover:bg-black hover:text-white text-gray-400 font-black uppercase tracking-widest text-[9px] py-4 rounded-2xl transition-all active:scale-95 border border-gray-100">
             Engage Intelligence Node
          </button>
        </div>
      </div>
    </div>
  )
}