import { TrendingUp, Activity, Users, MessageCircle, AlertTriangle, ArrowUpRight, ArrowDownRight, Share2, Heart, Award } from 'lucide-react'

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
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-[#1A56DB]" />
            Social Listening Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor brand reputation, track mentions across social platforms, and analyze audience sentiment in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded border border-yellow-200 uppercase flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            API Not Connected
          </span>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Integration Settings
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex items-start">
        <Activity className="w-5 h-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-blue-900 mb-1">Preview Mode</h3>
          <p className="text-xs text-blue-800">
            This dashboard is currently displaying sample data. To activate live social listening across Twitter/X, Instagram, LinkedIn, and Web Forums, you must connect a supported integration provider (like Mention API or Sprout Social) in the agency environment settings.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 14.5%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Mentions</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">15.2k</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 8.1%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Unique Authors</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">8,432</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> 2.4%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Potential Reach</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">1.2M</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Heart className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5.2%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Net Sentiment Score</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">76 / 100</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Tracked Clients List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Tracked Brands</h3>
            <button className="text-[#1A56DB] text-xs font-medium hover:underline">Manage</button>
          </div>
          <div className="divide-y divide-gray-100 flex-grow">
            {mockBrands.map(brand => (
              <div key={brand.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">{brand.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{brand.mentions} mentions</p>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold flex items-center justify-end ${brand.sentiment > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                    {brand.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {brand.sentiment}% Positivity
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
            <button className="text-sm font-medium text-gray-600 hover:text-gray-900">+ Add Brand Tracker</button>
          </div>
        </div>

        {/* Live Mentions Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-indigo-600" />
              Live Mentions Feed
            </h3>
            <div className="flex gap-2 text-xs font-medium">
              <span className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-700 cursor-pointer shadow-sm">All</span>
              <span className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-700 cursor-pointer shadow-sm">Positive</span>
              <span className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-700 cursor-pointer shadow-sm">Negative</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {mockMentions.map(mention => (
              <div key={mention.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 mr-3"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{mention.user}</p>
                      <p className="text-xs text-gray-500">{mention.platform} • {mention.time}</p>
                    </div>
                  </div>
                  <div>
                    {mention.sentiment === 'positive' && <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Positive</span>}
                    {mention.sentiment === 'negative' && <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full border border-red-200">Negative</span>}
                    {mention.sentiment === 'neutral' && <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Neutral</span>}
                  </div>
                </div>
                <p className="text-sm text-gray-800 ml-11">
                  {mention.text}
                </p>
                <div className="ml-11 flex gap-3 mt-3">
                  <button className="text-xs font-medium text-gray-500 hover:text-[#1A56DB] flex items-center">
                    Reply Internally
                  </button>
                  <button className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center">
                    Flag as Urgent
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 text-center text-sm text-[#1A56DB] hover:underline cursor-pointer bg-gray-50">
            Load More Mentions
          </div>
        </div>

      </div>

    </div>
  )
}
