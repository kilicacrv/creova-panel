'use client'

import { useState } from 'react'
import { Trash2, Plus, FileText, AlertCircle, Building2, Download, Send } from 'lucide-react'
import { createContract, deleteContract } from './contractActions'

type Client = { id: string; company_name: string }

type Contract = {
  id: string
  client_id: string
  title: string
  description: string
  monthly_fee: number
  start_date: string
  end_date: string
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  signed_at: string | null
  signature_name: string | null
  signed_pdf_url: string | null
  created_at: string
  clients?: Client
}

export default function ContractList({ 
  initialContracts, 
  clients 
}: { 
  initialContracts: Contract[]
  clients: Client[]
}) {
  const [contracts, setContracts] = useState(initialContracts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setError('')
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contract? Clients will no longer see it.')) return
    
    try {
      const result = await deleteContract(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setContracts(prev => prev.filter(c => c.id !== id))
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
      const result = await createContract(formData)
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
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    expired: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
             <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Digital Contracts</h2>
            <p className="text-sm text-gray-500 mt-1">Generate binding agreements and track client signatures.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-emerald-200 transition-all"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Create Contract
        </button>
      </div>

      <div className="bg-white border text-sm border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold px-4">
              <tr>
                <th className="px-6 py-4">Contract Title</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Monthly Fee</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 text-gray-300 mb-3" />
                      <p>No contracts generated yet.</p>
                      <button onClick={openCreate} className="text-emerald-600 font-bold mt-2 hover:underline">Create your first contract</button>
                    </div>
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{contract.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{contract.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        {contract.clients?.company_name || 'Unknown Client'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">${contract.monthly_fee}</p>
                      <p className="text-xs text-gray-400">/mo</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{new Date(contract.start_date).toLocaleDateString()} → {new Date(contract.end_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusColors[contract.status] || 'bg-gray-100'}`}>
                        {contract.status === 'pending' ? 'Pending Signature' : contract.status}
                      </span>
                      {contract.signed_at && (
                         <p className="text-[10px] text-gray-400 mt-1">Signed by {contract.signature_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {/* Client Notification feature simulated visually */}
                       {contract.status === 'pending' && (
                         <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mr-2" title="Send reminder">
                           <Send className="w-4 h-4" />
                         </button>
                       )}
                       {contract.signed_pdf_url && (
                         <a href={contract.signed_pdf_url} target="_blank" rel="noopener noreferrer" className="inline-block p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors mr-2" title="Download Signed PDF">
                           <Download className="w-4 h-4" />
                         </a>
                       )}
                       <button 
                         onClick={() => handleDelete(contract.id)}
                         className="p-2 border border-gray-200 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                         title="Delete Contract"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                 <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                 Draft New Contract
              </h2>
              <button disabled={isLoading} onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center border border-red-100">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Target Client *</label>
                  <select 
                    name="client_id" 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                  >
                    <option value="" disabled selected>-- Select client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Monthly Retainer Fee ($) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    name="monthly_fee" 
                    required
                    placeholder="e.g. 2500"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Contract Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  placeholder="e.g., General Media Services Agreement 2024"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Scope of Work (Description) *</label>
                <textarea 
                  name="description" 
                  required
                  rows={2}
                  placeholder="Briefly describe the services being provided..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Start Date *</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">End Date *</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Payment Terms</label>
                <input 
                  type="text" 
                  name="payment_terms" 
                  placeholder="e.g. Net 30, due 5th of every month"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 pl-1">Custom Legal Clauses</label>
                <textarea 
                  name="clauses" 
                  rows={3}
                  placeholder="Any additional terms, non-competes, or termination clauses..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50 resize-y"
                />
              </div>

              <div className="pt-4 flex flex-col mt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
                >
                  {isLoading ? 'Generating Contract...' : 'Generate & Send to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
