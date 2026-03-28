import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Building2, FolderOpen, Receipt, CalendarCheck, ArrowRight, FileText, Megaphone, Bell, Clock, CheckCircle, Zap, TrendingUp, Target, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard({ searchParams }: { searchParams: { preview_id?: string } }) {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if admin is shadowing
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'team'
  const targetUserId = (isAdmin && searchParams.preview_id) ? null : user.id
  const targetClientId = (isAdmin && searchParams.preview_id) ? searchParams.preview_id : null

  // Fetch Client Profile Data
  let clientQuery = supabase.from('clients').select('company_name, id, meta_ad_account_id, logo_url')
  
  if (targetClientId) {
    clientQuery = clientQuery.eq('id', targetClientId)
  } else {
    clientQuery = clientQuery.eq('user_id', targetUserId)
  }

  const { data: clientData } = await clientQuery.single()
  
  if (!clientData) {
    return (
      <div className="p-20 text-center bg-white rounded-xl border border-gray-100 shadow-2xl mx-auto max-w-2xl mt-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
        <Building2 className="w-16 h-16 mx-auto mb-6 text-gray-200" />
        <h2 className="text-2xl font-bold text-gray-900 mb-3 uppercase italic tracking-tight">Profile Not Found</h2>
        <p className="text-gray-400 text-sm font-semibold text-sm px-10">This authentication node is not currently linked to a verified client registry.</p>
      </div>
    )
  }

  const clientId = clientData.id

  // Contracts
  const { data: pendingContracts } = await supabase
    .from('contracts')
    .select('id, title, status, end_date')
    .eq('status', 'pending')

  const { data: activeContracts } = await supabase
    .from('contracts')
    .select('id, title, status, monthly_fee, start_date, end_date')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  // Quick Stats
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingInvoicesCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .in('status', ['sent', 'overdue'])

  // Get Meta Ads Cached summary
  let adSpend = 0
  let adCount = 0
  let adCtr = '0.00'
  
  if (clientData?.id) {
    const { data: metaCache } = await supabase
      .from('meta_cache')
      .select('data')
      .eq('client_id', clientData.id)
      .eq('date_preset', 'last_30d')
      .single()

    if (metaCache?.data?.summary) {
       adSpend = parseFloat(metaCache.data.summary.spend || '0')
       adCtr = parseFloat(metaCache.data.summary.ctr || '0').toFixed(2)
    }
    if (metaCache?.data?.campaigns) {
       adCount = metaCache.data.campaigns.filter((c: any) => c.status === 'ACTIVE').length
    }
  }

  // Notifications
  const { count: unreadMessages } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  const { data: latestInvoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: latestProjects } = await supabase
    .from('projects')
    .select('id, name, status, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(3)

  // Activity Feed Assembly
  const activities: any[] = []
  
  if (activeContracts?.[0]) {
    activities.push({ 
      id: 'c1', 
      title: `Protocol Active: ${activeContracts[0].title}`, 
      time: activeContracts[0].start_date, 
      icon: ShieldCheck, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50' 
    })
  }

  latestInvoices?.forEach(inv => {
    activities.push({
      id: inv.id,
      title: `Ledger Entry: ${inv.invoice_number} ${inv.status.toUpperCase()}`,
      time: inv.created_at,
      icon: Receipt,
      color: inv.status === 'paid' ? 'text-emerald-500' : 'text-blue-600',
      bg: inv.status === 'paid' ? 'bg-emerald-50' : 'bg-red-50'
    })
  })

  latestProjects?.forEach(proj => {
    activities.push({
      id: proj.id,
      title: `Node Initialized: ${proj.name}`,
      time: proj.created_at,
      icon: FolderOpen,
      color: 'text-black',
      bg: 'bg-gray-100'
    })
  })

  // Sort by time
  activities.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const finalActivities = activities.slice(0, 5)

  const hasPendingContract = pendingContracts && pendingContracts.length > 0
  const activeContract = activeContracts?.[0]
  const notificationCount = (unreadMessages || 0) + (hasPendingContract ? 1 : 0)

  return (
    <div className="space-y-10">
      {/* Pending Contract Banner */}
      {hasPendingContract && (
        <div className="bg-black border border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-2xl animate-in slide-in-from-top-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center text-white mb-4 sm:mb-0 relative z-10">
             <div className="p-3 bg-blue-600 rounded-2xl mr-5 shrink-0 shadow-lg shadow-blue-500/20">
                <FileText className="w-6 h-6 text-white" />
             </div>
             <div>
               <p className="font-bold text-lg uppercase tracking-tight italic">Registry Protocol Required</p>
               <p className="text-[10px] uppercase font-bold tracking-normal text-gray-400 mt-1">Pending Master Agreement awaiting signature.</p>
             </div>
          </div>
          <Link href="/client/contracts" className="bg-white hover:bg-blue-600 hover:text-white text-black px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-normal shadow-xl transition-all w-full sm:w-auto text-center shrink-0 relative z-10 active:scale-95">
            Execute Protocol
          </Link>
        </div>
      )}

      {/* Hero Welcome */}
      <div className="bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-[100px] -ml-32 -mt-32 opacity-40"></div>
         <div className="relative z-10">
            <h2 className="text-[10px] font-medium text-[11px] uppercase tracking-wider text-gray-300 italic mb-2">Systems Online</h2>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight font-bold">{clientData?.company_name || 'Counterparty'} Hub</h1>
            <p className="text-gray-400 text-[10px] font-semibold text-sm mt-2 max-w-md leading-relaxed">Global performance telemetry and asset synchronization across all active agency marketing nodes.</p>
         </div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="text-right hidden sm:block">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-normal italic mb-1">Status</div>
               <div className="flex items-center gap-2 justify-end">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-tight italic">Secured_Link</span>
               </div>
            </div>
            {clientData?.logo_url ? (
              <img src={clientData.logo_url} alt="Logo" className="w-20 h-20 rounded-xl border-4 border-white shadow-2xl object-cover bg-white" />
            ) : (
               <div className="w-20 h-20 rounded-xl bg-black text-white flex items-center justify-center font-bold text-2xl shadow-2xl">
                  {clientData?.company_name?.charAt(0) || 'C'}
               </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Stats & Meta Ads */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard title="Capital Deployed" value={`$${adSpend.toLocaleString()}`} icon={<TrendingUp className="text-blue-600 w-4 h-4"/>} subtitle="Last 30 Cycle" />
            <MetricCard title="Node Efficiency" value={`${adCtr}%`} icon={<Target className="text-black w-4 h-4"/>} subtitle={`Across ${adCount} Nodes`} />
            <MetricCard title="Open Ledgers" value={pendingInvoicesCount || 0} icon={<Receipt className="text-blue-600 w-4 h-4"/>} subtitle="Pending Action" link="/client/invoices" />
          </div>

          {/* Active Campaigns Feature Map */}
          <div className="bg-black border border-gray-800 rounded-xl p-10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-10 -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="flex justify-between items-center mb-10 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight flex items-center">
                  <Megaphone className="w-6 h-6 mr-4 text-blue-600" /> Meta Performance Hub
                </h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-normal mt-2">Authenticated API Stream • Data Integrity Verified</p>
              </div>
              <Link href="/client/campaigns" className="bg-white hover:bg-blue-600 hover:text-white text-black px-6 py-3 rounded-xl text-[10px] font-semibold text-sm transition-all active:scale-95">
                Full Telemetry
              </Link>
            </div>
            
            {!clientData?.meta_ad_account_id ? (
              <div className="bg-white/5 rounded-xl p-12 text-center border border-dashed border-white/10 relative z-10">
                <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-6" />
                <h4 className="font-bold text-white uppercase tracking-normal text-lg mb-2">Portfolio Unlinked</h4>
                <p className="text-gray-500 text-[10px] font-semibold text-sm max-w-sm mx-auto mb-8">Secure your Meta Business assets to enable real-time dashboard visualization.</p>
                <Link href="/client/campaigns" className="inline-flex bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 hover:bg-white hover:text-black transition-all">Link Marketing Repository</Link>
              </div>
            ) : adSpend > 0 ? (
              <div className="h-48 bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-white flex flex-col justify-end relative overflow-hidden border border-white/5 shadow-inner z-10">
                 <div className="absolute top-0 right-0 w-full h-full opacity-20 group-hover:opacity-30 transition-opacity">
                    <svg viewBox="0 0 400 200" className="w-full h-full"><path fill="none" stroke="#E31E24" strokeWidth="4" d="M0,150 Q50,150 100,100 T200,80 T300,40 T400,90" className="animate-[dash_3s_linear_infinite]" /></svg>
                 </div>
                 <div className="relative z-20">
                   <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
                      <p className="text-gray-400 text-[10px] font-semibold text-sm">Active Intelligence Feed</p>
                   </div>
                   <p className="text-4xl font-bold uppercase tracking-tight italic">Node Performance Optimized</p>
                 </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-10 text-center border border-white/5 z-10 relative">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping mx-auto mb-4"></div>
                <p className="text-gray-400 font-semibold text-sm text-[10px]">Synchronizing Matrix with Meta Platform...</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Contracts & Activity */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Active Contract Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 -mr-16 -mb-16"></div>
            
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mb-8 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-3 text-blue-600" /> Primary Agreement
            </h3>

            {activeContract ? (
              <div className="space-y-6 relative z-10">
                <div>
                   <h4 className="text-lg font-bold text-gray-900 uppercase tracking-tight italic leading-none">{activeContract.title}</h4>
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-normal mt-2 italic">Ref: MSA_SECURE_{activeContract.id.slice(0,5)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-normal mb-1.5">Cycle Fee</p>
                      <p className="text-xl font-bold text-gray-900 tracking-tight">${activeContract.monthly_fee}</p>
                   </div>
                   <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-center">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-normal mb-1.5">Maturity</p>
                      <p className="font-bold text-gray-900 text-xs uppercase tracking-tight">{new Date(activeContract.end_date).toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-[0.2em] italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Verified_Active
                  </span>
                  <Link href="/client/contracts" className="text-[9px] font-bold text-gray-400 hover:text-black uppercase tracking-normal transition-colors flex items-center group">
                    Hub <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 relative z-10">
                <p className="text-gray-300 font-semibold text-sm text-[10px] mb-6 italic">No Active Protocols Found</p>
                <Link href="/client/contracts" className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-semibold text-sm hover:bg-blue-600 transition-all shadow-xl">Review Matrix</Link>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
             <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em] mb-10 flex items-center italic">
               Temporal Activity
             </h3>
             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
               {finalActivities.map((item, idx) => {
                 const Icon = item.icon as any
                 return (
                   <div key={idx} className="relative flex items-start gap-6 group">
                     <div className={`flex items-center justify-center w-10 min-w-[40px] h-10 rounded-2xl border-2 border-white ${item.bg} ${item.color} shadow-lg shadow-black/5 relative z-10 transition-transform group-hover:scale-110`}>
                       <Icon className="w-4 h-4" />
                     </div>
                     <div className="flex-1 pt-1">
                        <div className="flex justify-between items-center gap-4">
                           <p className="font-bold text-gray-900 text-[11px] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{item.title}</p>
                           <time className="text-[8px] font-bold text-gray-300 uppercase tracking-normal shrink-0 italic">{new Date(item.time).toLocaleDateString() === 'Invalid Date' ? item.time : new Date(item.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time>
                        </div>
                        <div className="w-full h-px bg-gray-50 mt-4 group-last:hidden"></div>
                     </div>
                   </div>
                 )
               })}
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, subtitle, link }: any) {
   const Content = (
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all group relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity -mr-12 -mt-12"></div>
         <div className="flex justify-between items-start mb-4 relative z-10">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{title}</p>
            <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors border border-gray-50 group-hover:border-red-100">
               {icon}
            </div>
         </div>
         <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-bold relative z-10">{value}</h3>
         <div className="flex items-center justify-between mt-3 relative z-10">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-normal">{subtitle}</p>
            {link && <ArrowRight className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
         </div>
      </div>
   )
   
   return link ? <Link href={link} className="block">{Content}</Link> : Content
}