export default function Loading() {
  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Banner Skeleton */}
      <div className="h-24 bg-gray-100 rounded-2xl w-full animate-pulse" />
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded-lg w-64" />
          <div className="h-4 bg-gray-100 rounded w-80" />
        </div>
        <div className="flex gap-4">
           <div className="w-10 h-10 bg-gray-100 rounded-full" />
           <div className="w-12 h-12 bg-gray-200 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-50 border border-gray-100 rounded-2xl" />
            ))}
          </div>
          <div className="h-48 bg-gray-50 border border-gray-100 rounded-2xl" />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <div className="h-48 bg-gray-900 border border-gray-800 rounded-2xl" />
          <div className="h-72 bg-gray-50 border border-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
