import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Building2, FolderOpen, Receipt, CalendarCheck, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientDashboard() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch Client Profile Data
  const { data: clientData } = await supabase
    .from('clients')
    .select('company_name, id')
    .eq('user_id', user.id)
    .single()

  // Because of RLS, these queries automatically filter for the connected client
  const { count: activeProjectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: pendingInvoicesCount } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .in('status', ['sent', 'overdue'])

  const { count: pendingApprovalsCount } = await supabase
    .from('content_calendar')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { data: recentInvoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, amount, status, due_date')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {clientData?.company_name || 'Client'}!</h1>
        <p className="text-gray-500 mt-1">Here is the latest overview of your agency projects and pending actions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-[#1A56DB]/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Active Projects</p>
            <p className="text-3xl font-bold text-gray-900">{activeProjectsCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-[#1A56DB] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-red-500/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Invoices</p>
            <p className="text-3xl font-bold text-gray-900">{pendingInvoicesCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-amber-500/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Awaiting Approval</p>
            <p className="text-3xl font-bold text-gray-900">{pendingApprovalsCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action required & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/client/approvals" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center mr-4 text-amber-600">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Review Content Calendar</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pendingApprovalsCount || 0} posts awaiting your approval</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1A56DB] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link href="/client/projects" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center mr-4 text-[#1A56DB]">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">View Project Progress</p>
                  <p className="text-xs text-gray-500 mt-0.5">Track deliverables and milestones</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1A56DB] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Billing</h2>
            <Link href="/client/invoices" className="text-sm font-medium text-[#1A56DB] hover:underline">View All</Link>
          </div>
          
          <div className="space-y-3">
            {recentInvoices && recentInvoices.length > 0 ? (
              recentInvoices.map(invoice => (
                <div key={invoice.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${invoice.status === 'paid' ? 'bg-green-100 text-green-600' : invoice.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{invoice.invoice_number}</p>
                      <p className="text-xs text-gray-500">Due {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon receipt'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{invoice.amount.toLocaleString()} AED</p>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${invoice.status === 'paid' ? 'text-green-600' : invoice.status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg">
                No recent billing activity found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}