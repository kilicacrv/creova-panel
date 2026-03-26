export default function ClientsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96 max-w-full"></div>
        </div>
        <div className="h-11 bg-gray-200 rounded-xl w-40"></div>
      </div>
      
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100 mb-8 p-6">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex-1 space-y-3 sm:pl-6 pt-4 sm:pt-0">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex-1 space-y-3 sm:pl-6 pt-4 sm:pt-0">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0"></div>
              <div className="w-16 h-6 rounded-full bg-gray-100"></div>
            </div>
            <div className="space-y-3 flex-1 mb-6">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </div>
            <div className="flex border-t border-gray-50 pt-4 gap-2">
              <div className="h-10 bg-gray-100 rounded-lg flex-1"></div>
              <div className="h-10 bg-gray-100 rounded-lg flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
