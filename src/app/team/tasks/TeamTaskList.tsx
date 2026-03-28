'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, Calendar, ArrowRight, ExternalLink, Zap } from 'lucide-react'
import { updateMyTaskStatus } from './actions'

type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  projects: { title: string }
}

export default function TeamTaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleStatusChange(id: string, newStatus: string) {
    setLoadingId(id)
    try {
      const result = await updateMyTaskStatus(id, newStatus)
      if (result?.error) {
        alert(result.error)
      } else {
        setTasks(prev => prev.map(t => 
          t.id === id ? { ...t, status: newStatus as any } : t
        ))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  const priorityColors = {
    low: 'bg-gray-50 text-gray-400 border-gray-100',
    medium: 'bg-black text-white border-black',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    urgent: 'bg-red-50 text-brand-red border-red-100 animate-pulse',
  }

  const statusStyles = {
    todo: 'bg-gray-50 text-gray-500 border-gray-200',
    in_progress: 'bg-red-50 text-brand-red border-red-100',
    review: 'bg-black text-white border-black',
    done: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 shadow-sm transition-all hover:bg-gray-50/50">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 italic">Registry Secure: Zero active payloads assigned to this node.</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm transition-all group hover:shadow-2xl hover:shadow-red-100 hover:border-red-100 border-l-8 border-l-transparent hover:border-l-brand-red relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border transition-all ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <div className="h-4 w-px bg-gray-100 mx-1" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-brand-red transition-colors flex items-center shrink-0">
                     <Zap className="w-3 h-3 mr-1.5 opacity-40 shrink-0" />
                     {task.projects.title}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-brand-red transition-colors uppercase tracking-tight">{task.title}</h3>
                <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed max-w-2xl">{task.description || 'Static documentation node: No functional description provided.'}</p>
                
                <div className="flex items-center mt-6 text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-gray-900 transition-colors">
                   <Calendar className="w-3.5 h-3.5 mr-2" />
                   Temporal Deadline: {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'OPEN CLUSTER'}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="relative group/select">
                  <select 
                    value={task.status}
                    disabled={loadingId === task.id}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`
                      appearance-none px-6 py-4 pr-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-50 relative z-10
                      ${statusStyles[task.status] || 'bg-gray-50 text-gray-600 border-gray-200'}
                    `}
                  >
                    <option value="todo">Pending Ops</option>
                    <option value="in_progress">Active Execution</option>
                    <option value="review">Internal Audit</option>
                    <option value="done">Terminated / Done</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-40 z-20">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                {loadingId === task.id && (
                  <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                )}
                
                <button className="p-4 bg-gray-50 text-gray-300 hover:text-brand-red hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-red-50">
                    <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
