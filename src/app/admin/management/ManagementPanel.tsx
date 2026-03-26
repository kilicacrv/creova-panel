'use client'

import { useState } from 'react'
import { Settings, Shield, User, Building2, Plus, FileText, CheckSquare, AlertCircle } from 'lucide-react'
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
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/clients" className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Manage Clients</div>
              <div className="text-xs text-gray-500">Add or edit clients</div>
            </div>
          </Link>
          <Link href="/admin/invoices" className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-4 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Send Invoice</div>
              <div className="text-xs text-gray-500">Bill your clients</div>
            </div>
          </Link>
          <Link href="/admin/tasks" className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">Create Task</div>
              <div className="text-xs text-gray-500">Assign work to team</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-400" />
            User Roles & Permissions
          </h2>
          <p className="text-sm text-gray-500 mt-1">Easily assign system access levels to signed-up users.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Assign New Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {profile.full_name || 'Anonymous User'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      profile.role === 'team' ? 'bg-blue-100 text-blue-700' : 
                      profile.role === 'client' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {profile.role || 'none'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      disabled={loadingId === profile.id}
                      value={profile.role || 'none'}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#1A56DB] focus:outline-none bg-white cursor-pointer disabled:opacity-50"
                    >
                      <option value="none">None</option>
                      <option value="client">Client</option>
                      <option value="team">Team (Editor)</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
