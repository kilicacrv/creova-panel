import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/login')

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
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <span className="text-sm text-gray-500">{profile?.full_name || user.email}</span>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Projects', value: '12', change: '+3 this month' },
            { label: 'Monthly Revenue', value: '84,200 AED', change: '+18% vs last month' },
            { label: 'Active Clients', value: '27', change: '+4 new clients' },
            { label: 'Pending Invoices', value: '6', change: '24,500 AED pending' },
          ].map((metric) => (
            <div key={metric.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-2">{metric.label}</div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-xs text-gray-400">{metric.change}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Welcome to Creova Media Admin Panel</h2>
          <p className="text-sm text-gray-500">Full dashboard coming soon. All modules are being built.</p>
        </div>
      </div>
    </div>
  )
}