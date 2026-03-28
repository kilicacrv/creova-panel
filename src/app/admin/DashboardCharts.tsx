'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type TopClient = { name: string; revenue: number }

export default function DashboardCharts({ topClients }: { topClients: TopClient[] }) {
  if (!topClients || topClients.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        No chart data available yet
      </div>
    )
  }

  const chartData = topClients.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    revenue: c.revenue,
  }))

  const colors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#9CA3AF' }} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip 
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
              fontSize: '13px',
              fontWeight: 500
            }}
            formatter={(value: any) => [`${Number(value).toLocaleString()} AED`, 'Revenue']}
          />
          <Bar 
            dataKey="revenue" 
            fill="#2563EB" 
            radius={[4, 4, 0, 0]} 
            barSize={32}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
