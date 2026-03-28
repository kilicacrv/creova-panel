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
    draft: 'bg-gray-50 text-gray-400 border-gray-100',
    sent: 'bg-red-50 text-brand-red border-red-100',
    paid: 'bg-black text-white border-black',
    overdue: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
    cancelled: 'bg-gray-100 text-gray-300 border-gray-200 italic'
  }

  const filteredProjects = projects.filter(p => p.client_id === selectedClient)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Billing Ledger</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Resource Value Liquidation</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all shadow-xl hover:shadow-red-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
          Generate Invoice
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction / Amount</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Hub / Project</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registry Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Epoch Due</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <FileText className="w-16 h-16 text-gray-100 mb-6" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] italic">Zero financial transactions logged in current cycle.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-red-50/10 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 shrink-0 transition-all shadow-inner border border-gray-50 ${invoice.status === 'paid' ? 'bg-black text-white group-hover:bg-brand-red group-hover:rotate-3' : 'bg-gray-50 text-gray-300 group-hover:text-black group-hover:bg-white'}`}>
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight text-base group-hover:text-brand-red transition-colors">
                            {invoice.amount.toLocaleString()} {invoice.currency}
                          </p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                             <FileText className="w-3 h-3 opacity-30" />
                             #{invoice.invoice_number || 'UNASSIGNED_DRAFT'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 text-[11px] uppercase tracking-tight mb-2 flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-2 text-gray-300 group-hover:text-black transition-colors" />
                        {invoice.clients?.company_name || 'SYSTEM_HUB'}
                      </div>
                      {invoice.projects && (
                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1 truncate max-w-[200px]" title={invoice.projects.title}>
                          Hub: {invoice.projects.title}
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-sm">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusColors[invoice.status] || 'bg-gray-100'}`}>
                        {invoice.status}
                      </span>
                      {invoice.status === 'paid' && invoice.paid_at && (
                        <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mt-2 ml-1 italic">
                          Liquidated: {new Date(invoice.paid_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1">
                        {invoice.due_date ? (
                          <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${invoice.status !== 'paid' && new Date(invoice.due_date) < new Date() ? 'text-brand-red' : 'text-gray-400'}`}>
                            <Calendar className="w-4 h-4 mr-2.5 opacity-30" />
                            {new Date(invoice.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 italic">Term undefined</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {invoice.status !== 'paid' && (
                          <button 
                            onClick={() => handleMarkPaid(invoice.id)}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-500 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-lg transition-all active:scale-90"
                            title="Liquidate Transaction"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => openEdit(invoice)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black hover:shadow-lg transition-all"
                          title="Modify Ledger"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(invoice.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-brand-red hover:shadow-lg transition-all"
                          title="Terminate Registry"
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                   {editingInvoice ? 'Modify Transaction' : 'Initialize Ledger'}
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Registry Financial Entry</p>
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

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient Hub <span className="text-brand-red font-black">*</span></label>
                  <select 
                    name="client_id" 
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- SELECT RADIUS --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Project</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingInvoice?.project_id || ''}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-20 translate-opacity duration-500"
                    disabled={!selectedClient}
                  >
                    <option value="">-- GENERAL HUB --</option>
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Index # <span className="text-brand-red font-black">*</span></label>
                  <input 
                    type="text" 
                    name="invoice_number" 
                    defaultValue={editingInvoice?.invoice_number || `INV-${Math.floor(Math.random() * 10000)}`} 
                    required
                    placeholder="INV-XXXX"
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Liquid Capital (AED) <span className="text-brand-red font-black">*</span></label>
                  <input 
                    type="number" 
                    name="amount"
                    step="0.01"
                    defaultValue={editingInvoice?.amount || ''} 
                    required
                    placeholder="0.00"
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Termination Due</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    defaultValue={editingInvoice?.due_date || ''} 
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational status</label>
                  <select 
                    name="status" 
                    defaultValue={editingInvoice?.status || 'draft'}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="draft">INITIAL DRAFT</option>
                    <option value="sent">TRANSMITTED / SENT</option>
                    <option value="paid">LIQUIDATED / PAID</option>
                    <option value="overdue">THREAT / OVERDUE</option>
                    <option value="cancelled">ABORT / CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kernel directives / bank metadata</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editingInvoice?.notes || ''} 
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-bold text-[11px] uppercase tracking-widest transition-all placeholder:text-gray-200 resize-none"
                  placeholder="TERMS & CLEARANCE PROTOCOLS..."
                ></textarea>
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
                    <>SAVE TRANSACTION <ArrowRight className="ml-3 w-4 h-4" /></>
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
