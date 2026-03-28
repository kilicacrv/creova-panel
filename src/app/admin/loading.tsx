import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded-xl w-64"></div>
          <div className="h-3 bg-gray-50 rounded-lg w-96"></div>
        </div>
        <div className="w-14 h-14 bg-gray-100 rounded-2xl"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-50 rounded-[2.5rem] p-8 h-48 flex flex-col justify-between">
            <div className="flex items-center justify-between">
               <div className="w-12 h-12 rounded-2xl bg-gray-50"></div>
               <div className="w-12 h-6 rounded-lg bg-gray-50"></div>
            </div>
            <div className="space-y-3">
               <div className="h-10 bg-gray-100 rounded-xl w-32"></div>
               <div className="h-3 bg-gray-50 rounded-lg w-20"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-black/5 border border-gray-100 rounded-[2.5rem] p-10 h-80 flex flex-col items-center justify-center relative overflow-hidden">
           <Loader2 className="w-12 h-12 text-brand-red animate-spin mb-6" />
           <div className="h-3 bg-gray-200/50 rounded-full w-48"></div>
        </div>
        <div className="lg:col-span-4 bg-white border border-gray-50 rounded-[2.5rem] p-10 h-80 space-y-8">
           <div className="h-4 bg-gray-100 rounded-lg w-1/3 mb-10"></div>
           {[1, 2, 3].map(i => (
             <div key={i} className="flex gap-6 items-center">
               <div className="w-2 h-2 rounded-full bg-gray-100 shrink-0"></div>
               <div className="flex-1 space-y-3">
                 <div className="h-4 bg-gray-100 rounded-lg w-3/4"></div>
                 <div className="h-2 bg-gray-50 rounded-lg w-1/2"></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
