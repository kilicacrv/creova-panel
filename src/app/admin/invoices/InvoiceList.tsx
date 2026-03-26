'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, FileText, AlertCircle, Building2, Calendar, CheckCircle, Clock } from 'lucide-react'
import { createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } from './actions'

type Client = { id: string; company_name: string }
type Project = { id: string; title: string; client_id: string }

type Invoice = {
  id: string
  client_id: string
  project_id: string | null
  invoice_number: string | null
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  clients?: Client
  projects?: Project
}

export default function InvoiceList({ 
  initialInvoices, 
  clients,
  projects
}: { 
  initialInvoices: Invoice[]
  clients: Client[]
  projects: Project[]
}) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter projects depending on selected client in modal
  const [selectedClient, setSelectedClient] = useState<string>('')

  function openCreate() {
    setError('')
    setEditingInvoice(null)
    setSelectedClient('')
    setIsModalOpen(true)
  }

  function openEdit(invoice: Invoice) {
    setError('')
    setEditingInvoice(invoice)
    setSelectedClient(invoice.client_id)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    try {
      const result = await deleteInvoice(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setInvoices(prev => prev.filter(i => i.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      const result = await updateInvoiceStatus(id, 'paid')
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
      if (editingInvoice) {
        result = await updateInvoice(editingInvoice.id, formData)
      } else {
        result = await createInvoice(formData)
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
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-200 text-gray-500'
  }

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing, payments, and overdue tracking.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Invoice # & Amount</th>
                <th className="px-6 py-4">Client / Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No invoices found. Click "Create Invoice" to add one.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 shrink-0 ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {invoice.amount.toLocaleString()} {invoice.currency}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">#{invoice.invoice_number || 'Draft'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1" />
                        {invoice.clients?.company_name || 'Unknown Client'}
                      </div>
                      {invoice.projects && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={invoice.projects.title}>
                          Project: {invoice.projects.title}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                        {invoice.status}
                      </span>
                      {invoice.status === 'paid' && invoice.paid_at && (
                        <div className="text-[10px] text-gray-500 mt-1">
                          Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {invoice.due_date ? (
                          <div className={`flex items-center text-xs ${invoice.status !== 'paid' && new Date(invoice.due_date) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No due date</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.status !== 'paid' && (
                        <button 
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="p-2 border border-green-200 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors mr-2"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => openEdit(invoice)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-2"
                        title="Edit Invoice"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice.id)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete Invoice"
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
                {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
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
                    defaultValue={editingInvoice?.project_id || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white disabled:opacity-50"
                    disabled={!selectedClient}
                  >
                    <option value="">-- General Invoice / No Project --</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                  <input 
                    type="text" 
                    name="invoice_number" 
                    defaultValue={editingInvoice?.invoice_number || `INV-${Math.floor(Math.random() * 10000)}`} 
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (AED) *</label>
                  <input 
                    type="number" 
                    name="amount"
                    step="0.01"
                    defaultValue={editingInvoice?.amount || ''} 
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    defaultValue={editingInvoice?.due_date || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingInvoice?.status || 'draft'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  name="notes" 
                  rows={2}
                  defaultValue={editingInvoice?.notes || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                  placeholder="Bank details, terms, or descriptions..."
                ></textarea>
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
                  {isLoading ? 'Saving...' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
