import { createServerSupabaseClient } from '@/lib/supabase-server'
import { FolderOpen, Calendar, Clock, CheckCircle2, AlertCircle, Briefcase, Zap, Target, ArrowRight, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientProjectsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const statusIcons: Record<string, any> = {
    active: <Zap className="w-4 h-4 mr-2" />,
    completed: <ShieldCheck className="w-4 h-4 mr-2" />,
    on_hold: <AlertCircle className="w-4 h-4 mr-2" />,
  }

  const statusColors: Record<string, string> = {
    active: 'bg-black text-white border-black shadow-lg shadow-black/10',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    on_hold: 'bg-amber-50 text-amber-600 border-amber-100',
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-bold">Project Matrix</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-normal mt-1">Active Projects & Strategic Deliverable Tracking</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
              <Target className="w-5 h-5 text-blue-600" />
           </div>
           <span className="text-[10px] font-bold text-gray-900 uppercase tracking-normal italic">Hub_Synchronization_Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
        {!projects || projects.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
            <FolderOpen className="w-20 h-20 text-gray-100 mb-8" />
            <h3 className="text-gray-900 font-bold text-2xl uppercase tracking-tight italic">No Active Nodes</h3>
            <p className="text-gray-400 text-[10px] font-semibold text-sm mt-2 max-w-sm">No operational project nodes identified in your current portfolio registry.</p>
          </div>
        ) : (
          projects.map((project: any) => (
            <div key={project.id} className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm hover:shadow-2xl hover:border-gray-200 transition-all duration-500 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity -mr-12 -mt-12"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-transform group-hover:rotate-6 ${project.status === 'active' ? 'bg-black text-white shadow-xl shadow-black/10' : 'bg-gray-50 border border-gray-100 text-gray-400'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-semibold text-sm border transition-all ${statusColors[project.status] || 'bg-gray-100 text-gray-700'}`}>
                  {statusIcons[project.status]}
                  {project.status}
                </span>
              </div>
              
              <div className="space-y-4 mb-10 relative z-10 flex-grow">
                 <h2 className="font-bold text-gray-900 text-xl uppercase tracking-tight italic leading-none group-hover:text-blue-600 transition-colors">{project.title}</h2>
                 <div className="h-0.5 w-10 bg-blue-600 group-hover:w-full transition-all duration-500"></div>
                 <p className="text-gray-400 text-[11px] font-bold uppercase tracking-tight leading-relaxed line-clamp-3">
                   {project.description || 'System_Audit: No descriptive payload identified for this node.'}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-50 mt-auto relative z-10">
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-300">Initialized</p>
                  <div className="flex items-center text-[10px] font-bold text-gray-900 uppercase tracking-normal italic font-mono">
                    <Clock className="w-3.5 h-3.5 mr-2.5 text-blue-600 opacity-30" />
                    {project.start_date ? new Date(project.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-gray-300">Projected Uplink</p>
                  <div className="flex items-center text-[10px] font-bold text-gray-900 uppercase tracking-normal italic font-mono">
                    <Calendar className="w-3.5 h-3.5 mr-2.5 text-black opacity-30" />
                    {project.end_date ? new Date(project.end_date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full py-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl text-[10px] font-semibold text-sm transition-all opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 flex items-center justify-center">
                 Access Portal <ArrowRight className="w-4 h-4 ml-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
