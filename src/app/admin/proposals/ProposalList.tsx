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
    draft: 'bg-gray-50 text-gray-500 border-gray-100',
    sent: 'bg-blue-50 text-blue-700 border-blue-100',
    signed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-red-50 text-red-700 border-red-100'
  }

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage project proposals and client agreements</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Proposal
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proposal</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <FileSignature className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-sm font-medium text-gray-400">No proposals found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 shrink-0 transition-all shadow-sm border border-gray-50 ${proposal.status === 'signed' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                          <FileSignature className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{proposal.title}</p>
                          {proposal.file_url ? (
                            <a href={proposal.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[10px] font-medium text-gray-400 hover:text-blue-600 mt-1 transition-colors">
                              <LinkIcon className="w-3 h-3 mr-1.5 opacity-50" /> View Document
                            </a>
                          ) : (
                            <span className="text-[10px] font-medium text-gray-300 mt-1 italic">No file attached</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-semibold text-gray-900 text-xs flex items-center mb-1">
                        <Building2 className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {proposal.clients?.company_name || 'General Client'}
                      </div>
                      {proposal.projects && (
                        <div className="text-[10px] font-medium text-gray-400 flex items-center gap-2 truncate max-w-[200px]" title={proposal.projects.title}>
                           Project: {proposal.projects.title}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                        {proposal.status}
                      </span>
                      {proposal.status === 'signed' && (
                        <div className="mt-1 flex items-center text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                           <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-2 opacity-40" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {proposal.status === 'draft' && (
                          <button 
                            onClick={() => handleQuickStatus(proposal.id, 'sent')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Send Proposal"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {proposal.status === 'sent' && (
                          <>
                            <button 
                              onClick={() => handleQuickStatus(proposal.id, 'signed')}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Mark Signed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleQuickStatus(proposal.id, 'rejected')}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Mark Rejected"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => openEdit(proposal)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Proposal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(proposal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Proposal"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   {editingProposal ? 'Edit Proposal' : 'New Proposal'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Configure proposal details and client project</p>
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Proposal Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingProposal?.title || ''} 
                  required
                  placeholder="e.g. Website Overhaul Proposal"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Client <span className="text-red-500">*</span></label>
                  <select 
                    name="client_id" 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Project</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingProposal?.project_id || ''}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer disabled:opacity-50"
                    disabled={!selectedClient}
                  >
                    <option value="">General / No Project</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">File URL (PDF)</label>
                <input 
                  type="url" 
                  name="file_url" 
                  defaultValue={editingProposal?.file_url || ''} 
                  placeholder="https://example.com/proposal.pdf"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingProposal?.status || 'draft'}
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="signed">Signed</option>
                  <option value="rejected">Rejected</option>
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
                    <>Save Proposal <ArrowRight className="ml-2 w-4 h-4" /></>
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
