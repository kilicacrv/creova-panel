'use client'

import { useState } from 'react'
import { Edit2, ShieldAlert, UserPlus, UsersRound, AlertCircle, ShieldCheck, User, ArrowRight } from 'lucide-react'
import { updateProfile } from './actions'

type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'team' | 'client'
  created_at: string
}

export default function TeamList({ initialTeam }: { initialTeam: Profile[] }) {
  const [team, setTeam] = useState(initialTeam)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function openEdit(member: Profile) {
    setError('')
    setEditingMember(member)
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      if (editingMember) {
        const result = await updateProfile(editingMember.id, formData)
        if (result?.error) {
          setError(result.error)
          setIsLoading(false)
        } else {
          window.location.reload()
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const roleColors = {
    admin: 'bg-black text-white border-black',
    team: 'bg-red-50 text-brand-red border-red-100',
    client: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Team Roster</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Staff Access & Privilege Matrix</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200 hover:shadow-red-100 active:scale-95 flex items-center relative z-10"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Provision Access
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Credential Tier</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enrolled</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {team.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">No personnel nodes found in current registry.</div>
                  </td>
                </tr>
              ) : (
                team.map((member) => (
                  <tr key={member.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mr-4 group-hover:bg-brand-red group-hover:text-white transition-all shadow-sm group-hover:shadow-red-100">
                          <UsersRound className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-red transition-colors">{member.full_name || 'Anonymous Entity'}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 opacity-60">ID: {member.id.substring(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        {member.role === 'admin' && <ShieldCheck className="w-4 h-4 mr-2.5 text-black" />}
                        {member.role === 'team' && <User className="w-4 h-4 mr-2.5 text-brand-red" />}
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${roleColors[member.role]}`}>
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => openEdit(member)}
                        className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                        title="Edit Permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic">Privilege Shift</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Personnel Credential Management</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="bg-red-50 text-brand-red p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-4 h-4 mr-3" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Identity Vector</label>
                <input 
                  type="text" 
                  name="full_name" 
                  defaultValue={editingMember?.full_name || ''} 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Credential Tier</label>
                <select 
                  name="role" 
                  defaultValue={editingMember?.role || 'team'}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-sm uppercase tracking-widest cursor-pointer"
                >
                  <option value="admin">Executive (Absolute Control)</option>
                  <option value="team">Team (Standard CRM Matrix)</option>
                  <option value="client">Client (Portal Isolation)</option>
                </select>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start">
                  <ShieldAlert className="w-4 h-4 mr-3 shrink-0 text-amber-600 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest leading-relaxed">
                    Critical: Switching to 'Client' tier immediately severs all administrative access links.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  disabled={isLoading}
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-red hover:bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 flex items-center active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : (
                    <>Update Identity <ArrowRight className="w-4 h-4 ml-3" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden text-center p-10 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-red"></div>
            <div className="w-20 h-20 bg-red-50 text-brand-red rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-red-100">
              <UserPlus className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Provisioning Protocol</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-10 leading-relaxed">
              Public enrollment is offline for security. Invitations must be dispatched from the Super-Admin node (Supabase Dashboard).
              <br/><br/>
              Auth &rarr; Invite &rarr; Email
            </p>
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="w-full bg-black hover:bg-brand-red text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              System Acknowledged
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
