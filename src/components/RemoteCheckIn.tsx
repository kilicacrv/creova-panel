'use client'

import { useState } from 'react'
import { clockIn, clockOut, updateActivity } from '@/app/team/watch-actions'
import { PlayCircle, StopCircle, Activity, Check } from 'lucide-react'

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
    <div className="bg-white border-b lg:border border-gray-200 lg:rounded-xl shadow-sm p-4 lg:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {isOnline ? (
          <button 
            disabled={loading}
            onClick={handleClockOut}
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Clock Out
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={handleClockIn}
            className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Clock In
          </button>
        )}
        
        <div>
          <div className="text-sm font-semibold text-gray-900 flex items-center">
            Status: {isOnline ? <span className="text-green-600 ml-1">Online</span> : <span className="text-gray-500 ml-1">Offline</span>}
          </div>
          {isOnline && profile?.shift_start_time && (
            <div className="text-xs text-gray-500">
              Shift started at {new Date(profile.shift_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {isOnline && (
        <form onSubmit={handleUpdateActivity} className="flex-1 w-full sm:max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="What are you working on right now?"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A56DB] focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || activityInput === profile?.current_activity}
            className="p-2 bg-[#1A56DB] text-white rounded-lg hover:bg-[#1e4eb8] disabled:opacity-50 transition-colors"
            title="Update Activity"
          >
            <Check className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  )
}
