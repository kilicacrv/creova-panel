import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 h-32 flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <div className="w-10 h-10 rounded-lg bg-gray-100"></div>
               <div className="w-16 h-6 rounded-full bg-gray-100"></div>
            </div>
            <div>
               <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
               <div className="h-3 bg-gray-100 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6 h-64 flex flex-col items-center justify-center">
           <Loader2 className="w-8 h-8 text-blue-200 animate-spin mb-4" />
           <div className="h-4 bg-gray-100 rounded w-32"></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 h-64 space-y-4">
           <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
           {[1, 2, 3].map(i => (
             <div key={i} className="flex gap-4 items-center border-b border-gray-50 pb-3">
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                 <div className="h-3 bg-gray-100 rounded w-1/2"></div>
               </div>
               <div className="w-12 h-6 bg-gray-100 rounded-md"></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
