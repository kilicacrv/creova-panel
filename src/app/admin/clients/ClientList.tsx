'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Mail, Phone, MapPin, Building2, AlertCircle, FileText, ExternalLink, LogIn } from 'lucide-react'
import { createClient, updateClient, deleteClient } from './actions'

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

import { createContract } from '../proposals/contractActions'
import { createClientAccount } from './clientAuthActions'

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
    // We redirect to a special preview route or just pass preview_id
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your agency clients and their details.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Contract</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No clients found. Click "Add Client" to create one.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-3 shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.company_name}</p>
                          {client.address && <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate" title={client.address}>{client.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.contact_email && (
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-3.5 h-3.5 mr-2" />
                            <a href={`mailto:${client.contact_email}`} className="hover:text-brand-red hover:underline">{client.contact_email}</a>
                          </div>
                        )}
                        {client.contact_phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-3.5 h-3.5 mr-2" />
                            <span>{client.contact_phone}</span>
                          </div>
                        )}
                        {!client.contact_email && !client.contact_phone && (
                          <span className="text-gray-400 italic">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const hasActive = client.contracts?.some(c => c.status === 'active')
                        const hasPending = client.contracts?.some(c => c.status === 'pending')
                        if (hasActive) {
                          return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-200 flex inline-flex items-center"><FileText className="w-3 h-3 mr-1"/> Active</span>
                        }
                        if (hasPending) {
                          return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200 flex inline-flex items-center"><FileText className="w-3 h-3 mr-1"/> Pending</span>
                        }
                        return <span className="text-gray-400 text-xs italic">No Contract</span>
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Quick Actions */}
                      <div className="flex justify-end gap-1 mb-2">
                        <button 
                          onClick={() => {
                            setContractClient(client)
                            setIsContractModalOpen(true)
                          }}
                          className="p-1.5 bg-red-50 text-brand-red rounded-md hover:bg-red-100 transition-colors"
                          title="Generate Contract"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleSendWelcome(client)}
                          className="p-1.5 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors"
                          title="Send Welcome Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleLoginAsClient(client)}
                          className="p-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                          title="Login as Client"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => openEdit(client)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-brand-red hover:bg-red-50 hover:border-red-200 transition-colors"
                          title="Edit Client Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                          title="Delete Client entirely"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input 
                  type="text" 
                  name="company_name" 
                  defaultValue={editingClient?.company_name || ''} 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Ad Account ID</label>
                  <input 
                    type="text" 
                    name="meta_ad_account_id" 
                    placeholder="act_XXXXXXXXX"
                    defaultValue={editingClient?.meta_ad_account_id || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input 
                    type="url" 
                    name="logo_url" 
                    placeholder="https://..."
                    defaultValue={editingClient?.logo_url || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input 
                    type="email" 
                    name="contact_email" 
                    defaultValue={editingClient?.contact_email || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    name="contact_phone" 
                    defaultValue={editingClient?.contact_phone || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  defaultValue={editingClient?.address || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editingClient?.notes || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingClient?.status || 'active'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Contract Modal */}
      {isContractModalOpen && contractClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Generate Contract for {contractClient.company_name}
              </h2>
              <button onClick={() => setIsContractModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateContract} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                  <input name="title" required placeholder="Agency Master Service Agreement" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($) *</label>
                  <input name="monthly_fee" type="number" step="0.01" required placeholder="2500" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input name="start_date" type="date" required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input name="end_date" type="date" required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                <textarea name="description" rows={3} placeholder="Full-service social media management, including content creation and ad optimization..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <input name="payment_terms" placeholder="Net 30, Payment due on the 1st of each month" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Contract Clauses</label>
                <textarea name="clauses" rows={3} placeholder="Add any special terms or termination policies here..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-red outline-none resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                <button type="button" onClick={() => setIsContractModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isContractLoading}
                  className="px-6 py-2 bg-brand-red text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isContractLoading ? 'Generating...' : 'Confirm & Send to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
