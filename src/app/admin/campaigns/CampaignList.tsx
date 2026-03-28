'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Megaphone, AlertCircle, Building2, TrendingUp, PlayCircle, PauseCircle, ArrowRight, Zap, Target, DollarSign, X, Calendar } from 'lucide-react'
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
    draft: 'bg-gray-50 text-gray-500 border-gray-100',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    paused: 'bg-amber-50 text-amber-700 border-amber-100',
    completed: 'bg-blue-50 text-blue-700 border-blue-100'
  }

  const platformColors: Record<string, string> = {
    meta: 'text-blue-600 bg-blue-50 border-blue-100',
    google: 'text-gray-900 bg-gray-50 border-gray-200',
    tiktok: 'text-pink-600 bg-pink-50 border-pink-100',
    linkedin: 'text-blue-800 bg-blue-50 border-blue-200'
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Cross-channel ad performance and budget</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Campaign
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Budget</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">ROAS</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Megaphone className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-sm font-medium text-gray-400">No campaigns found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const percentSpent = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0
                  const isHighBurn = percentSpent > 90
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50/30 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 shrink-0 transition-all shadow-sm border border-gray-50 ${campaign.status === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{campaign.name}</p>
                            <div className="text-[10px] font-medium text-gray-400 mt-1 flex items-center gap-2">
                               <Calendar className="w-3 h-3" />
                               {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'} - {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-semibold text-gray-900 text-xs flex items-center mb-2">
                          <Building2 className="w-3.5 h-3.5 mr-2 text-gray-400" />
                          {(campaign.projects?.clients as any)?.company_name || (campaign.projects?.clients as any)?.[0]?.company_name || 'General'}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border transition-all ${platformColors[campaign.platform] || 'bg-gray-50 text-gray-400'}`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="font-semibold text-gray-900 text-xs mb-2">
                          <span className={isHighBurn ? 'text-red-600 font-bold' : ''}>{campaign.spent.toLocaleString()}</span> / {campaign.budget.toLocaleString()} AED
                        </div>
                        <div className="w-32 ml-auto bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isHighBurn ? 'bg-red-500' : 'bg-blue-600'}`} 
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex items-center justify-center bg-gray-50 text-gray-900 font-semibold text-xs px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                          <TrendingUp className="w-3.5 h-3.5 mr-2 text-blue-600" />
                          {campaign.roas.toFixed(2)}x
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${statusColors[campaign.status] || 'bg-gray-100'}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {campaign.status === 'paused' || campaign.status === 'draft' ? (
                            <button 
                              onClick={() => handleQuickStatus(campaign.id, 'active')}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Resume Campaign"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          ) : campaign.status === 'active' ? (
                            <button 
                              onClick={() => handleQuickStatus(campaign.id, 'paused')}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Pause Campaign"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          ) : null}
                          
                          <button 
                            onClick={() => openEdit(campaign)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Campaign"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(campaign.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Configure campaign details and budget</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Campaign Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingCampaign?.name || ''} 
                  required
                  placeholder="e.g. Q4 Brand Awareness"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Project <span className="text-red-500">*</span></label>
                  <select 
                    name="project_id" 
                    defaultValue={editingCampaign?.project_id || ''}
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Platform <span className="text-red-500">*</span></label>
                  <select 
                    name="platform" 
                    defaultValue={editingCampaign?.platform || 'meta'}
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="meta">Meta (Facebook/Instagram)</option>
                    <option value="google">Google Ads</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1 text-center">Budget</label>
                  <input 
                    type="number" 
                    name="budget" 
                    step="0.01"
                    defaultValue={editingCampaign?.budget || 0} 
                    required
                    className="w-full h-11 px-4 text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1 text-center">Spent</label>
                  <input 
                    type="number" 
                    name="spent" 
                    step="0.01"
                    defaultValue={editingCampaign?.spent || 0} 
                    className="w-full h-11 px-4 text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1 text-center">ROAS</label>
                  <input 
                    type="number" 
                    name="roas" 
                    step="0.01"
                    defaultValue={editingCampaign?.roas || 0} 
                    className="w-full h-11 px-4 text-center bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Start Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    defaultValue={editingCampaign?.start_date || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">End Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    defaultValue={editingCampaign?.end_date || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingCampaign?.status || 'draft'}
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
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
                    <>{editingCampaign ? 'Update Campaign' : 'Create Campaign'} <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
