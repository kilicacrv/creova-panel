'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, FileSignature, AlertCircle, Building2, Link as LinkIcon, CheckCircle, XCircle, Send } from 'lucide-react'
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
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    signed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">Track proposals, agreements, and their signatures.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Title & Link</th>
                <th className="px-6 py-4">Client / Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sent Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {proposals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No proposals found. Let's win some business!
                  </td>
                </tr>
              ) : (
                proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0 ${proposal.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          <FileSignature className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{proposal.title}</p>
                          {proposal.file_url ? (
                            <a href={proposal.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-[#1A56DB] hover:underline mt-0.5">
                              <LinkIcon className="w-3 h-3 mr-1" /> View Document
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 mt-0.5 italic">No link provided</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1" />
                        {proposal.clients?.company_name || 'Unknown Client'}
                      </div>
                      {proposal.projects && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={proposal.projects.title}>
                          Project: {proposal.projects.title}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusColors[proposal.status] || 'bg-gray-100'}`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {proposal.status === 'draft' && (
                        <button 
                          onClick={() => handleQuickStatus(proposal.id, 'sent')}
                          className="p-2 border border-blue-200 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors mr-1"
                          title="Mark Sent"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {proposal.status === 'sent' && (
                        <>
                          <button 
                            onClick={() => handleQuickStatus(proposal.id, 'signed')}
                            className="p-2 border border-green-200 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors mr-1"
                            title="Mark Signed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleQuickStatus(proposal.id, 'rejected')}
                            className="p-2 border border-red-200 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors mr-1"
                            title="Mark Rejected"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => openEdit(proposal)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-1"
                        title="Edit Proposal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(proposal.id)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete Proposal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
                {editingProposal ? 'Edit Proposal' : 'Create Proposal'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingProposal?.title || ''} 
                  required
                  placeholder="e.g., Q3 Branding Campaign"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Client *</label>
                  <select 
                    name="client_id" 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="" disabled>-- Select a client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingProposal?.project_id || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white disabled:opacity-50"
                    disabled={!selectedClient}
                  >
                    <option value="">-- No Project --</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document URL (PDF, Drive, Pitch)</label>
                <input 
                  type="url" 
                  name="file_url" 
                  defaultValue={editingProposal?.file_url || ''} 
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingProposal?.status || 'draft'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent to Client</option>
                  <option value="signed">Signed / Approved</option>
                  <option value="rejected">Rejected</option>
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
                  {isLoading ? 'Saving...' : 'Save Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
