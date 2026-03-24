'use client'

import { useState } from 'react'
import { Edit2, ShieldAlert, UserPlus, UsersRound, AlertCircle, ShieldCheck, User } from 'lucide-react'
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
        await updateProfile(editingMember.id, formData)
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    team: 'bg-blue-100 text-blue-700 border-blue-200',
    client: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agency staff, administrators, and their roles.</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Team Member</th>
                <th className="px-6 py-4">Role / Access Level</th>
                <th className="px-6 py-4">Joined At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {team.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No team members found.
                  </td>
                </tr>
              ) : (
                team.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mr-3 shrink-0">
                          <UsersRound className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{member.full_name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{member.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {member.role === 'admin' && <ShieldCheck className="w-4 h-4 mr-2 text-purple-600" />}
                        {member.role === 'team' && <User className="w-4 h-4 mr-2 text-blue-600" />}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${roleColors[member.role]}`}>
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEdit(member)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        title="Edit Roles"
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

      {/* Edit Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Team Member
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  defaultValue={editingMember?.full_name || ''} 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
                <select 
                  name="role" 
                  defaultValue={editingMember?.role || 'team'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="team">Team Member (Limited CRM)</option>
                  <option value="client">Client (Portal Only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2 flex items-start">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0 text-amber-500" />
                  Warning: Changing a role to 'client' will immediately revoke their access to this admin panel.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1e4eb8] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Update Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Info Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-center p-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">How to Add Members</h2>
            <p className="text-sm text-gray-600 mb-6">
              Because public public sign-ups are disabled for security, you must invite new users directly from the <b>Supabase Dashboard</b>. 
              <br/><br/>
              Go to <i>Authentication &rarr; Users &rarr; Invite User</i> and enter their email. Once they log in for the first time, their profile will appear here where you can assign them "Admin" or "Team" roles.
            </p>
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="w-full bg-[#1A56DB] hover:bg-[#1e4eb8] text-white py-2 rounded-lg font-medium transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
