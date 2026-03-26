export default function MediaLoading() {
  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-72 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 max-w-full"></div>
        </div>
      </div>
      
      {/* Search & Tabs Skeleton */}
      <div className="h-16 flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 mb-6">
         <div className="w-64 h-10 bg-gray-100 rounded-xl"></div>
         <div className="hidden md:flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-10 bg-gray-100 rounded-xl"></div>)}
         </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full h-12 bg-gray-50 border-b border-gray-100"></div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex p-4 border-b border-gray-50 gap-6 items-center">
             <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
             
             <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-100 rounded w-32"></div>
             </div>
             
             <div className="hidden md:block flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-100 rounded w-24"></div>
             </div>

             <div className="w-20 h-6 bg-gray-100 rounded-full shrink-0"></div>
             <div className="w-20 h-6 bg-gray-100 rounded shrink-0 ml-4 hidden md:block"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
