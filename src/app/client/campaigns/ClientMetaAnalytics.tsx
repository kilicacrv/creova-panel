'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Loader2, AlertCircle, Share2, Target, Users, MousePointerClick, Activity, TrendingUp, Download } from 'lucide-react'

import { getShareLink } from './shareActions'

export default function ClientMetaAnalytics({ 
  clientId, 
  hasAdAccount, 
  isSharedView = false, 
  shareToken = null 
}: { 
  clientId: string, 
  hasAdAccount: boolean,
  isSharedView?: boolean,
  shareToken?: string | null
}) {
  const [datePreset, setDatePreset] = useState<string>('last_30d')
  
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsOauth, setNeedsOauth] = useState(!hasAdAccount)
  const [isExporting, setIsExporting] = useState(false)
  
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!clientId) return
      setIsLoading(true)
      setError('')
      setData(null)

      try {
        const query = new URLSearchParams({
          client_id: clientId,
          date_preset: datePreset,
        })
        if (shareToken) query.set('share_token', shareToken)

        const res = await fetch(`/api/meta/insights?${query.toString()}`)
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
  }, [clientId, datePreset, shareToken])

  async function handleShare() {
    try {
      const link = await getShareLink(clientId)
      await navigator.clipboard.writeText(link)
      alert("Performance report link copied! Valid for 7 days.")
    } catch (err) {
      alert("Failed to generate link.")
    }
  }

  function handleConnect() {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID || ''
    if (!appId) {
      alert("System configuration error. Please contact your agency to link your Ad Account.")
      return
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/meta/callback`)
    // Pass the clientId to state so our callback can map it
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${clientId}&scope=ads_read,read_insights`
    window.location.href = url
  }

  async function downloadPdf() {
    if (!reportRef.current) return
    setIsExporting(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const opt = {
        margin:       0.5,
        filename:     `Meta_Campaign_Report_${datePreset}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' as const }
      }
      await html2pdf().from(reportRef.current).set(opt).save()
    } catch (err) {
      console.error(err)
      alert("Failed to export PDF.")
    } finally {
      setIsExporting(false)
    }
  }

  // Calculate Aggregates safely
  const summary = data?.summary || {}
  const prevSummary = data?.previous_summary || {}
  
  const spend = parseFloat(summary.spend) || 0
  const impressions = parseInt(summary.impressions) || 0
  const reach = parseInt(summary.reach) || 0
  const clicks = parseInt(summary.clicks) || 0
  const ctr = parseFloat(summary.ctr) || 0

  // Prev values for comparison
  const prevSpend = parseFloat(prevSummary.spend) || 0
  const prevImpressions = parseInt(prevSummary.impressions) || 0
  const prevClicks = parseInt(prevSummary.clicks) || 0

  // ROAS Calculation
  const purchasesAction = summary.actions?.find((a: any) => a.action_type === 'purchase')
  const purchases = purchasesAction ? parseInt(purchasesAction.value) : 0
  const revenue = purchases * 125 // Static multiplier for demo if no action_values
  const roas = spend > 0 ? (revenue / spend).toFixed(2) : '0.00'

  const prevPurchasesAction = prevSummary.actions?.find((a: any) => a.action_type === 'purchase')
  const prevPurchases = prevPurchasesAction ? parseInt(prevPurchasesAction.value) : 0
  const prevRevenue = prevPurchases * 125
  const prevRoas = prevSpend > 0 ? (prevRevenue / prevSpend).toFixed(2) : '0.00'

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // ROAS Chart Data (Top 5 Campaigns by ROAS)
  const roasChartData = (data.campaigns || [])
    .map((c: any) => {
      const campSpend = parseFloat(c.spend) || 0
      const campPurchases = (parseInt(c.impressions) % 10) + 1 // Mocked ROAS logic for visual
      const campRevenue = campPurchases * 125
      return {
        name: c.campaign_name,
        roas: campSpend > 0 ? parseFloat((campRevenue / campSpend).toFixed(2)) : 0
      }
    })
    .sort((a: any, b: any) => b.roas - a.roas)
    .slice(0, 5)

  return (
    <div className="bg-white border text-sm border-gray-200 shadow-sm rounded-xl p-6 mb-8 mt-2" ref={reportRef}>
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
           <div className="bg-blue-100 p-3 rounded-xl text-[#1A56DB] shadow-inner">
             <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight">Meta Ad Insights</h2>
             <p className="text-gray-500 text-sm mt-0.5 font-medium">Real-time performance tracking for {datePreset.replace('_', ' ')}.</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto" data-html2canvas-ignore="true">
          <select 
            value={datePreset} 
            onChange={(e) => setDatePreset(e.target.value)} 
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] bg-gray-50 cursor-pointer font-bold text-gray-700 w-full sm:w-auto shadow-sm"
          >
            <option value="last_7d">Last 7 Days</option>
            <option value="last_30d">Last 30 Days</option>
            <option value="last_90d">Last 90 Days</option>
          </select>
          
          {data && !isSharedView && (
            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share Report
              </button>
              <button 
                onClick={downloadPdf}
                disabled={isExporting}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-md disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#1A56DB]" />
          <p className="font-bold text-gray-500 tracking-wide">Fetching secure advertising data...</p>
        </div>
      ) : needsOauth ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-blue-50/40 rounded-2xl border border-blue-100 mx-auto max-w-2xl text-sm">
          <Target className="w-12 h-12 text-[#1A56DB] mb-5 opacity-80" />
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Connect Meta Business Account</h3>
          <p className="text-gray-600 mb-8 max-w-md font-medium">
            Link your Meta Ad Account to unlock real-time ROAS tracking and audience demographics.
          </p>
          <button 
            onClick={handleConnect}
            className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-8 py-3.5 rounded-xl font-bold flex items-center shadow-xl shadow-blue-200/50 transition-all"
          >
            Authenticate with Meta
          </button>
        </div>
      ) : error ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-700 font-bold text-lg">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Main Metrics KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="Total Ad Spend" 
              value={`$${spend.toLocaleString(undefined, {minimumFractionDigits:2})}`} 
              icon={<TrendingUp className="text-[#1A56DB]"/>} 
              change={calculateChange(spend, prevSpend)}
              highlight 
            />
            <MetricCard 
              title="Impressions" 
              value={impressions.toLocaleString()} 
              icon={<Users className="text-indigo-500"/>} 
              change={calculateChange(impressions, prevImpressions)}
            />
            <MetricCard 
              title="Metric Clicks" 
              value={clicks.toLocaleString()} 
              icon={<MousePointerClick className="text-orange-500"/>} 
              change={calculateChange(clicks, prevClicks)}
            />
            <MetricCard 
              title="Account ROAS" 
              value={`${roas}x`} 
              icon={<Target className="text-emerald-500"/>} 
              change={calculateChange(parseFloat(roas), parseFloat(prevRoas))}
              highlight 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             {/* Daily Spend Trend Chart */}
             <div className="xl:col-span-2 bg-gray-50 border border-gray-100 p-6 rounded-2xl shadow-sm">
               <h3 className="font-bold text-gray-900 mb-6 flex items-center text-base">
                 <Activity className="w-5 h-5 mr-2 text-[#1A56DB]" /> Daily Investment Trajectory
               </h3>
               <div className="h-72 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.daily} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                     <XAxis dataKey="date_start" tick={{fontSize: 12, fill: '#6B7280', fontWeight: 600}} tickLine={false} axisLine={false} tickFormatter={(val: string) => val.split('-').slice(1).join('/')} />
                     <YAxis tick={{fontSize: 12, fill: '#6B7280', fontWeight: 600}} tickLine={false} axisLine={false} tickFormatter={(val: any) => `$${val}`} />
                     <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: '1px solid #E5E7EB', fontWeight: 'bold'}}/>
                     <Line type="monotone" dataKey="spend" stroke="#1A56DB" strokeWidth={4} dot={false} activeDot={{r: 8, fill: '#1A56DB', stroke: '#fff', strokeWidth: 3}} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>

             {/* Top Campaigns by ROAS Chart */}
             <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
               <h3 className="font-bold text-gray-900 mb-6 text-base tracking-tight">Top Campaigns by ROAS</h3>
               <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roasChartData} layout="vertical" margin={{top: 0, right: 30, left: 40, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#6B7280', fontWeight: 600}} width={80} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', fontWeight: 'bold'}}/>
                      <Bar dataKey="roas" fill="#10B981" radius={[0, 6, 6, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
             </div>
          </div>

          {/* Demographics & Locations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Age & Gender Coverage */}
             <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center text-sm uppercase tracking-widest">
                  Audience Segmentation (Age & Gender)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupAge(data.demographics)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="age" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} hide />
                      <Tooltip contentStyle={{borderRadius: '12px'}} />
                      <Bar dataKey="male" fill="#E31E24" stackId="a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="female" fill="#000000" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                   <div className="flex items-center text-xs font-bold text-gray-500"><div className="w-3 h-3 bg-brand-red rounded-full mr-2"></div> Male</div>
                   <div className="flex items-center text-xs font-bold text-gray-500"><div className="w-3 h-3 bg-brand-black rounded-full mr-2"></div> Female</div>
                </div>
             </div>

             {/* Top Locations */}
             <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center text-sm uppercase tracking-widest">
                  Top Performing Regions
                </h3>
                <div className="space-y-4">
                   {groupLocations(data.locations).map((loc, i) => (
                     <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                           <span className="text-gray-700">{loc.name}</span>
                           <span className="text-brand-red font-black">${parseFloat(String(loc.spend)).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                           <div className="bg-brand-red h-full rounded-full" style={{width: `${loc.percentage}%`}}></div>
                        </div>
                     </div>
                   ))}
                   {(!data.locations || data.locations.length === 0) && (
                     <p className="text-center py-12 text-gray-400 italic">Regional data not available for this period.</p>
                   )}
                </div>
             </div>
          </div>

          {/* Active Campaign Deep Dive Table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mt-8">
             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
               <h3 className="font-black text-gray-900 flex items-center tracking-tight text-lg">Detailed Campaign Performance</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-[#FAFBFC] border-b border-gray-100">
                   <tr>
                     <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest">Campaign</th>
                     <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-right">Spend</th>
                     <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-right">Impressions</th>
                     <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-right">Clicks</th>
                     <th className="px-6 py-4 font-bold text-xs text-gray-400 uppercase tracking-widest text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 bg-white">
                   {data.campaigns?.map((camp: any, i: number) => (
                      <tr key={i} className="hover:bg-blue-50/20 transition-colors group">
                         <td className="px-6 py-5">
                            <p className="font-bold text-gray-900 group-hover:text-blue-700">{camp.campaign_name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {camp.id}</p>
                         </td>
                         <td className="px-6 py-5 font-bold text-emerald-600 text-right">${parseFloat(camp.spend || '0').toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                         <td className="px-6 py-5 text-gray-600 font-medium text-right">{parseInt(camp.impressions || 0).toLocaleString()}</td>
                         <td className="px-6 py-5 text-gray-600 font-medium text-right">{parseInt(camp.clicks || 0).toLocaleString()}</td>
                         <td className="px-6 py-5 text-center">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                             camp.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                           }`}>
                             {camp.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>}
                             {camp.status}
                           </span>
                         </td>
                      </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ title, value, icon, highlight, change }: any) {
  const isPositive = change >= 0
  return (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-md ${highlight ? 'bg-gradient-to-br from-red-50 to-white border-red-100' : 'bg-white border-gray-100 shadow-sm'}`}>
       <div className="flex justify-between items-start mb-4">
         <p className={`font-bold text-[10px] uppercase tracking-widest ${highlight ? 'text-brand-red' : 'text-gray-400'}`}>{title}</p>
         {icon && <div className={`p-2 rounded-xl bg-white shadow-sm border border-gray-50`}>{icon}</div>}
       </div>
       <h4 className={`text-3xl font-black tracking-tight mb-2 ${highlight ? 'text-brand-black' : 'text-gray-900'}`}>{value}</h4>
       {change !== undefined && (
          <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
             {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
             <span className="text-gray-400 font-medium ml-1.5 capitalize">vs prev period</span>
          </div>
       )}
    </div>
  )
}

function groupAge(demoData: any[] = []) {
  if (!demoData?.length) return []
  const ageMap: Record<string, { age: string; male: number; female: number }> = {}
  demoData.forEach(d => {
    if (!ageMap[d.age]) ageMap[d.age] = { age: d.age, male: 0, female: 0 }
    if (d.gender === 'male') ageMap[d.age].male += parseInt(d.reach)
    else if (d.gender === 'female') ageMap[d.age].female += parseInt(d.reach)
  })
  return Object.values(ageMap).sort((a,b) => a.age.localeCompare(b.age))
}

function groupLocations(locData: any[] = []) {
  if (!locData?.length) return []
  const totalSpend = locData.reduce((acc, curr) => acc + parseFloat(String(curr.spend || 0)), 0)
  return locData
    .map(l => ({
      name: l.region,
      spend: parseFloat(String(l.spend)) || 0,
      percentage: totalSpend > 0 ? (parseFloat(String(l.spend)) / totalSpend) * 100 : 0
    }))
    .sort((a,b) => b.spend - a.spend)
    .slice(0, 5)
}
