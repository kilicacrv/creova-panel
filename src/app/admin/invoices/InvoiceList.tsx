'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, FileText, AlertCircle, Building2, Calendar, CheckCircle, Clock, Zap, ArrowRight, DollarSign, X } from 'lucide-react'
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
    draft: 'bg-gray-50 text-gray-500 border-gray-100',
    sent: 'bg-blue-50 text-blue-600 border-blue-100',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    overdue: 'bg-red-50 text-red-600 border-red-100',
    cancelled: 'bg-gray-100 text-gray-400 border-gray-200'
  }

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Billing and financial records</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Invoice
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client / Project</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <FileText className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-sm font-medium text-gray-400">No invoices found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-red-50/10 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 shrink-0 transition-all shadow-sm border border-gray-100 ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                            {invoice.amount.toLocaleString()} {invoice.currency}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 mt-1 flex items-center gap-1.5">
                             <FileText className="w-3 h-3" />
                             #{invoice.invoice_number || 'Draft'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-semibold text-gray-900 text-xs flex items-center mb-1">
                        <Building2 className="w-3.5 h-3.5 mr-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        {invoice.clients?.company_name || 'Individual'}
                      </div>
                      {invoice.projects && (
                        <div className="text-[10px] font-medium text-gray-400 truncate max-w-[180px]" title={invoice.projects.title}>
                          Project: {invoice.projects.title}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-xs">
                      <span className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      {invoice.status === 'paid' && invoice.paid_at && (
                        <div className="text-[10px] font-medium text-emerald-600 mt-1.5 ml-0.5">
                          Paid: {new Date(invoice.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {invoice.due_date ? (
                          <div className={`flex items-center text-[10px] font-medium ${invoice.status !== 'paid' && new Date(invoice.due_date) < new Date() ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                            <Calendar className="w-3.5 h-3.5 mr-2 text-gray-300" />
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 italic">No date</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {invoice.status !== 'paid' && (
                          <button 
                            onClick={() => handleMarkPaid(invoice.id)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => openEdit(invoice)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Invoice"
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
                   {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Configure invoice details and billing</p>
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

              <div className="grid grid-cols-2 gap-4">
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
                    defaultValue={editingInvoice?.project_id || ''}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer disabled:opacity-50"
                    disabled={!selectedClient}
                  >
                    <option value="">No project</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Invoice Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="invoice_number" 
                    defaultValue={editingInvoice?.invoice_number || `INV-${Math.floor(Math.random() * 10000)}`} 
                    required
                    placeholder="INV-XXXX"
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Amount (AED) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="amount"
                    step="0.01"
                    defaultValue={editingInvoice?.amount || ''} 
                    required
                    placeholder="0.00"
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Due Date</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    defaultValue={editingInvoice?.due_date || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingInvoice?.status || 'draft'}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Notes / Terms</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editingInvoice?.notes || ''} 
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none"
                  placeholder="Additional terms or payment instructions..."
                ></textarea>
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
                    <>{editingInvoice ? 'Update Invoice' : 'Create Invoice'} <ArrowRight className="ml-2 w-4 h-4" /></>
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
