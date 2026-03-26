import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Building2, FolderOpen, Receipt, CalendarCheck, ArrowRight, FileText, Megaphone, Bell, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch Client Profile Data
  const { data: clientData } = await supabase
    .from('clients')
    .select('company_name, id, meta_ad_account_id, logo_url')
    .eq('user_id', user.id)
    .single()

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

  // Activity Feed Assembly (Mocked merge of latest records)
  const activities = []
  if (activeContracts?.[0]) activities.push({ id: 'c', title: 'Contract Signed', time: activeContracts[0].start_date, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' })
  if (pendingContracts?.[0]) activities.push({ id: 'pc', title: 'New Proposal requiring signature', time: 'Just now', icon: PenTool, color: 'text-amber-600', bg: 'bg-amber-100' })
  // Fallback defaults
  if (activities.length === 0) {
    activities.push({ id: '1', title: 'Welcome to your Client Portal', time: 'Recent', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' })
  }

  const hasPendingContract = pendingContracts && pendingContracts.length > 0
  const activeContract = activeContracts?.[0]

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
               <p className="font-bold">Action Required: Pending Contract Signature</p>
               <p className="text-sm opacity-90">Please review and digitally sign the new agreement generated for your agency.</p>
             </div>
          </div>
          <Link href="/client/contracts" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors w-full sm:w-auto text-center shrink-0">
            Review Document
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, {clientData?.company_name || 'Client'}!</h1>
          <p className="text-gray-500 mt-2">Here is the latest overview of your agency performance and billing.</p>
        </div>
        <div className="flex items-center space-x-3">
           <button className="p-2.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 relative group">
             <Bell className="w-5 h-5" />
             {hasPendingContract && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
           </button>
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
               {activities.map((item, idx) => {
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