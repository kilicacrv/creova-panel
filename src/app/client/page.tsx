import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function ClientPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="2,14 7,8 11,12 16,6 22,4"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Creova Media</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Client Portal</span>
        </div>
        <span className="text-sm text-gray-500">{clientData?.company_name || user.email}</span>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome, {clientData?.company_name || 'Client'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">Track your projects, invoices and content approvals.</p>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Projects', value: '—' },
            { label: 'Pending Invoices', value: '—' },
            { label: 'Pending Approvals', value: '—' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="text-xl font-semibold text-gray-900 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}