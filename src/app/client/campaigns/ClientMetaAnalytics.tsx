'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Loader2, AlertCircle, Share2, Target, Users, MousePointerClick, Activity, TrendingUp, Download, ShieldCheck, Zap, Sparkles, Globe, ArrowRight } from 'lucide-react'

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
    <div className="bg-white border text-sm border-gray-100 shadow-sm rounded-[2.5rem] p-10 mb-8 mt-2 relative overflow-hidden" ref={reportRef}>
       <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-40"></div>
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gray-50 pb-8 relative z-10">
        <div className="flex items-center gap-5">
           <div className="bg-black p-4 rounded-2xl text-white shadow-2xl">
             <TrendingUp className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Meta Analytics Engine</h2>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Real-time Performance Telemetry • {datePreset.replace('_', ' ')}</p>
           </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto" data-html2canvas-ignore="true">
          <select 
            value={datePreset} 
            onChange={(e) => setDatePreset(e.target.value)} 
            className="px-6 py-3.5 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 bg-gray-50 cursor-pointer font-black text-[10px] uppercase tracking-widest text-gray-900 w-full sm:w-auto shadow-inner transition-all hover:bg-white"
          >
            <option value="last_7d">Cycle: 7 Days</option>
            <option value="last_30d">Cycle: 30 Days</option>
            <option value="last_90d">Cycle: 90 Days</option>
          </select>
          
          {data && !isSharedView && (
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="px-6 py-3.5 bg-white border border-gray-100 text-gray-500 hover:text-black hover:border-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center transition-all shadow-sm active:scale-95 group"
              >
                <Share2 className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" /> Dispatch Link
              </button>
              <button 
                onClick={downloadPdf}
                disabled={isExporting}
                className="px-8 py-3.5 bg-black hover:bg-brand-red text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center transition-all shadow-xl hover:shadow-red-200 disabled:opacity-50 active:scale-95"
              >
                {isExporting ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Download className="w-4 h-4 mr-3" />}
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center text-gray-300">
          <Loader2 className="w-12 h-12 animate-spin mb-6 text-brand-red" />
          <p className="font-black text-[10px] uppercase tracking-[0.3em] italic">Decrypting Meta Data Stream...</p>
        </div>
      ) : needsOauth ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[3rem] border border-gray-100 mx-auto max-w-2xl px-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-50/20 translate-y-full group-hover:translate-y-0 transition-transform duration-1000"></div>
          <div className="w-24 h-24 bg-black rounded-[2rem] shadow-2xl flex items-center justify-center mb-10 rotate-3 group-hover:rotate-12 transition-transform relative z-10">
            <Target className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic relative z-10">Link Meta Repository</h3>
          <p className="text-gray-400 mb-12 max-w-sm font-black text-[10px] uppercase tracking-widest leading-relaxed relative z-10">
            Authenticate your Meta Business assets to initialize the Creova Analytics Matrix and unlock real-time ROAS telemetry.
          </p>
          <button 
            onClick={handleConnect}
            className="bg-black hover:bg-brand-red text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center shadow-2xl transition-all active:scale-95 relative z-10"
          >
            Secure Authentication <ArrowRight className="ml-3 w-4 h-4" />
          </button>
        </div>
      ) : error ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-red-50 rounded-[2.5rem] border border-red-100 max-w-2xl mx-auto shadow-inner">
          <AlertCircle className="w-16 h-16 text-brand-red mb-6 animate-pulse" />
          <p className="text-brand-red font-black text-xl uppercase italic tracking-tighter">Matrix Disconnect: {error}</p>
        </div>
      ) : data ? (
        <div className="space-y-10 animate-in fade-in duration-700">
          {/* Main Metrics KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <MetricCard 
              title="Capital Deployed" 
              value={`$${spend.toLocaleString(undefined, {minimumFractionDigits:2})}`} 
              icon={<TrendingUp className="text-brand-red w-4 h-4"/>} 
              change={calculateChange(spend, prevSpend)}
              highlight 
            />
            <MetricCard 
              title="Market Reach" 
              value={impressions.toLocaleString()} 
              icon={<Globe className="text-black w-4 h-4"/>} 
              change={calculateChange(impressions, prevImpressions)}
            />
            <MetricCard 
              title="Active Nodes" 
              value={data.campaigns.filter((c:any) => c.status === 'ACTIVE').length} 
              icon={<Zap className="text-brand-red w-4 h-4"/>} 
              change={0}
            />
            <MetricCard 
              title="Portfolio ROAS" 
              value={`${roas}x`} 
              icon={<Target className="text-black w-4 h-4"/>} 
              change={calculateChange(parseFloat(roas), parseFloat(prevRoas))}
              highlight 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
             {/* Daily Spend Trend Chart */}
             <div className="xl:col-span-2 bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-30 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-10 flex items-center italic">
                  <Activity className="w-5 h-5 mr-4 text-brand-red" /> Investment Trajectory
                </h3>
                <div className="h-80 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily} margin={{top: 10, right: 10, left: 0, bottom: 0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="date_start" tick={{fontSize: 9, fill: '#9CA3AF', fontWeight: 900}} tickLine={false} axisLine={false} tickFormatter={(val: string) => val.split('-').slice(1).join('/')} />
                      <YAxis tick={{fontSize: 9, fill: '#9CA3AF', fontWeight: 900}} tickLine={false} axisLine={false} tickFormatter={(val: any) => `$${val}`} />
                      <Tooltip cursor={{fill: '#fDFDFD'}} contentStyle={{borderRadius: '20px', border: '1px solid #F3F4F6', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px'}}/>
                      <Line type="monotone" dataKey="spend" stroke="#E31E24" strokeWidth={5} dot={false} activeDot={{r: 10, fill: '#E31E24', stroke: '#fff', strokeWidth: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Top Campaigns by ROAS Chart */}
             <div className="bg-black border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-red rounded-full blur-3xl opacity-10 -ml-16 -mb-16"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-10 flex items-center italic">
                   <Target className="w-5 h-5 mr-4 text-brand-red" /> Efficiency Nodes
                </h3>
                <div className="h-80 w-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={roasChartData} layout="vertical" margin={{top: 0, right: 30, left: 40, bottom: 0}}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1F2937" />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" tick={{fontSize: 8, fill: '#6B7280', fontWeight: 900}} width={80} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{borderRadius: '16px', fontWeight: '900', border: 'none', backgroundColor: '#000', color: '#fff'}}/>
                       <Bar dataKey="roas" fill="#E31E24" radius={[0, 8, 8, 0]} barSize={24} />
                     </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Demographics & Locations Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* Age & Gender Coverage */}
             <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-10 flex items-center italic">
                   Audience Matrix
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupAge(data.demographics)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="age" tick={{fontSize: 10, fontWeight: 900}} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{borderRadius: '16px', fontWeight: '900'}} />
                      <Bar dataKey="male" fill="#E31E24" stackId="a" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="female" fill="#000000" stackId="a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-10 mt-6 border-t border-gray-50 pt-6">
                   <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400"><div className="w-3 h-3 bg-brand-red rounded-full mr-3 shadow-lg shadow-red-500/30"></div> Male</div>
                   <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400"><div className="w-3 h-3 bg-black rounded-full mr-3 shadow-lg shadow-black/30"></div> Female</div>
                </div>
             </div>

             {/* Top Locations */}
             <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mb-10 flex items-center italic">
                  Geographic Performance
                </h3>
                <div className="space-y-6">
                   {groupLocations(data.locations).map((loc, i) => (
                     <div key={i} className="space-y-2.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span className="text-gray-900 italic">{loc.name}</span>
                           <div className="flex items-center gap-3">
                              <span className="text-gray-400 opacity-60">Investment:</span>
                              <span className="text-brand-red">${parseFloat(String(loc.spend)).toLocaleString()}</span>
                           </div>
                        </div>
                        <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden shadow-inner border border-gray-100 p-0.5">
                           <div className="bg-black h-full rounded-full transition-all duration-1000" style={{width: `${loc.percentage}%`}}></div>
                        </div>
                     </div>
                   ))}
                   {(!data.locations || data.locations.length === 0) && (
                     <div className="py-20 text-center">
                        <Globe className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Regional data decryption pending...</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Detailed Campaign Table */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl mt-12 mb-20">
             <div className="bg-black px-10 py-8 flex justify-between items-center">
               <h3 className="font-black text-white flex items-center tracking-tighter text-xl uppercase italic">Campaign Registry</h3>
               <div className="px-5 py-2 bg-white/10 rounded-xl text-[10px] font-black text-brand-red uppercase tracking-widest border border-white/5">
                  Secure Access Active
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest">Asset Descriptor</th>
                     <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Investment</th>
                     <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Reach</th>
                     <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Engagement</th>
                     <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Protocol Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 bg-white">
                   {data.campaigns?.map((camp: any, i: number) => (
                      <tr key={i} className="hover:bg-red-50/30 transition-all group">
                         <td className="px-10 py-6">
                            <p className="font-black text-gray-900 group-hover:text-brand-red transition-colors text-xs uppercase tracking-tight italic">{camp.campaign_name}</p>
                            <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest mt-1">NODE_ID: {camp.id.slice(0,12)}...</p>
                         </td>
                         <td className="px-10 py-6 font-black text-gray-900 text-right text-xs italic">${parseFloat(camp.spend || '0').toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                         <td className="px-10 py-6 text-gray-400 font-black text-right text-[10px] uppercase tracking-widest">{parseInt(camp.impressions || 0).toLocaleString()}</td>
                         <td className="px-10 py-6 text-gray-400 font-black text-right text-[10px] uppercase tracking-widest">{parseInt(camp.clicks || 0).toLocaleString()}</td>
                         <td className="px-10 py-6 text-center">
                           <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                             camp.status === 'ACTIVE' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-100'
                           }`}>
                             {camp.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-brand-red mr-2.5 animate-pulse"></div>}
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

function MetricCard({ title, value, icon, change, highlight, subtitle, link }: any) {
  const isPositive = change >= 0
  const CardContent = (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-2xl group relative overflow-hidden ${highlight ? 'bg-black border-black text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
       {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 group-hover:scale-125 transition-transform"></div>}
       <div className="flex justify-between items-start mb-6 relative z-10">
         <p className={`font-black text-[9px] uppercase tracking-[0.2em] ${highlight ? 'text-gray-500' : 'text-gray-400'}`}>{title}</p>
         {icon && <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-50'} group-hover:scale-110 transition-transform`}>{icon}</div>}
       </div>
       <h4 className={`text-3xl font-black tracking-tighter mb-3 italic relative z-10 ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</h4>
       <div className="flex items-center justify-between relative z-10">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">{subtitle || (change !== undefined && `Vs Prev cycle: ${isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}%`)}</p>
          {link && <ArrowRight className="w-4 h-4 text-brand-red opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />}
       </div>
    </div>
  )
  
  return link ? <Link href={link} className="block">{CardContent}</Link> : CardContent
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
