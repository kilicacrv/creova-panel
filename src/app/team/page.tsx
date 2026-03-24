import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!['admin', 'team'].includes(profile?.role)) redirect('/login')

  // Kendi task'larını getir
  const { data: myTasks } = await supabase
    .from('tasks')
    .select('*, projects(title)')
    .eq('assigned_to', user.id)
    .in('status', ['todo', 'in_progress', 'review'])
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true })
    .limit(20)

  const { count: totalTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', user.id)
    .in('status', ['todo', 'in_progress', 'review'])

  const { count: doneTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', user.id)
    .eq('status', 'done')

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-600',
  }

  const statusColors: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    done: 'bg-green-100 text-green-700',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="2,14 7,8 11,12 16,6 22,4"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Creova Media</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Team</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{profile?.full_name || user.email}</span>
          <form action="/auth/logout" method="POST">
            <button 
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Tasks</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-1">Active Tasks</div>
            <div className="text-3xl font-semibold text-gray-900">{totalTasks ?? 0}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-1">Completed Tasks</div>
            <div className="text-3xl font-semibold text-green-600">{doneTasks ?? 0}</div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {myTasks && myTasks.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {myTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
                      {(task.projects as { title?: string })?.title && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          📁 {(task.projects as { title?: string }).title}
                        </p>
                      )}
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] || ''}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status] || ''}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {task.due_date && (
                    <p className="text-xs text-gray-400 mt-2">📅 Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No active tasks assigned to you. 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}