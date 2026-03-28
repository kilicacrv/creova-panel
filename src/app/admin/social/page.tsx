import { TrendingUp, Activity, Users, MessageCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Share2, Heart, Award, Zap, Target, Sparkles, Globe, ShieldCheck, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SocialListeningPage() {
  const mockBrands = [
    { id: '1', name: 'Creova Agency', mentions: '2.4k', sentiment: 84, trend: 'up' },
    { id: '2', name: 'TechCorp SAAS', mentions: '850', sentiment: 62, trend: 'down' },
    { id: '3', name: 'Luxury Watches', mentions: '12k', sentiment: 91, trend: 'up' }
  ]

  const mockMentions = [
    { 
      id: 1, 
      user: '@marketingpro', 
      platform: 'Twitter', 
      text: "Just signed with Creova. Absolute game changer for our Q3 digital strategy! 🚀", 
      sentiment: 'positive',
      time: '12 mins ago'
    },
    { 
      id: 2, 
      user: 'Sarah Jenkins', 
      platform: 'LinkedIn', 
      text: "Does anyone know a good agency for B2B tech? I checked out Creova but waiting to hear back.", 
      sentiment: 'neutral',
      time: '1 hour ago'
    },
    { 
      id: 3, 
      user: '@angrycustomer', 
      platform: 'Twitter', 
      text: "TechCorp SAAS UI update is completely broken on Safari. Going to refund.", 
      sentiment: 'negative',
      time: '3 hours ago'
    },
    { 
      id: 4, 
      user: 'WatchGeek', 
      platform: 'Instagram', 
      text: "The new Luxury Watches diver collection drops tomorrow. I am HYPED.", 
      sentiment: 'positive',
      time: '5 hours ago'
    }
  ]

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-bold flex items-center">
            <Activity className="w-8 h-8 mr-4 text-blue-600 animate-pulse" />
            Social Listening
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mt-1">Real-time Brand Sentiment Decryption</p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-red-50 rounded-xl border border-red-100">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-normal">AI Assistant Offline</span>
          </div>
          <button className="bg-black hover:bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-semibold text-sm transition-all shadow-xl active:scale-95">
            Sync Integrations
          </button>
        </div>
      </div>

      <div className="bg-black text-white p-8 rounded-xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10 flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mr-6 shrink-0 shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-bold uppercase tracking-tight italic mb-1">Simulated Grid Active</h3>
            <p className="text-[10px] font-semibold text-sm text-gray-400 opacity-80 leading-relaxed max-w-2xl">
              Currently operating in diagnostic preview mode. Live intercept of Twitter/X, Instagram, and LinkedIn frequencies requires API clearance in the Command Environment.
            </p>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:rotate-3 transition-all border border-gray-100 group-hover:border-transparent">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
               <ArrowUpRight className="w-3 h-3 mr-1" /> 14%
            </span>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mb-1">Mentions</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight font-bold">15.2k</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:rotate-3 transition-all border border-gray-100 group-hover:border-transparent">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
               <ArrowUpRight className="w-3 h-3 mr-1" /> 8%
            </span>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mb-1">Unique Sources</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight font-bold">8,432</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:rotate-3 transition-all border border-gray-100 group-hover:border-transparent">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-blue-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
               <ArrowDownRight className="w-3 h-3 mr-1" /> 2%
            </span>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mb-1">Potential Radius</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight font-bold">1.2M</p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all group hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:rotate-3 transition-all border border-gray-100 group-hover:border-transparent">
              <Heart className="w-6 h-6" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
               <ArrowUpRight className="w-3 h-3 mr-1" /> 5%
            </span>
          </div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mb-1">Sentiment</h3>
          <p className="text-3xl font-bold text-gray-900 tracking-tight font-bold">76%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Tracked Brands */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 uppercase tracking-tight italic text-xl">Monitoring Grid</h3>
            <button className="text-blue-600 text-[10px] font-semibold text-sm hover:underline transition-all">Optimize</button>
          </div>
          <div className="divide-y divide-gray-50 flex-grow">
            {mockBrands.map(brand => (
              <div key={brand.id} className="p-8 hover:bg-red-50/20 transition-all cursor-pointer flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{brand.name}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-normal mt-1.5">{brand.mentions} frequency hits</p>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-semibold text-sm flex items-center justify-end ${brand.sentiment > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {brand.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {brand.sentiment}% Pos
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 bg-gray-50 border-t border-gray-50 text-center">
            <button className="text-[10px] font-semibold text-sm text-gray-400 hover:text-black transition-all flex items-center justify-center w-full group">
               <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
               Add Tracker
            </button>
          </div>
        </div>

        {/* Live Mentions Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping mr-4" />
              <h3 className="font-bold text-gray-900 uppercase tracking-tight italic text-xl flex items-center">
                 Listening Feed
              </h3>
            </div>
            <div className="flex gap-3">
              {['ALL', 'POS', 'NEG'].map(f => (
                <span key={f} className={`px-5 py-2.5 rounded-xl border text-[9px] font-bold tracking-normal cursor-pointer transition-all ${f === 'ALL' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-400 border-gray-100 hover:text-black'}`}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {mockMentions.map(mention => (
              <div key={mention.id} className="p-10 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white group-hover:rotate-3 transition-all mr-5">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{mention.user}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-normal mt-1.5 flex items-center">
                        <Globe className="w-3 h-3 mr-2 opacity-30" />
                        {mention.platform} / {mention.time}
                      </p>
                    </div>
                  </div>
                  <div>
                    {mention.sentiment === 'positive' && <span className="text-[8px] uppercase font-bold tracking-normal text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">POS_NEURAL</span>}
                    {mention.sentiment === 'negative' && <span className="text-[8px] uppercase font-bold tracking-normal text-blue-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg animate-pulse">NEG_THREAT</span>}
                    {mention.sentiment === 'neutral' && <span className="text-[8px] uppercase font-bold tracking-normal text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">NEUTRAL</span>}
                  </div>
                </div>
                <div className="ml-[76px]">
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-tight leading-relaxed italic border-l-4 border-gray-100 pl-6 group-hover:border-blue-600 transition-all">
                    "{mention.text}"
                  </p>
                  <div className="flex gap-6 mt-8">
                    <button className="text-[9px] font-semibold text-sm text-gray-400 hover:text-black flex items-center border-b border-transparent hover:border-black transition-all pb-1">
                      <MessageCircle className="w-3.5 h-3.5 mr-2" />
                      Reply Internally
                    </button>
                    <button className="text-[9px] font-semibold text-sm text-gray-400 hover:text-blue-600 flex items-center border-b border-transparent hover:border-blue-600 transition-all pb-1">
                      <AlertTriangle className="w-3.5 h-3.5 mr-2" />
                      Flag as Urgent
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-10 border-t border-gray-50 text-center bg-gray-50/30 group/more">
            <button className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center w-full">
               LOAD MORE FREQUENCIES
               <ArrowUpRight className="ml-3 w-4 h-4 group-hover/more:translate-x-1 group-hover/more:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
