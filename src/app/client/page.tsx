import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Building2, FolderOpen, Receipt, CalendarCheck, ArrowRight, FileText, Megaphone, Bell, Clock, CheckCircle } from 'lucide-react'
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
      <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm mx-auto max-w-2xl mt-12">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Client Profile Missing</h2>
        <p>This user account is not linked to any client record.</p>
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
      title: `Contract Active: ${activeContracts[0].title}`, 
      time: activeContracts[0].start_date, 
      icon: FileText, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    })
  }

  latestInvoices?.forEach(inv => {
    activities.push({
      id: inv.id,
      title: `Invoice ${inv.invoice_number} ${inv.status}`,
      time: inv.created_at,
      icon: Receipt,
      color: inv.status === 'paid' ? 'text-emerald-600' : 'text-amber-600',
      bg: inv.status === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'
    })
  })

  latestProjects?.forEach(proj => {
    activities.push({
      id: proj.id,
      title: `Project Started: ${proj.name}`,
      time: proj.created_at,
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    })
  })

  // Sort by time
  activities.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const finalActivities = activities.slice(0, 5)

  const hasPendingContract = pendingContracts && pendingContracts.length > 0
  const activeContract = activeContracts?.[0]
  const notificationCount = (unreadMessages || 0) + (hasPendingContract ? 1 : 0)

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Pending Contract Banner */}
      {hasPendingContract && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-sm animate-in slide-in-from-top-4">
          <div className="flex items-center text-amber-800 mb-3 sm:mb-0">
             <div className="p-2 bg-amber-100 rounded-full mr-3 shrink-0">
                <FileText className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="font-bold">Contract Signature Required</p>
               <p className="text-sm opacity-90">Please review and sign your latest service agreement to proceed.</p>
             </div>
          </div>
          <Link href="/client/contracts" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors w-full sm:w-auto text-center shrink-0">
            Review & Sign
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Howdy, {clientData?.company_name || 'Client'}!</h1>
          <p className="text-gray-500 mt-1">Here is the latest snapshot of your agency growth.</p>
        </div>
        <div className="flex items-center space-x-3">
           <Link href="/admin/messages" className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 relative">
             <Bell className="w-5 h-5" />
             {notificationCount > 0 && (
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                 {notificationCount}
               </span>
             )}
           </Link>
           {clientData?.logo_url && (
             <img src={clientData.logo_url} alt="Logo" className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-sm bg-white" />
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Meta Ads */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Ad Spend</p>
              <h3 className="text-3xl font-black text-gray-900">${adSpend.toLocaleString()}</h3>
              <p className="text-xs text-green-600 font-bold mt-2">Active over 30 days</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Platform CTR</p>
              <h3 className="text-3xl font-black text-gray-900">{adCtr}%</h3>
              <p className="text-xs text-blue-600 font-bold mt-2">Across {adCount} campaigns</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pending Invoices</p>
              <h3 className="text-3xl font-black text-gray-900">{pendingInvoicesCount || 0}</h3>
              <Link href="/client/invoices" className="text-xs text-gray-500 font-bold hover:text-blue-600 mt-2 flex items-center group">
                 Pay now <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Active Campaigns Feature Map */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2 text-blue-600" /> Meta Ad Campaigns
                </h2>
                <p className="text-sm text-gray-500 mt-1">Live analytics integrated securely via Meta platform.</p>
              </div>
              <Link href="/client/campaigns" className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                View Full Report
              </Link>
            </div>
            
            {!clientData?.meta_ad_account_id ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
                <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-700">Analytics Not Connected</h4>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">You have not securely connected your Meta Ad account to unlock real-time dashboard tracking.</p>
                <Link href="/client/campaigns" className="inline-flex bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl font-bold text-sm text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors">Connect Meta Business</Link>
              </div>
            ) : adSpend > 0 ? (
              <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white flex flex-col justify-end relative overflow-hidden shadow-inner">
                 <div className="absolute top-0 right-0 w-full h-full opacity-10">
                    <svg viewBox="0 0 200 100" className="w-full h-full object-cover"><path fill="none" stroke="currentColor" strokeWidth="2" d="M0,80 Q25,80 50,50 T100,50 T150,20 T200,60" /></svg>
                 </div>
                 <div className="relative z-10">
                   <p className="text-blue-100 text-sm font-medium mb-1">Total ROI Trend</p>
                   <p className="text-3xl font-black">Performance Active</p>
                 </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                <p className="text-gray-500 font-medium">Data is synchronizing with Meta...</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Contracts & Activity */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Contract Status Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            
            <h3 className="font-bold text-gray-100 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" /> Active Master Agreement
            </h3>

            {activeContract ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Contract Duration</p>
                  <p className="font-medium text-blue-50">{new Date(activeContract.start_date).toLocaleDateString()} — {new Date(activeContract.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Monthly Billing</p>
                  <p className="text-2xl font-black">${activeContract.monthly_fee}</p>
                </div>
                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-md border border-green-500/30 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </span>
                  <Link href="/client/contracts" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">View details</Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-4">No active contracts signed.</p>
                <Link href="/client/contracts" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all">Review Hub</Link>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-6 flex items-center">
               <Clock className="w-5 h-5 mr-2 text-gray-400" /> Recent Activity
             </h3>
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
               {finalActivities.map((item, idx) => {
                 const Icon = item.icon as any
                 return (
                   <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${item.bg} ${item.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10`}>
                       <Icon className="w-4 h-4" />
                     </div>
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                       <time className="text-xs font-medium text-gray-400 uppercase tracking-widest">{new Date(item.time).toLocaleDateString() === 'Invalid Date' ? item.time : new Date(item.time).toLocaleDateString()}</time>
                       <p className="font-bold text-gray-900 text-sm mt-1">{item.title}</p>
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

function PenTool(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
}