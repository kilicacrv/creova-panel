'use client'

import { useState } from 'react'
import { Settings, Shield, User, Building2, Plus, FileText, CheckSquare, AlertCircle, ArrowRight, Zap, Target, Lock } from 'lucide-react'
import { updateUserRole } from './actions'
import Link from 'next/link'

type Profile = {
  id: string
  full_name: string | null
  role: string | null
  created_at: string
}

export default function ManagementPanel({ profiles }: { profiles: Profile[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  async function handleRoleChange(userId: string, newRole: string) {
    if (!confirm(`Change role to ${newRole.toUpperCase()}?`)) return
    
    setError('')
    setLoadingId(userId)
    const result = await updateUserRole(userId, newRole)
    if (result?.error) {
       setError(result.error)
    } else {
       window.location.reload()
    }
    setLoadingId(null)
  }

  return (
    <div className="space-y-12">
      {error && (
        <div className="bg-red-50 text-brand-red p-6 rounded-[2rem] flex items-center border border-red-100 animate-in shake-200">
          <AlertCircle className="w-6 h-6 mr-4 shrink-0" />
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-widest">System Override Error</span>
             <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Quick Actions GRID */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tighter uppercase italic flex items-center">
            <Settings className="w-8 h-8 mr-4 text-brand-red" />
            Core Directives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/admin/clients" className="flex items-center p-8 rounded-[2rem] border border-gray-50 bg-gray-50/30 hover:border-black hover:bg-white transition-all group shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 mr-6 group-hover:bg-black group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-gray-900 text-xs uppercase tracking-tight mb-1">Hub Management</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Registry / Modify Clients</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-gray-200 group-hover:text-brand-red transition-colors" />
            </Link>
            
            <Link href="/admin/invoices" className="flex items-center p-8 rounded-[2rem] border border-gray-50 bg-gray-50/30 hover:border-black hover:bg-white transition-all group shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 mr-6 group-hover:bg-black group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-gray-900 text-xs uppercase tracking-tight mb-1">Financial Uplink</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Initialize Billing Cycle</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-gray-200 group-hover:text-brand-red transition-colors" />
            </Link>

            <Link href="/admin/tasks" className="flex items-center p-8 rounded-[2rem] border border-gray-50 bg-gray-50/30 hover:border-black hover:bg-white transition-all group shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 mr-6 group-hover:bg-black group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-gray-900 text-xs uppercase tracking-tight mb-1">Mission Control</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deploy Operator Tasks</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-gray-200 group-hover:text-brand-red transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* Role Management TABLE */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="p-10 lg:p-14 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center uppercase tracking-tighter italic">
              <Shield className="w-7 h-7 mr-4 text-brand-red" />
              Access Protocol Matrix
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 ml-11">Personnel Clearance & Identity Registry</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Biometric Auth Active</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-white border-b border-gray-50">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Profile / Node</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Clearance</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Genesis Joined</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Modify Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-red-50/20 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mr-5 group-hover:bg-black group-hover:text-white group-hover:rotate-3 transition-all border border-gray-100 group-hover:border-transparent">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-sm uppercase tracking-tight group-hover:text-brand-red transition-colors">
                          {profile.full_name || 'ANONYMOUS_RECRUIT'}
                        </div>
                        <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">NODE_UID: {profile.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      profile.role === 'admin' ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 
                      profile.role === 'team' ? 'bg-red-50 text-brand-red border-red-100' : 
                      profile.role === 'client' ? 'bg-gray-50 text-gray-900 border-gray-200' : 'bg-gray-50 text-gray-300 border-gray-100 italic'
                    }`}>
                      {profile.role || 'no_clearance'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="relative inline-block group/select">
                      <select
                        disabled={loadingId === profile.id}
                        value={profile.role || 'none'}
                        onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                        className="text-[9px] font-black uppercase tracking-widest border border-gray-100 rounded-xl px-5 py-3 focus:outline-none focus:ring-8 focus:ring-red-50 focus:border-red-100 bg-white cursor-pointer disabled:opacity-30 transition-all appearance-none pr-10 hover:border-black"
                      >
                        <option value="none">NULL / NONE</option>
                        <option value="client">CLIENT HUB</option>
                        <option value="team">OPERATOR (TEAM)</option>
                        <option value="admin">COMMAND (ADMIN)</option>
                      </select>
                      <Lock className="w-3 h-3 absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-hover/select:text-black transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                       <Target className="w-16 h-16 text-gray-300 mb-6" />
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] italic">Zero personnel nodes detected in registry.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-gray-50/50 border-t border-gray-50 text-center">
           <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em]">End of registry matrix - access logged at system time</p>
        </div>
      </div>
    </div>
  )
}
