import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Receipt, Download, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'

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

  const statusColors: Record<string, string> = {
    paid: 'bg-green-50 text-green-700 border-green-100',
    sent: 'bg-blue-50 text-blue-700 border-blue-100',
    overdue: 'bg-red-50 text-red-700 border-red-100',
    draft: 'bg-gray-50 text-gray-700 border-gray-100',
  }

  const statusIcons: Record<string, any> = {
    paid: <CheckCircle2 className="w-4 h-4 mr-1.5" />,
    sent: <Clock className="w-4 h-4 mr-1.5" />,
    overdue: <AlertCircle className="w-4 h-4 mr-1.5" />,
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
        <p className="text-gray-500 mt-1">Manage your payments, download invoices, and track your billing history.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Invoice Details</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{invoice.invoice_number || 'INV-PENDING'}</p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">{invoice.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium">{invoice.projects?.title || 'General Agency Service'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{invoice.amount.toLocaleString()} {invoice.currency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[invoice.status]}`}>
                        {statusIcons[invoice.status]}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">No invoices found.</p>
                    <p className="text-xs text-gray-400 mt-1">Your billing history will appear here once an invoice is generated.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start">
        <AlertCircle className="w-6 h-6 text-[#1A56DB] mr-4 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-blue-900 mb-1 text-lg">Payment Support</h3>
          <p className="text-blue-800 text-sm">
            Have questions about your invoice? Reach out to our finance department at <a href="mailto:billing@creova.media" className="font-bold underline">billing@creova.media</a> or contact your account manager directly via the agency dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
