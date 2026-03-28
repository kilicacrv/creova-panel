'use client'

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Loader2, AlertCircle, RefreshCw, Share2, MapPin, Target, Users, MousePointerClick, Activity, TrendingUp } from 'lucide-react'

type ProjectClient = { id: string; company_name: string }

export default function MetaAnalytics({ clients }: { clients: ProjectClient[] }) {
  const [selectedClient, setSelectedClient] = useState<string>(clients[0]?.id || '')
  const [datePreset, setDatePreset] = useState<string>('last_30d')
  
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsOauth, setNeedsOauth] = useState(false)

  useEffect(() => {
    if (!selectedClient) return
    let isMounted = true

    async function load() {
      setIsLoading(true)
      setError('')
      setNeedsOauth(false)
      setData(null)

      try {
        const res = await fetch(`/api/meta/insights?client_id=${selectedClient}&date_preset=${datePreset}`)
        const json = await res.json()
        
        if (!isMounted) return
        
        if (json.needs_oauth) {
          setNeedsOauth(true)
        } else if (json.error) {
          setError(json.error)
        } else {
          setData(json.data)
        }
      } catch (err: any) {
        if (isMounted) setError('Failed to load Meta insights.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()

    return () => { isMounted = false }
  }, [selectedClient, datePreset])

  function handleConnect() {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || ''
    if (!appId) {
      alert("Missing NEXT_PUBLIC_META_APP_ID in environment variables.")
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/meta/callback`)
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${selectedClient}&scope=ads_read,read_insights`
    window.location.href = url
  }

  // Calculate Aggregates safely
  const summary = data?.summary || {}
  const spend = parseFloat(summary.spend) || 0
  const impressions = parseInt(summary.impressions) || 0
  const reach = parseInt(summary.reach) || 0
  const clicks = parseInt(summary.clicks) || 0
  const cpc = parseFloat(summary.cpc) || 0
  const cpm = parseFloat(summary.cpm) || 0
  const ctr = parseFloat(summary.ctr) || 0

  // Calculate derived metrics
  const purchasesAction = summary.actions?.find((a: any) => a.action_type === 'purchase')
  const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0
  const purchaseValues = summary.action_values?.find((a: any) => a.action_type === 'purchase')
  const revenue = purchaseValues ? parseFloat(purchaseValues.value) : purchases * 100
  const roas = spend > 0 ? (revenue / spend).toFixed(2) : '0.00'

  return (
    <div className="bg-white border text-sm border-gray-100 shadow-2xl rounded-[2rem] p-8 mb-8 mt-2 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30"></div>

      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-4">
           <div className="bg-red-50 p-3 rounded-2xl text-brand-red shadow-inner ring-1 ring-red-100">
             <Activity className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Campaign Intelligence</h2>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Global Meta Performance Engine</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group">
            <select 
              value={selectedClient} 
              onChange={(e) => setSelectedClient(e.target.value)} 
              className="appearance-none px-6 py-3 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 bg-white cursor-pointer font-bold text-gray-900 w-full sm:w-[240px] shadow-sm transition-all pr-10"
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Users className="w-4 h-4 text-gray-300" />
            </div>
          </div>

          <div className="relative group">
            <select 
              value={datePreset} 
              onChange={(e) => setDatePreset(e.target.value)} 
              className="appearance-none px-6 py-3 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 bg-white cursor-pointer w-full sm:w-auto shadow-sm transition-all font-bold pr-10"
            >
              <option value="last_7d">Last 7 Days</option>
              <option value="last_30d">Last 30 Days</option>
              <option value="last_90d">Last 90 Days</option>
            </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-brand-red" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-brand-red rounded-full"></div>
            </div>
          </div>
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Initializing Neural Sync...</p>
        </div>
      ) : needsOauth ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-red-50/30 rounded-[2.5rem] border border-red-50 mx-auto max-w-2xl px-12 relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-50"></div>
          <div className="w-20 h-20 bg-brand-red rounded-3xl shadow-xl shadow-red-100 flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Meta Auth Required</h3>
          <p className="text-gray-500 max-w-sm mb-10 font-medium text-sm leading-relaxed">
            Initialize secure connection to Meta Graph API to unlock real-time advertising performance and portfolio metrics.
          </p>
          <button 
            onClick={handleConnect}
            className="bg-black hover:bg-brand-red text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center shadow-2xl shadow-gray-200 hover:shadow-red-200 transition-all active:scale-95"
          >
            Authenticate Portal
          </button>
        </div>
      ) : error ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-red-50/50 rounded-3xl border border-red-100 max-w-2xl mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-50" />
          <p className="text-red-700 font-bold text-lg px-10">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600">Retry Connection</button>
        </div>
      ) : data ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Main Metrics KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Capital Spent" value={`$${spend.toFixed(2)}`} icon={<TrendingUp className="text-brand-red"/>} highlight />
            <MetricCard title="Total Impressions" value={impressions.toLocaleString()} icon={<Users className="text-gray-900"/>} />
            <MetricCard title="Engagement" value={clicks.toLocaleString()} icon={<MousePointerClick className="text-brand-red"/>} />
            <MetricCard title="Account ROAS" value={`${roas}x`} icon={<Target className="text-gray-900"/>} highlight />
            
            <MetricCard title="Engagement CTR" value={`${ctr.toFixed(2)}%`} />
            <MetricCard title="Unit CPC" value={`$${cpc.toFixed(2)}`} />
            <MetricCard title="Display CPM" value={`$${cpm.toFixed(2)}`} />
            <MetricCard title="Global Reach" value={reach.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Daily Spend Trend Chart */}
             <div className="lg:col-span-2 bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center relative z-10">
                 <Activity className="w-5 h-5 mr-3 text-brand-red" /> Performance Trajectory
               </h3>
               <div className="h-72 w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.daily}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9fafb" />
                     <XAxis dataKey="date_start" tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 700}} tickLine={false} axisLine={false} tickFormatter={(val: string) => val.split('-').slice(1).join('/')} />
                     <YAxis tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 700}} tickLine={false} axisLine={false} tickFormatter={(val: any) => `$${val}`} />
                     <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}/>
                     <Line type="monotone" dataKey="spend" stroke="#E31E24" strokeWidth={5} dot={false} activeDot={{r: 8, strokeWidth: 4, fill: '#E31E24', stroke: '#fff'}} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Demographics Age Chart */}
             <div className="bg-black p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-red rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-gray-400">Audience Architecture</h3>
               <div className="h-72 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupAge(data.demographics)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1f2937" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="age" type="category" width={40} tick={{fontSize: 10, fill: '#6b7280', fontWeight: 800}} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{borderRadius: '12px', background: '#000', border: '1px solid #333', color: '#fff'}}/>
                      <Bar dataKey="reach" fill="#E31E24" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top performing Ads List */}
            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
               <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center">Elite Creatives</h3>
               </div>
               <div className="divide-y divide-gray-50 p-4">
                 {data.ads?.slice(0, 6).map((ad: any, i: number) => (
                    <div key={i} className="px-4 py-4 flex justify-between items-center group hover:bg-red-50 rounded-2xl transition-all cursor-default">
                       <p className="font-bold text-gray-900 truncate w-2/3 group-hover:text-brand-red transition-colors">{ad.ad_name}</p>
                       <p className="font-black text-gray-900">${parseFloat(ad.spend || '0').toFixed(2)}</p>
                    </div>
                 ))}
                 {!data.ads?.length && <div className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-300">No creative data available</div>}
               </div>
            </div>

            {/* Campaign Status Check */}
            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
               <div className="bg-gray-50/50 px-8 py-5 border-b border-gray-100">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 flex items-center">Global Delivery Nodes</h3>
               </div>
               <div className="divide-y divide-gray-50 p-4 h-[340px] overflow-y-auto custom-scrollbar">
                 {data.campaigns?.map((camp: any, i: number) => (
                    <div key={i} className="px-4 py-4 flex justify-between items-center group hover:bg-red-50 rounded-2xl transition-all">
                       <div className="w-2/3">
                         <p className="font-bold text-gray-900 truncate group-hover:text-brand-red transition-colors capitalize">{camp.campaign_name.toLowerCase()}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{parseInt(camp.impressions || 0).toLocaleString()} reach nodes</p>
                       </div>
                       <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                         camp.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                       }`}>
                         {camp.status}
                       </span>
                    </div>
                 ))}
                 {!data.campaigns?.length && <div className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-gray-300">No active trajectories</div>}
               </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ title, value, icon, highlight }: any) {
  return (
    <div className={`p-6 rounded-3xl border transition-all hover:shadow-lg ${highlight ? 'bg-red-50/30 border-red-100' : 'bg-white border-gray-50 shadow-sm'}`}>
       <div className="flex justify-between items-start mb-4">
         <p className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-brand-red' : 'text-gray-400'}`}>{title}</p>
         {icon && <div className="p-2.5 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">{icon}</div>}
       </div>
       <h4 className={`text-3xl font-black tracking-tighter ${highlight ? 'text-gray-900' : 'text-gray-900'}`}>{value}</h4>
    </div>
  )
}

function groupAge(demoData: any[] = []) {
  if (!demoData?.length) return []
  const grouped: Record<string, number> = {}
  demoData.forEach(d => {
    grouped[d.age] = (grouped[d.age] || 0) + parseInt(d.reach)
  })
  return Object.keys(grouped).sort().map(age => ({ age, reach: grouped[age] }))
}
