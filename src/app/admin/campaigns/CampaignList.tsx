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
    draft: 'bg-gray-100 text-gray-400 border-gray-200',
    active: 'bg-red-50 text-brand-red border-red-100 shadow-lg shadow-red-200/20',
    paused: 'bg-gray-900 text-gray-400 border-gray-800',
    completed: 'bg-black text-white border-black shadow-xl shadow-black/10'
  }

  const platformColors: Record<string, string> = {
    meta: 'text-brand-red bg-red-50 border-red-100',
    google: 'text-gray-900 bg-gray-50 border-gray-200',
    tiktok: 'text-black bg-white border-black',
    linkedin: 'text-white bg-black border-black/20'
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Ad Logistics</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Cross-Channel ROAS Orchestration</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all shadow-xl hover:shadow-red-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
          Initialize Campaign
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign Identity</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform / Origin</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Burn / Resource Hub</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Efficiency (ROAS)</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lifecycle</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <Megaphone className="w-16 h-16 text-gray-100 mb-6" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] italic">No active deployments detected in frequency grid.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const percentSpent = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0
                  const isHighBurn = percentSpent > 90
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-red-50/10 transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 transition-all shadow-inner border border-gray-50 ${campaign.status === 'active' ? 'bg-black text-white group-hover:bg-brand-red group-hover:rotate-3' : 'bg-gray-50 text-gray-300 group-hover:text-black group-hover:bg-white'}`}>
                            <Megaphone className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 uppercase tracking-tight text-base group-hover:text-brand-red transition-colors">{campaign.name}</p>
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                               <Calendar className="w-3 h-3 opacity-30" />
                               {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'NULL'} 
                               <ArrowRight className="w-2 h-2 mx-1" />
                               {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'NULL'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="font-black text-gray-900 text-[11px] uppercase tracking-tight mb-2.5 flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-2 text-gray-300 group-hover:text-black transition-colors" />
                          {(campaign.projects?.clients as any)?.company_name || (campaign.projects?.clients as any)?.[0]?.company_name || 'SYSTEM_HUB'}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border transition-all ${platformColors[campaign.platform] || 'bg-gray-50 text-gray-400'}`}>
                          {campaign.platform}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="font-black text-gray-900 text-xs uppercase tracking-tight mb-3">
                          <span className={isHighBurn ? 'text-brand-red' : ''}>{campaign.spent.toLocaleString()}</span> / {campaign.budget.toLocaleString()} AED
                        </div>
                        <div className="w-40 ml-auto bg-gray-50 rounded-full h-2 overflow-hidden border border-gray-100 relative">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isHighBurn ? 'bg-brand-red animate-pulse' : 'bg-black'}`} 
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className="inline-flex items-center justify-center bg-gray-50 group-hover:bg-black group-hover:text-white transition-all text-gray-900 font-black text-sm px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                          <TrendingUp className="w-4 h-4 mr-2.5 text-brand-red" />
                          {campaign.roas.toFixed(2)}x
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusColors[campaign.status] || 'bg-gray-100'}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          {campaign.status === 'paused' || campaign.status === 'draft' ? (
                            <button 
                              onClick={() => handleQuickStatus(campaign.id, 'active')}
                              className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-500 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-lg transition-all active:scale-90"
                              title="Commence Execution"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          ) : campaign.status === 'active' ? (
                            <button 
                              onClick={() => handleQuickStatus(campaign.id, 'paused')}
                              className="p-3 bg-white border border-gray-100 rounded-xl text-amber-500 hover:text-white hover:bg-amber-500 hover:border-amber-500 hover:shadow-lg transition-all active:scale-90"
                              title="Initiate Stasis"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          ) : null}
                          
                          <button 
                            onClick={() => openEdit(campaign)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black hover:shadow-lg transition-all"
                            title="Modify Directives"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(campaign.id)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-brand-red hover:shadow-lg transition-all"
                            title="Terminate Archive"
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                   {editingCampaign ? 'Modify Deployment' : 'Launch Campaign'}
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Registry Operational Profile</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="bg-red-50 text-brand-red p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-5 h-5 mr-4 shrink-0" />
                  Kernel Override: {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campaign Operational Name <span className="text-brand-red font-black">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingCampaign?.name || ''} 
                  required
                  placeholder="EX: Q4 BRAND DEPLOYMENT V8"
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all placeholder:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initialization Lead (Project) <span className="text-brand-red font-black">*</span></label>
                  <select 
                    name="project_id" 
                    defaultValue={editingCampaign?.project_id || ''}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- SELECT COORDINATE --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Distribution Hub <span className="text-brand-red font-black">*</span></label>
                  <select 
                    name="platform" 
                    defaultValue={editingCampaign?.platform || 'meta'}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="meta">META (FB/IG)</option>
                    <option value="google">GOOGLE ADS</option>
                    <option value="tiktok">TIKTOK TRENDS</option>
                    <option value="linkedin">B2B LINKEDIN</option>
                    <option value="other">EXTERNAL GRID</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center">Fuel Budget</label>
                  <input 
                    type="number" 
                    name="budget" 
                    step="0.01"
                    defaultValue={editingCampaign?.budget || 0} 
                    required
                    className="w-full h-14 px-4 text-center bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center">Amount Spent</label>
                  <input 
                    type="number" 
                    name="spent" 
                    step="0.01"
                    defaultValue={editingCampaign?.spent || 0} 
                    className="w-full h-14 px-4 text-center bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-center">Target ROAS</label>
                  <input 
                    type="number" 
                    name="roas" 
                    step="0.01"
                    defaultValue={editingCampaign?.roas || 0} 
                    className="w-full h-14 px-4 text-center bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Genesis Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    defaultValue={editingCampaign?.start_date || ''} 
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Termination Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    defaultValue={editingCampaign?.end_date || ''} 
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                <select 
                  name="status" 
                  defaultValue={editingCampaign?.status || 'draft'}
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  <option value="draft">INITIAL DRAFT</option>
                  <option value="active">ACTIVE EXECUTION</option>
                  <option value="paused">MISSION STASIS</option>
                  <option value="completed">DEPLOYMENT DONE</option>
                </select>
              </div>

              <div className="pt-10 flex justify-end gap-5 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                  disabled={isLoading}
                >
                  Abort Protocol
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-4 bg-black hover:bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-red-200 active:scale-95 flex items-center"
                >
                  {isLoading ? (
                    'COMMITTING...'
                  ) : (
                    <>SAVE DEPLOYMENT <ArrowRight className="ml-3 w-4 h-4" /></>
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
