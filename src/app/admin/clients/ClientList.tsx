'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Mail, Phone, MapPin, Building2, AlertCircle, FileText, ExternalLink, LogIn, ArrowRight, Target, Zap, Globe, Sparkles, X, ShieldCheck, Clock } from 'lucide-react'
import { createClient, updateClient, deleteClient } from './actions'
import { createContract } from '../proposals/contractActions'
import { createClientAccount } from './clientAuthActions'

type Client = {
  id: string
  company_name: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  notes: string | null
  status: 'active' | 'inactive'
  created_at: string
  meta_ad_account_id?: string | null
  logo_url?: string | null
  contracts?: { id: string; status: string }[]
}

export default function ClientList({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Contract Modal State
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractClient, setContractClient] = useState<Client | null>(null)
  const [isContractLoading, setIsContractLoading] = useState(false)

  function openCreate() {
    setError('')
    setEditingClient(null)
    setIsModalOpen(true)
  }

  function openEdit(client: Client) {
    setError('')
    setEditingClient(client)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this client? All related projects and invoices will be deleted as well.')) return
    
    try {
      const result = await deleteClient(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setClients(prev => prev.filter(c => c.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleCreateContract(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!contractClient) return
    setIsContractLoading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('client_id', contractClient.id)

    try {
      const result = await createContract(formData)
      if (result?.error) {
        alert(result.error)
      } else {
        alert('Contract generated and sent successfully!')
        setIsContractModalOpen(false)
        window.location.reload()
      }
    } catch (err) {
      alert('Failed to generate contract.')
    } finally {
      setIsContractLoading(false)
    }
  }

  async function handleSendWelcome(client: Client) {
    if (!client.contact_email) return alert('No email found for this client.')
    setIsLoading(true)
    try {
      const result = await createClientAccount(client.contact_email, client.company_name, client.id)
      if (result.error) {
        alert(result.error)
      } else {
        alert(`Account created! Temp password: ${result.tempPassword}`)
      }
    } catch (err) {
      alert('Failed to trigger account creation.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLoginAsClient(client: Client) {
    window.location.href = `/client?preview_id=${client.id}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      let result
      if (editingClient) {
        result = await updateClient(editingClient.id, formData)
      } else {
        result = await createClient(formData)
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

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer registry and account settings</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          Add Client
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Building2 className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-sm font-medium text-gray-400">No clients found in the registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-red-50/10 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mr-4 shrink-0 group-hover:border-blue-200 transition-all relative overflow-hidden shadow-sm">
                           {client.logo_url ? (
                             <img src={client.logo_url} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <Building2 className="w-6 h-6" />
                           )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{client.company_name}</p>
                          {client.address && <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={client.address}>{client.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        {client.contact_email && (
                          <div className="flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors">
                            <Mail className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
                            <a href={`mailto:${client.contact_email}`} className="truncate max-w-[180px]">{client.contact_email}</a>
                          </div>
                        )}
                        {client.contact_phone && (
                          <div className="flex items-center text-xs text-gray-600">
                            <Phone className="w-3.5 h-3.5 mr-2.5 text-gray-400" />
                            <span>{client.contact_phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {(() => {
                        const hasActive = client.contracts?.some(c => c.status === 'active')
                        const hasPending = client.contracts?.some(c => c.status === 'pending')
                        if (hasActive) {
                          return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-xs font-medium border border-emerald-100 flex inline-flex items-center"><ShieldCheck className="w-3.5 h-3.5 mr-2"/> Active Contract</span>
                        }
                        if (hasPending) {
                          return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-md text-xs font-medium border border-amber-100 flex inline-flex items-center"><Clock className="w-3.5 h-3.5 mr-2"/> Review Pending</span>
                        }
                        return <span className="text-xs text-gray-400 italic font-medium">No active contract</span>
                      })()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                        client.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                         <button 
                          onClick={() => {
                            setContractClient(client)
                            setIsContractModalOpen(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Generate Contract"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSendWelcome(client)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Send Welcome Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleLoginAsClient(client)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Preview Portal"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEdit(client)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Client"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   {editingClient ? 'Edit Client' : 'Add New Client'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Configure client profile and access settings</p>
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Company Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="company_name" 
                  defaultValue={editingClient?.company_name || ''} 
                  required
                  placeholder="e.g. Acme Corporation"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Meta Ad Account ID</label>
                  <input 
                    type="text" 
                    name="meta_ad_account_id" 
                    placeholder="act_XXXXXXXXX"
                    defaultValue={editingClient?.meta_ad_account_id || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Logo URL</label>
                  <input 
                    type="url" 
                    name="logo_url" 
                    placeholder="https://example.com/logo.png"
                    defaultValue={editingClient?.logo_url || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Email address</label>
                  <input 
                    type="email" 
                    name="contact_email" 
                    placeholder="contact@example.com"
                    defaultValue={editingClient?.contact_email || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="contact_phone" 
                    placeholder="+1 234 567 890"
                    defaultValue={editingClient?.contact_phone || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Physical Address</label>
                <input 
                  type="text" 
                  name="address" 
                  placeholder="Street, City, Country"
                  defaultValue={editingClient?.address || ''} 
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Client Notes</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  placeholder="Additional information about the client..."
                  defaultValue={editingClient?.notes || ''} 
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingClient?.status || 'active'}
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>{editingClient ? 'Update Client' : 'Create Client'} <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Contract Modal */}
      {isContractModalOpen && contractClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
               <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    New Agreement
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Generate contract for {contractClient.company_name}</p>
               </div>
               <button onClick={() => setIsContractModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateContract} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Contract Title *</label>
                  <input name="title" required placeholder="e.g. STRATEGIC GROWTH MSA" className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-xs transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Monthly Retainer ($) *</label>
                  <input name="monthly_fee" type="number" step="0.01" required placeholder="0.00" className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-xs transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Start Date *</label>
                  <input name="start_date" type="date" required className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-[11px] transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">End Date *</label>
                  <input name="end_date" type="date" required className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-[11px] transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Scope of Work</label>
                <textarea name="description" rows={3} placeholder="Describe the project scope..." className="w-full p-6 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-[11px] transition-all placeholder:text-gray-200 resize-none"></textarea>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Payment Terms</label>
                <input name="payment_terms" placeholder="e.g. NET-30" className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-xs transition-all" />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Custom Clauses</label>
                <textarea name="clauses" rows={3} placeholder="Any special requirements..." className="w-full p-6 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 font-bold text-[11px] transition-all placeholder:text-gray-200 resize-none"></textarea>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsContractModalOpen(false)} className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all active:scale-95">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isContractLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center"
                >
                  {isContractLoading ? 'Generating...' : (
                    <>Send Agreement <ArrowRight className="w-4 h-4 ml-2" /></>
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
