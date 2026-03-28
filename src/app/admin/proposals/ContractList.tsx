'use client'

import { useState } from 'react'
import { Trash2, Plus, FileText, AlertCircle, Building2, Download, Send, ArrowRight, ShieldCheck } from 'lucide-react'
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
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    active: 'bg-red-50 text-brand-red border-red-100',
    expired: 'bg-gray-100 text-gray-500 border-gray-200',
    cancelled: 'bg-black text-white border-black'
  }

  return (
    <div className="mb-16 space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-red-50 p-3 rounded-2xl text-brand-red shadow-inner ring-1 ring-red-100">
             <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Legal Frameworks</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Unified Digital Service Agreements</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200 hover:shadow-red-100 active:scale-95 flex items-center relative z-10"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Draft Instrument
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agreement Title</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Counterparty</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Yield</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Validation</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                         <FileText className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No legal instruments identified in registry.</p>
                      <button onClick={openCreate} className="text-brand-red text-[10px] font-black uppercase tracking-widest mt-6 hover:tracking-[0.3em] transition-all">Initialize First Contract</button>
                    </div>
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900 group-hover:text-brand-red transition-colors uppercase tracking-tight">{contract.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">{contract.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 flex items-center italic">
                        <Building2 className="w-4 h-4 mr-2.5 text-gray-300" />
                        {contract.clients?.company_name || 'Generic Client'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900 text-lg">${contract.monthly_fee}</p>
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Recurring Yield</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[10px] font-black text-gray-900 uppercase tracking-tight">
                        {new Date(contract.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} 
                        <span className="mx-2 text-gray-200">→</span>
                        {new Date(contract.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusColors[contract.status] || 'bg-gray-100'}`}>
                        {contract.status === 'pending' ? 'Auth Required' : contract.status}
                      </span>
                      {contract.signed_at && (
                         <div className="flex items-center text-[9px] text-gray-400 mt-2 font-black uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3 mr-1 text-brand-red" />
                            Verified by {contract.signature_name}
                         </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                         {contract.status === 'pending' && (
                           <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all" title="Dispatch Reminder">
                             <Send className="w-4 h-4" />
                           </button>
                         )}
                         {contract.signed_pdf_url && (
                           <a href={contract.signed_pdf_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-gray-200 hover:shadow-lg transition-all" title="Retrieve Document">
                             <Download className="w-4 h-4" />
                           </a>
                         )}
                         <button 
                           onClick={() => handleDelete(contract.id)}
                           className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-gray-200 hover:shadow-lg transition-all"
                           title="Purge Instrument"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col scale-in-center">
            <div className="flex justify-between items-center p-10 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic flex items-center">
                   <FileText className="w-6 h-6 mr-3 text-brand-red" />
                   Draft Legal Instrument
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Agreement Genesis Matrix</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
              {error && (
                <div className="bg-red-50 text-brand-red p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100">
                  <AlertCircle className="w-4 h-4 mr-3" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Counterparty *</label>
                  <select 
                    name="client_id" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-sm uppercase tracking-widest"
                  >
                    <option value="" disabled selected>-- Select Hub --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Monthly Yield ($) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    name="monthly_fee" 
                    required
                    placeholder="e.g. 2950"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instrument Identification *</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  placeholder="e.g., MASTER SERVICES AGREEMENT - CREOVA 2026"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Functional Scope (Meta Documentation) *</label>
                <textarea 
                  name="description" 
                  required
                  rows={2}
                  placeholder="Summarize the core impact and deliverables of this legal framework..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Commencement *</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Termination *</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-black hover:bg-brand-red text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-gray-200 active:scale-95 flex items-center justify-center"
                >
                  {isLoading ? 'Encrypting instrument...' : (
                    <>Authorize & Dispatch to Counterparty <ArrowRight className="w-4 h-4 ml-4" /></>
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
