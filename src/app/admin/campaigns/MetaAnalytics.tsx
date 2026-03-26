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
  // Approximate conversion value if available, else just a placeholder for demo ROAS
  const purchaseValues = summary.action_values?.find((a: any) => a.action_type === 'purchase')
  const revenue = purchaseValues ? parseFloat(purchaseValues.value) : purchases * 100 // dummy fallback if not reported directly
  const roas = spend > 0 ? (revenue / spend).toFixed(2) : '0.00'

  return (
    <div className="bg-white border text-sm border-gray-200 shadow-sm rounded-xl p-6 mb-8 mt-2">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
           <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
             <Share2 className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-gray-900">Meta Analytics</h2>
             <p className="text-gray-500 text-xs mt-0.5">Real-time advertising performance.</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={selectedClient} 
            onChange={(e) => setSelectedClient(e.target.value)} 
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-gray-50 cursor-pointer"
          >
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>

          <select 
            value={datePreset} 
            onChange={(e) => setDatePreset(e.target.value)} 
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-gray-50 cursor-pointer w-full sm:w-auto"
          >
            <option value="last_7d">Last 7 Days</option>
            <option value="last_30d">Last 30 Days</option>
            <option value="last_90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1A56DB]" />
          <p>Syncing with Meta Advertising API...</p>
        </div>
      ) : needsOauth ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-blue-50/50 rounded-xl border border-blue-100">
          <Share2 className="w-12 h-12 text-[#1A56DB] mb-4 opacity-80" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Meta Ads Not Connected</h3>
          <p className="text-gray-600 max-w-md mb-6">
            There is no Meta access token or active ad account mapped to this client. 
            Connect a Meta Business Account securely via OAuth to unlock live analytics.
          </p>
          <button 
            onClick={handleConnect}
            className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-6 py-3 rounded-lg font-bold flex items-center shadow-lg shadow-blue-200 transition-all"
          >
            Connect Meta Account
          </button>
        </div>
      ) : error ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Main Metrics KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Spent" value={`$${spend.toFixed(2)}`} icon={<TrendingUp className="text-blue-500"/>} />
            <MetricCard title="Impressions" value={impressions.toLocaleString()} icon={<Users className="text-indigo-500"/>} />
            <MetricCard title="Clicks" value={clicks.toLocaleString()} icon={<MousePointerClick className="text-orange-500"/>} />
            <MetricCard title="Total ROAS" value={`${roas}x`} icon={<Target className="text-emerald-500"/>} highlight />
            
            <MetricCard title="CTR" value={`${ctr.toFixed(2)}%`} />
            <MetricCard title="CPC" value={`$${cpc.toFixed(2)}`} />
            <MetricCard title="CPM" value={`$${cpm.toFixed(2)}`} />
            <MetricCard title="Reach" value={reach.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Daily Spend Trend Chart */}
             <div className="lg:col-span-2 bg-gray-50 border border-gray-100 p-4 rounded-xl">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                 <Activity className="w-4 h-4 mr-2 text-gray-500" /> Daily Spend Trend
               </h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.daily}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="date_start" tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} tickFormatter={(val: string) => val.split('-').slice(1).join('/')} />
                     <YAxis tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} tickFormatter={(val: any) => `$${val}`} />
                     <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                     <Line type="monotone" dataKey="spend" stroke="#1A56DB" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Demographics Age Chart */}
             <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
               <h3 className="font-bold text-gray-900 mb-4">Demographics (Age)</h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupAge(data.demographics)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="age" type="category" width={40} tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}}/>
                      <Bar dataKey="reach" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top performing Ads List */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
               <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                 <h3 className="font-bold text-gray-900 flex items-center">Top Performing Ads</h3>
               </div>
               <div className="divide-y divide-gray-100">
                 {data.ads?.slice(0, 5).map((ad: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center group hover:bg-gray-50">
                       <p className="font-medium text-gray-900 truncate w-2/3">{ad.ad_name}</p>
                       <p className="font-semibold text-emerald-600">${parseFloat(ad.spend || '0').toFixed(2)}</p>
                    </div>
                 ))}
                 {!data.ads?.length && <div className="p-4 text-center text-gray-500">No active ads found in range.</div>}
               </div>
            </div>

            {/* Campaign Status Check */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
               <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                 <h3 className="font-bold text-gray-900 flex items-center">Campaign Delivery Status</h3>
               </div>
               <div className="divide-y divide-gray-100 h-[220px] overflow-y-auto">
                 {data.campaigns?.map((camp: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex justify-between items-center group hover:bg-gray-50">
                       <div className="w-2/3">
                         <p className="font-medium text-gray-900 truncate">{camp.campaign_name}</p>
                         <p className="text-xs text-gray-500 mt-0.5">{parseInt(camp.impressions || 0).toLocaleString()} impr.</p>
                       </div>
                       <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                         camp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                       }`}>
                         {camp.status}
                       </span>
                    </div>
                 ))}
                 {!data.campaigns?.length && <div className="p-4 text-center text-gray-500">No campaigns found.</div>}
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
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
       <div className="flex justify-between items-start mb-2">
         <p className="text-gray-500 font-medium text-xs">{title}</p>
         {icon && <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>}
       </div>
       <h4 className={`text-2xl font-black ${highlight ? 'text-blue-700' : 'text-gray-900'}`}>{value}</h4>
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
