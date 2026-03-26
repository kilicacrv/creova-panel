export default function TasksLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full animate-pulse flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 shrink-0">
        <div>
          <div className="h-8 bg-gray-200 rounded w-56 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80 max-w-full"></div>
        </div>
        <div className="h-11 bg-gray-200 rounded-xl w-32 hidden md:block"></div>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start snap-x hide-scrollbar">
        {[1, 2, 3, 4].map(col => (
          <div key={col} className="w-80 shrink-0 snap-center bg-gray-50 rounded-2xl flex flex-col max-h-full border border-gray-100 p-2">
            <div className="p-3 mb-2 flex justify-between items-center">
               <div className="h-5 bg-gray-200 rounded w-24"></div>
               <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-1">
               {[1, 2, 3].map(card => (
                 <div key={card} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-16 bg-gray-100 rounded w-full"></div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50">
                       <div className="w-16 h-6 bg-gray-100 rounded-md"></div>
                       <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
