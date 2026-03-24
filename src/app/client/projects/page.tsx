import { createServerSupabaseClient } from '@/lib/supabase-server'
import { FolderOpen, Calendar, Clock, CheckCircle2, PauseCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientProjectsPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const statusIcons: Record<string, any> = {
    active: <Clock className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    paused: <PauseCircle className="w-5 h-5 text-amber-500" />,
    cancelled: <XCircle className="w-5 h-5 text-red-500" />,
  }

  const statusColors: Record<string, string> = {
    active: 'bg-blue-50 text-blue-700 border-blue-100',
    completed: 'bg-green-50 text-green-700 border-green-100',
    paused: 'bg-amber-50 text-amber-700 border-amber-100',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-500 mt-1">Track the progress and status of your agency projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-50 text-[#1A56DB] rounded-lg flex items-center justify-center mr-3">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{project.title}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mt-1 ${statusColors[project.status]}`}>
                      {statusIcons[project.status]}
                      <span className="ml-1.5 capitalize">{project.status}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                {project.description || 'No description provided for this project.'}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider">Start Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider">Estimated End</p>
                    <p className="text-sm font-medium text-gray-900">
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No projects found.</p>
            <p className="text-sm text-gray-400 mt-1">If you believe this is an error, please contact your account manager.</p>
          </div>
        )}
      </div>
    </div>
  )
}
