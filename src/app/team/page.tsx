import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CheckSquare, Timer, AlertCircle, Clock, ArrowRight, Star, Zap, LayoutDashboard } from 'lucide-react'
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
    <div className="space-y-10">
      <div className="flex justify-between items-end bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red">Operational Status: Online</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            Greetings, {profile?.full_name?.split(' ')[0] || 'Node'}
          </h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Personal Performance & Payload Overview</p>
        </div>
        <div className="hidden md:block relative z-10">
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Temporal Stamp</p>
                <p className="text-sm font-black text-gray-900 mt-1 uppercase italic">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-start justify-between group hover:shadow-2xl hover:shadow-red-100 transition-all border-b-4 border-b-transparent hover:border-b-brand-red">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assigned Payloads</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{assignedTasksCount || 0}</p>
          </div>
          <div className="w-14 h-14 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all shadow-inner ring-1 ring-red-100 group-hover:rotate-6">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-start justify-between group hover:shadow-2xl transition-all border-b-4 border-b-transparent hover:border-b-black">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Review</p>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{inReviewCount || 0}</p>
          </div>
          <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-inner border border-gray-100 group-hover:rotate-6">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-black p-8 rounded-[2rem] shadow-2xl flex items-start justify-between group hover:bg-[#0a0a0a] transition-all relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-red rounded-full blur-3xl opacity-20 -mr-16 -mb-16"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Weekly Quantum</p>
            <p className="text-4xl font-black text-white tracking-tighter">{totalWeeklyHours.toFixed(1)}<span className="text-lg ml-0.5 text-brand-red italic opacity-50">h</span></p>
          </div>
          <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center group-hover:bg-brand-red transition-all shadow-xl backdrop-blur-md border border-white/10 group-hover:rotate-6 relative z-10">
            <Timer className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Your Tasks */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -ml-16 -mt-16 opacity-30"></div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">Recent Payloads</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">High-Priority Directives</p>
            </div>
            <Link href="/team/tasks" className="p-3 bg-gray-50 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-xl transition-all group">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4 relative z-10">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-5 rounded-[1.5rem] bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all group border border-transparent hover:border-gray-100">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-4 shadow-sm ${
                      task.priority === 'urgent' ? 'bg-brand-red animate-pulse' : 
                      task.priority === 'high' ? 'bg-orange-500' : 'bg-black'
                    }`} />
                    <div>
                      <p className="font-black text-sm text-gray-900 uppercase tracking-tight group-hover:text-brand-red transition-colors">{task.title}</p>
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] mt-1 italic">{(task.projects as any)?.title || (task.projects as any)?.[0]?.title || 'System Core'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border transition-all ${
                      task.status === 'done' ? 'bg-black text-white border-black' :
                      task.status === 'review' ? 'bg-red-50 text-brand-red border-red-100' :
                      'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Registry clear. Zero active payloads.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Log Time */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic inline-flex items-center">
              <Zap className="w-6 h-6 mr-3 text-brand-red" />
              Operational Core
            </h2>
            <div className="space-y-6">
              <div className="p-8 bg-black rounded-[2rem] border border-gray-900 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <p className="text-sm text-gray-400 font-medium leading-relaxed italic relative z-10">
                  "Maintain precision in temporal logging. Accurate data aggregation drives agency scalability and individual merit verification."
                </p>
                <div className="mt-6 flex items-center gap-3 relative z-10">
                  <div className="w-8 h-px bg-brand-red/30" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">System Intelligence Node</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link href="/team/time" className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-3xl hover:border-brand-red hover:shadow-xl hover:shadow-red-50 transition-all group">
                  <Timer className="w-6 h-6 text-gray-300 group-hover:text-brand-red transition-colors mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Log Effort</span>
                </Link>
                <Link href="/admin/ai" className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-3xl hover:border-black hover:shadow-xl hover:shadow-gray-100 transition-all group">
                  <SparklesIcon className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Neural Assist</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-10 p-6 bg-red-50/50 rounded-2xl border border-red-50">
             <div className="flex items-center justify-between">
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-brand-red">
                   <LayoutDashboard className="w-4 h-4 mr-2" />
                   System Health: 99.8%
                </div>
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                   <div className="w-[99.8%] h-full bg-brand-red" />
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}