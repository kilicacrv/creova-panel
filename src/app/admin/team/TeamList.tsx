'use client'

import { useState } from 'react'
import { Edit2, ShieldAlert, UserPlus, UsersRound, AlertCircle, ShieldCheck, User, ArrowRight, X } from 'lucide-react'
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
    admin: 'bg-blue-50 text-blue-700 border-blue-100',
    team: 'bg-gray-50 text-gray-600 border-gray-100',
    client: 'bg-purple-50 text-purple-700 border-purple-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team roles and permissions</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center relative z-10"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {team.length === 0 ? (
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="text-sm font-medium text-gray-400">No team members found.</div>
                  </td>
              ) : (
                team.map((member) => (
                  <tr key={member.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{member.full_name || 'New Member'}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">ID: {member.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${roleColors[member.role]}`}>
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-gray-500">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => openEdit(member)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Member</h2>
                <p className="text-xs text-gray-500 mt-1">Manage role and permissions</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-4 h-4 mr-3" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  defaultValue={editingMember?.full_name || ''} 
                  required
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Role</label>
                <select 
                  name="role" 
                  defaultValue={editingMember?.role || 'team'}
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                >
                  <option value="admin">Admin (Full Access)</option>
                  <option value="team">Team Member (Limited Access)</option>
                  <option value="client">Client (Restricted View)</option>
                </select>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
                  <ShieldAlert className="w-4 h-4 mr-3 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Note:</strong> Role changes affect permissions across the entire administrative dashboard.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all active:scale-95"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center"
                >
                  {isLoading ? 'Saving...' : (
                    <>Update Member <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-10 relative">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Invite Member</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              New team invitations are currently managed through the Supabase Dashboard for enhanced security.
              <br/><br/>
              <span className="font-mono text-xs bg-gray-50 p-2 rounded block">Authentication → Invite User</span>
            </p>
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
