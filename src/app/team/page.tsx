import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CheckSquare, Timer, AlertCircle, Clock, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TeamDashboard() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch Team Member Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Assigned Tasks
  const { count: assignedTasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', user.id)
    .in('status', ['todo', 'in_progress'])

  // Tasks in Review (assigned to user)
  const { count: inReviewCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_to', user.id)
    .eq('status', 'review')

  // Total Hours logged this week
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const { data: weeklyHours } = await supabase
    .from('time_tracking')
    .select('hours')
    .eq('user_id', user.id)
    .gte('date', startOfWeek.toISOString().split('T')[0])

  const totalWeeklyHours = weeklyHours?.reduce((sum, entry) => sum + Number(entry.hours), 0) || 0

  // Recent Tasks
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, projects(title)')
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hello, {profile?.full_name?.split(' ')[0] || 'Team'}!</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your current workload and tracking.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-[#1A56DB]/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Assigned Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{assignedTasksCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-[#1A56DB] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-amber-500/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">In Review</p>
            <p className="text-3xl font-bold text-gray-900">{inReviewCount || 0}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between group hover:border-green-500/50 transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Hours This Week</p>
            <p className="text-3xl font-bold text-gray-900">{totalWeeklyHours.toFixed(1)}h</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Timer className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Your Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Recent Tasks</h2>
            <Link href="/team/tasks" className="text-sm font-medium text-[#1A56DB] hover:underline flex items-center">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      task.priority === 'urgent' ? 'bg-red-500' : 
                      task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm text-gray-900 group-hover:text-[#1A56DB] transition-colors">{task.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{(task.projects as any)?.title || (task.projects as any)?.[0]?.title || 'No Project'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
                      task.status === 'done' ? 'bg-green-50 text-green-700 border-green-100' :
                      task.status === 'review' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm italic">
                No tasks currently assigned to you.
              </div>
            )}
          </div>
        </div>

        {/* Quick Log Time */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 inline-flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
            Productivity Tips
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "Don't forget to log your hours daily! Accurate time tracking helps the agency bill clients correctly and recognize your hard work."
              </p>
            </div>
            
            <Link href="/team/time" className="block w-full text-center bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200">
              Go to Time Logs
            </Link>
            
            <Link href="/admin/ai" className="block w-full text-center border-2 border-blue-100 text-[#1A56DB] hover:bg-blue-50 py-3 rounded-xl font-bold text-sm transition-all">
              Use AI Assistant
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}