'use client'

import { useEffect, useState } from 'react'
import { Activity, Clock, Monitor, User } from 'lucide-react'

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

  // In a real application, you would set up a Supabase Realtime subscription here 
  // to listen for updates on the `profiles` table.
  // Example pseudo-code for realtime:
  // useEffect(() => {
  //   const channel = supabase.channel('online-users')
  //     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
  //       setProfiles(prev => prev.map(p => p.id === payload.new.id ? payload.new as Profile : p))
  //     }).subscribe()
  //   return () => supabase.removeChannel(channel)
  // }, [])

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
          <Monitor className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-3xl font-bold text-gray-900">{profiles.length}</div>
          <div className="text-sm font-medium text-gray-500">Total Team Members</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-6 flex flex-col justify-center items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse mb-3" />
          <div className="text-3xl font-bold text-green-700">{onlineUsers.length}</div>
          <div className="text-sm font-medium text-green-600">Currently Online</div>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col justify-center items-center">
          <User className="w-8 h-8 text-gray-400 mb-2" />
          <div className="text-3xl font-bold text-gray-700">{offlineUsers.length}</div>
          <div className="text-sm font-medium text-gray-500">Offline</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">Live Team Grid</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profiles.map(p => (
          <div key={p.id} className={`rounded-xl border p-5 shadow-sm transition-all ${
            p.is_online ? 'bg-white border-green-200 ring-1 ring-green-100 hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-75'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1" title={p.full_name || 'Unknown'}>
                    {p.full_name || 'Anonymous'}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.role}
                  </span>
                </div>
              </div>
              {p.is_online ? (
                <span className="w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100" title="Online" />
              ) : (
                <span className="w-3 h-3 bg-gray-300 rounded-full" title="Offline" />
              )}
            </div>

            {p.is_online ? (
              <div className="space-y-4 mt-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <Activity className="w-3.5 h-3.5 mr-1.5" />
                    Current Activity
                  </div>
                  <div className="text-sm font-medium text-gray-900 break-words">
                    {p.current_activity || <span className="text-gray-400 italic">No activity logged yet...</span>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Shift Duration
                  </div>
                  <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {formatDuration(p.shift_start_time)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-center py-6 text-sm text-gray-400 italic">
                Currently offline
              </div>
            )}
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-xl">
             No team members found. Roles need to be assigned to users first.
          </div>
        )}
      </div>
    </div>
  )
}
