import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded-md w-48"></div>
        <div className="h-4 bg-gray-100 rounded-md w-32"></div>
      </div>
      
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-[130px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-gray-100"></div>
              <div className="w-16 h-5 rounded-md bg-gray-100"></div>
            </div>
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 rounded-md w-24"></div>
              <div className="h-3 bg-gray-100 rounded-md w-20"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6 h-[360px] flex flex-col">
          <div className="h-4 bg-gray-200 rounded-md w-32 mb-6"></div>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        </div>
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 h-[360px]">
          <div className="h-4 bg-gray-200 rounded-md w-28 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-100 rounded-md w-3/4"></div>
                  <div className="h-2.5 bg-gray-50 rounded-md w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
