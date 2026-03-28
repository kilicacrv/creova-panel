'use client'

import { useEffect, useState } from 'react'
import { Activity, Clock, Monitor, User, MessageSquare, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'

type Profile = {
  id: string
  full_name: string | null
  role: string | null
  is_online: boolean
  current_activity: string | null
  shift_start_time: string | null
}

export default function WatchPanel({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [now, setNow] = useState(new Date())

  // Refresh current time every minute for duration calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formatDuration = (startString: string | null) => {
    if (!startString) return ''
    const start = new Date(startString)
    const diffMs = now.getTime() - start.getTime()
    if (diffMs < 0) return '0h 0m'
    const hours = Math.floor(diffMs / 3600000)
    const mins = Math.floor((diffMs % 3600000) / 60000)
    return `${hours}h ${mins}m`
  }

  const onlineUsers = profiles.filter(p => p.is_online)
  const offlineUsers = profiles.filter(p => !p.is_online)

  return (
    <div className="space-y-8">
      {/* Top Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center group hover:shadow-xl transition-all">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-black group-hover:text-white transition-all shadow-inner">
            <Monitor className="w-8 h-8" />
          </div>
          <div className="text-4xl font-bold text-gray-900 tracking-tight">{profiles.length}</div>
          <div className="text-[10px] font-semibold text-sm text-gray-400 mt-2">Total Team Nodes</div>
        </div>
        
        <div className="bg-red-50/50 rounded-xl border border-red-50 p-8 flex flex-col items-center group hover:shadow-2xl hover:shadow-blue-100 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full blur-2xl -mr-12 -mt-12 opacity-50"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-ping mb-6" />
          <div className="text-4xl font-bold text-blue-600 tracking-tight">{onlineUsers.length}</div>
          <div className="text-[10px] font-semibold text-sm text-red-400 mt-2">Active Live Uplinks</div>
        </div>

        <div className="bg-black rounded-xl p-8 flex flex-col items-center group hover:bg-[#0a0a0a] transition-all border border-gray-900 shadow-2xl">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-gray-600 mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8" />
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{offlineUsers.length}</div>
          <div className="text-[10px] font-semibold text-sm text-gray-500 mt-2">Offline Nodes</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-12 mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-bold">Live Presence Grid</h2>
          <p className="text-[10px] font-semibold text-sm text-gray-400 mt-1">Real-time Agency Operational Awareness</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-red-50 text-blue-600 text-[10px] font-semibold text-sm rounded-lg border border-red-100 ring-4 ring-red-50/50 animate-pulse">Live Feed</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {profiles.map(p => (
          <div key={p.id} className={`rounded-xl border p-6 transition-all relative group shadow-sm ${
            p.is_online 
              ? 'bg-white border-red-100 ring-4 ring-red-50/30 hover:shadow-2xl hover:shadow-blue-100' 
              : 'bg-gray-50/50 border-gray-100 grayscale hover:grayscale-0 opacity-80 hover:opacity-100'
          }`}>
            <div className="absolute top-6 right-6 flex gap-2">
               <Link 
                  href="/admin/messages" 
                  className="p-2 text-gray-400 bg-white border border-gray-100 hover:text-blue-600 hover:border-red-100 hover:shadow-lg rounded-xl transition-all"
                  title="Direct Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                {p.is_online ? (
                  <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-red-100 shadow-lg shadow-blue-200" />
                ) : (
                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                )}
            </div>

            <div className="flex flex-col items-center pt-4 mb-8">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 shadow-inner ${
                p.is_online ? 'bg-red-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white ring-1 ring-red-100' : 'bg-white text-gray-400 border border-gray-100'
              }`}>
                <User className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-gray-900 uppercase tracking-tight text-lg text-center leading-tight">
                {p.full_name || 'Generic ID'}
              </h3>
              <div className="flex items-center mt-2 group-hover:mt-1 transition-all">
                {p.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1.5 text-black" />}
                <span className={`text-[10px] uppercase font-bold tracking-normal px-2.5 py-1 rounded-lg border ${
                  p.role === 'admin' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {p.role}
                </span>
              </div>
            </div>

            {p.is_online ? (
              <div className="space-y-4">
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors duration-500">
                  <div className="flex items-center text-[9px] font-bold text-gray-400 uppercase tracking-normal mb-2 opacity-60">
                    <Activity className="w-3.5 h-3.5 mr-2 text-blue-600" />
                    Operational Node
                  </div>
                  <div className="text-xs font-bold text-gray-900 break-words leading-relaxed group-hover:text-blue-600 transition-colors capitalize">
                    {p.current_activity?.toLowerCase() || <span className="text-gray-300 italic font-medium">Idle standby mode...</span>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center text-[9px] font-semibold text-sm text-gray-400">
                    <Clock className="w-3 h-3 mr-1.5" />
                    Session
                  </div>
                  <span className="text-blue-600 text-[10px] font-bold font-mono">
                    {formatDuration(p.shift_start_time)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-100/30 rounded-2xl border border-dashed border-gray-200">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-normal">Node Offline</p>
              </div>
            )}
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white border border-dashed border-gray-200 rounded-xl">
             <div className="text-[10px] font-semibold text-sm text-gray-300">Registry integrity compromised: Zero personnel nodes identified.</div>
          </div>
        )}
      </div>
    </div>
  )
}
