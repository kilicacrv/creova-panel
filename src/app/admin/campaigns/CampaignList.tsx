'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Megaphone, AlertCircle, Building2, TrendingUp, PlayCircle, PauseCircle } from 'lucide-react'
import { createCampaign, updateCampaign, deleteCampaign, updateCampaignStatus } from './actions'

type Project = { id: string; title: string; client_id: string; clients?: { company_name: string } | { company_name: string }[] }

type Campaign = {
  id: string
  project_id: string
  name: string
  platform: string
  budget: number
  spent: number
  roas: number
  status: 'draft' | 'active' | 'paused' | 'completed'
  start_date: string | null
  end_date: string | null
  created_at: string
  projects?: Project
}

export default function CampaignList({ 
  initialCampaigns, 
  projects 
}: { 
  initialCampaigns: Campaign[]
  projects: Project[]
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setError('')
    setEditingCampaign(null)
    setIsModalOpen(true)
  }

  function openEdit(campaign: Campaign) {
    setError('')
    setEditingCampaign(campaign)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      const result = await deleteCampaign(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setCampaigns(prev => prev.filter(c => c.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleQuickStatus(id: string, status: string) {
    try {
      const result = await updateCampaignStatus(id, status)
      if (result?.error) {
        alert(result.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      let result
      if (editingCampaign) {
        result = await updateCampaign(editingCampaign.id, formData)
      } else {
        result = await createCampaign(formData)
      }

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700 border-green-200',
    paused: 'bg-amber-100 text-amber-700 border-amber-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const platformColors: Record<string, string> = {
    meta: 'text-blue-600 bg-blue-50 border-blue-100',
    google: 'text-red-600 bg-red-50 border-red-100',
    tiktok: 'text-black bg-gray-100 border-gray-200',
    linkedin: 'text-sky-700 bg-sky-50 border-sky-100'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor digital advertising budgets, spend, and ROAS across platforms.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Campaign
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Platform & Client</th>
                <th className="px-6 py-4 text-right">Spend / Budget</th>
                <th className="px-6 py-4 text-center">ROAS</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No active campaigns. Click "Add Campaign" to start tracking.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const percentSpent = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0 ${campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{campaign.name}</p>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'No dates'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'No dates'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 mb-1 flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          {(campaign.projects?.clients as any)?.company_name || (campaign.projects?.clients as any)?.[0]?.company_name || 'Unknown Client'}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${platformColors[campaign.platform] || 'bg-gray-100 text-gray-600'}`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-gray-900">
                          {campaign.spent.toLocaleString()} / {campaign.budget.toLocaleString()} AED
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${percentSpent > 90 ? 'bg-red-500' : 'bg-[#1A56DB]'}`} 
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg border border-emerald-100">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {campaign.roas.toFixed(2)}x
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${statusColors[campaign.status] || 'bg-gray-100'}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {campaign.status === 'paused' || campaign.status === 'draft' ? (
                          <button 
                            onClick={() => handleQuickStatus(campaign.id, 'active')}
                            className="p-2 border border-green-200 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors mr-1"
                            title="Activate Campaign"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        ) : campaign.status === 'active' ? (
                          <button 
                            onClick={() => handleQuickStatus(campaign.id, 'paused')}
                            className="p-2 border border-amber-200 bg-amber-50 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors mr-1"
                            title="Pause Campaign"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                        
                        <button 
                          onClick={() => openEdit(campaign)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-1"
                          title="Edit Campaign"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(campaign.id)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingCampaign?.name || ''} 
                  required
                  placeholder="e.g., Summer Lead Gen Q3"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingCampaign?.project_id || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="" disabled>-- Select a project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'Unknown Client'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                  <select 
                    name="platform" 
                    defaultValue={editingCampaign?.platform || 'meta'}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="meta">Meta (FB/IG)</option>
                    <option value="google">Google Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="linkedin">LinkedIn Ads</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget</label>
                  <input 
                    type="number" 
                    name="budget" 
                    step="0.01"
                    defaultValue={editingCampaign?.budget || 0} 
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Spent</label>
                  <input 
                    type="number" 
                    name="spent" 
                    step="0.01"
                    defaultValue={editingCampaign?.spent || 0} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ROAS</label>
                  <input 
                    type="number" 
                    name="roas" 
                    step="0.01"
                    defaultValue={editingCampaign?.roas || 0} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    defaultValue={editingCampaign?.start_date || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    defaultValue={editingCampaign?.end_date || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingCampaign?.status || 'draft'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
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
                  {isLoading ? 'Saving...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
