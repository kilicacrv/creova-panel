'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, FileSignature, AlertCircle, Building2, Link as LinkIcon, CheckCircle, XCircle, Send, ArrowRight, ShieldCheck, Zap, Sparkles, X, Target, Clock } from 'lucide-react'
import { createProposal, updateProposal, deleteProposal, updateProposalStatus } from './actions'

type Client = { id: string; company_name: string }
type Project = { id: string; title: string; client_id: string }

type Proposal = {
  id: string
  client_id: string
  project_id: string | null
  title: string
  file_url: string | null
  status: 'draft' | 'sent' | 'signed' | 'rejected'
  created_at: string
  clients?: Client
  projects?: Project
}

export default function ProposalList({ 
  initialProposals, 
  clients,
  projects
}: { 
  initialProposals: Proposal[]
  clients: Client[]
  projects: Project[]
}) {
  const [proposals, setProposals] = useState(initialProposals)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedClient, setSelectedClient] = useState<string>('')

  function openCreate() {
    setError('')
    setEditingProposal(null)
    setSelectedClient('')
    setIsModalOpen(true)
  }

  function openEdit(proposal: Proposal) {
    setError('')
    setEditingProposal(proposal)
    setSelectedClient(proposal.client_id)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this proposal?')) return
    
    try {
      const result = await deleteProposal(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setProposals(prev => prev.filter(p => p.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleQuickStatus(id: string, status: string) {
    try {
      const result = await updateProposalStatus(id, status)
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
      if (editingProposal) {
        result = await updateProposal(editingProposal.id, formData)
      } else {
        result = await createProposal(formData)
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
    draft: 'bg-gray-50 text-gray-400 border-gray-100',
    sent: 'bg-amber-50 text-amber-600 border-amber-100',
    signed: 'bg-black text-white border-black shadow-lg shadow-black/10',
    rejected: 'bg-red-50 text-brand-red border-red-100 animate-pulse'
  }

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Strategic Proposals</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pitch Assets & Capital Allocation Protocols</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all shadow-xl hover:shadow-red-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
          Initialize Pitch
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Title</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Counterparty</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registry Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Uplink Date</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <FileSignature className="w-16 h-16 text-gray-100 mb-6" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] italic">Zero active proposals identified in portfolio.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-red-50/10 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 transition-transform group-hover:rotate-3 ${proposal.status === 'signed' ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-gray-50 border border-gray-100 text-gray-300'}`}>
                          <FileSignature className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight text-sm group-hover:text-brand-red transition-colors">{proposal.title}</p>
                          {proposal.file_url ? (
                            <a href={proposal.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-red mt-1.5 transition-colors">
                              <LinkIcon className="w-3 h-3 mr-2 opacity-30" /> Secure Asset Link
                            </a>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 mt-1.5 italic">Awaiting Asset Deployment</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 text-[11px] uppercase tracking-tight mb-1 cursor-default italic">
                        {proposal.clients?.company_name || 'GENERIC_HUB'}
                      </div>
                      {proposal.projects && (
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 opacity-60 flex items-center gap-2 truncate max-w-[200px]" title={proposal.projects.title}>
                           <div className="w-1 h-1 rounded-full bg-gray-200"></div> Node: {proposal.projects.title}
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                        {proposal.status}
                      </span>
                      {proposal.status === 'signed' && (
                        <div className="mt-2 flex items-center text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                           <ShieldCheck className="w-3 h-3 mr-1" /> Verified Protocol
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-3 opacity-30" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {new Date(proposal.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 mb-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {proposal.status === 'draft' && (
                          <button 
                            onClick={() => handleQuickStatus(proposal.id, 'sent')}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-brand-red hover:bg-brand-red hover:text-white hover:border-brand-red hover:shadow-lg transition-all active:scale-90"
                            title="Dispatch Asset"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {proposal.status === 'sent' && (
                          <>
                            <button 
                              onClick={() => handleQuickStatus(proposal.id, 'signed')}
                              className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-500 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-lg transition-all active:scale-90"
                              title="Commit Signature"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleQuickStatus(proposal.id, 'rejected')}
                              className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-brand-red hover:shadow-lg transition-all active:scale-90"
                              title="File De-verification"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => openEdit(proposal)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black hover:shadow-lg transition-all active:scale-90"
                          title="Calibrate Proposal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(proposal.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-brand-red hover:shadow-lg transition-all active:scale-90"
                          title="Purge Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                   {editingProposal ? 'Calibrate Pitch' : 'Initialize Agreement'}
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Proposal Development Hub</p>
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
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Descriptor (Title) *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingProposal?.title || ''} 
                  required
                  placeholder="EX: Q4_MARKETING_MSA_V2"
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Counterparty *</label>
                  <select 
                    name="client_id" 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- SELECT HUB --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Node</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingProposal?.project_id || ''}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-30"
                    disabled={!selectedClient}
                  >
                    <option value="">-- GENERIC PORTFOLIO --</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resource Uplink (PDF URL)</label>
                <input 
                  type="url" 
                  name="file_url" 
                  defaultValue={editingProposal?.file_url || ''} 
                  placeholder="https://cloud.registry/proposal.pdf"
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Protocol Status</label>
                <select 
                  name="status" 
                  defaultValue={editingProposal?.status || 'draft'}
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  <option value="draft">INTERNAL DRAFT</option>
                  <option value="sent">DISPATCHED / PENDING</option>
                  <option value="signed">EXECUTED / ARCHIVED</option>
                  <option value="rejected">REJECTED / VOID</option>
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
                    <>COMMIT PROPOSAL <ArrowRight className="ml-3 w-4 h-4" /></>
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
