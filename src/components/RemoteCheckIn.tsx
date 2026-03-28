'use client'

import { useState } from 'react'
import { clockIn, clockOut, updateActivity } from '@/app/team/watch-actions'
import { PlayCircle, StopCircle, Activity, Check, Zap, Target } from 'lucide-react'

export default function RemoteCheckInWidget({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false)
  const [activityInput, setActivityInput] = useState(profile?.current_activity || '')

  const isOnline = profile?.is_online

  async function handleClockIn() {
    setLoading(true)
    const res = await clockIn()
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  async function handleClockOut() {
    setLoading(true)
    const res = await clockOut()
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  async function handleUpdateActivity(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await updateActivity(activityInput)
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  return (
    <div className={`bg-white border-b lg:border transition-all duration-500 lg:rounded-[2rem] shadow-2xl p-6 lg:mb-10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden ${isOnline ? 'border-red-100 ring-4 ring-red-50/30' : 'border-gray-200'}`}>
      {isOnline && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30 animate-pulse"></div>
      )}
      
      <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
        {isOnline ? (
          <button 
            disabled={loading}
            onClick={handleClockOut}
            className="group flex items-center px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-red transition-all shadow-xl shadow-gray-200 hover:shadow-red-200 active:scale-95 disabled:opacity-50"
          >
            <StopCircle className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
            Terminate Link
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={handleClockIn}
            className="group flex items-center px-8 py-4 bg-brand-red text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-200 hover:shadow-gray-200 active:scale-95 disabled:opacity-50"
          >
            <PlayCircle className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
            Establish Uplink
          </button>
        )}
        
        <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>

        <div>
           <div className="flex items-center gap-2 mb-1">
             <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-brand-red animate-ping' : 'bg-gray-300'}`} />
             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
               Operational Status: {isOnline ? <span className="text-gray-900">Uplink Active</span> : <span className="text-gray-400">Node Offline</span>}
             </div>
           </div>
          {isOnline && profile?.shift_start_time && (
            <div className="text-[10px] font-black text-gray-900 uppercase tracking-tight italic flex items-center">
              <Zap className="w-3 h-3 mr-1.5 text-brand-red" />
              Epoch Starts: {new Date(profile.shift_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {isOnline && (
        <form onSubmit={handleUpdateActivity} className="flex-1 w-full max-w-2xl flex items-center gap-3 relative z-10 transition-all">
          <div className="relative flex-1 group">
            <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-brand-red transition-colors" />
            <input 
              type="text" 
              placeholder="What is your current objective?"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50/50 text-[11px] font-bold uppercase tracking-tight border border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-50 focus:bg-white focus:border-red-100 focus:outline-none transition-all placeholder:text-gray-300"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || activityInput === profile?.current_activity}
            className="p-4 bg-black text-white rounded-2xl hover:bg-brand-red disabled:opacity-30 transition-all shadow-lg hover:shadow-red-200 active:scale-95"
            title="Commit Status"
          >
            <Check className="w-5 h-5 font-black" />
          </button>
        </form>
      )}
    </div>
  )
}
