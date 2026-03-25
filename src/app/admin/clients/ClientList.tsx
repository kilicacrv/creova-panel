'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Mail, Phone, MapPin, Building2, AlertCircle } from 'lucide-react'
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
}

export default function ClientList({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
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
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Added</th>
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
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 mr-3 shrink-0">
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
                            <a href={`mailto:${client.contact_email}`} className="hover:text-blue-600 hover:underline">{client.contact_email}</a>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEdit(client)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-2"
                        title="Edit Client"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete Client"
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input 
                    type="email" 
                    name="contact_email" 
                    defaultValue={editingClient?.contact_email || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input 
                    type="tel" 
                    name="contact_phone" 
                    defaultValue={editingClient?.contact_phone || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  defaultValue={editingClient?.address || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editingClient?.notes || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingClient?.status || 'active'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
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
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1e4eb8] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
