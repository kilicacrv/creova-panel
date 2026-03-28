import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Receipt, Download, AlertCircle, CheckCircle2, Clock, XCircle, FileText, ShieldCheck, Zap, ArrowRight, Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientInvoicesPage({ searchParams }: { searchParams: { preview_id?: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Shadowing check
  const { data: profile } = await supabase.from('profiles').select('role, client_id').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'team'
  const activeClientId = (isAdmin && searchParams.preview_id) ? searchParams.preview_id : profile?.client_id

  let query = supabase.from('invoices').select('*, projects(title)').order('created_at', { ascending: false })
  if (activeClientId) {
    query = query.eq('client_id', activeClientId)
  }

  const { data: invoices } = await query

  const statusStyles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    overdue: 'bg-red-50 text-brand-red border-red-100 animate-pulse',
    sent: 'bg-gray-50 text-gray-500 border-gray-100',
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-3 h-3 mr-2" />
      case 'pending': return <Clock className="w-3 h-3 mr-2" />
      case 'overdue': return <AlertCircle className="w-3 h-3 mr-2" />
      default: return <FileText className="w-3 h-3 mr-2" />
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Financial Ledger</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Capital Allocation & Billing History Protocol</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <div className="p-3 bg-black rounded-2xl shadow-xl">
              <Wallet className="w-5 h-5 text-white" />
           </div>
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">Matrix_Billing_Active</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descriptor</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Investment</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ledger Date</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-red-50/10 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-black text-gray-900 uppercase tracking-tight text-sm group-hover:text-brand-red transition-colors italic">{invoice.invoice_number || 'NODE_PENDING'}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mt-1 opacity-60">Linked Node: {invoice.projects?.title || 'GENERIC_SERVICE'}</p>
                    </td>
                    <td className="px-10 py-8 font-black text-gray-900 text-right text-base italic">
                      ${invoice.amount.toLocaleString()} <span className="text-[10px] text-gray-400 not-italic uppercase tracking-widest ml-1">{invoice.currency}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusStyles[invoice.status] || 'bg-gray-50 text-gray-500'}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-3 opacity-30" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {new Date(invoice.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button className="bg-black hover:bg-brand-red text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-red-200 active:scale-95 flex items-center justify-end ml-auto group/btn">
                        View Detail <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <Receipt className="w-16 h-16 text-gray-100 mb-6" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] italic">Zero ledger entries identified in history.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Support Section */}
      <div className="bg-black border border-gray-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red rounded-full blur-[100px] opacity-10 -mr-32 -mt-32"></div>
        <div className="flex items-center mb-8 md:mb-0 relative z-10">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mr-6">
              <Zap className="w-6 h-6 text-brand-red animate-pulse" />
           </div>
           <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-1">Billing Support Protocol</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-md leading-relaxed">Active financial oversight interface. For calibration queries, initiate uplink with <a href="mailto:billing@creova.media" className="text-brand-red underline hover:text-white transition-colors">billing@creova.media</a></p>
           </div>
        </div>
        <button className="px-10 py-4 bg-white hover:bg-brand-red hover:text-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10 active:scale-95 shadow-xl">
           Open Support Ticket
        </button>
      </div>
    </div>
  )
}
