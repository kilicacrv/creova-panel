'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, Calendar, ArrowRight, ExternalLink } from 'lucide-react'
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
    low: 'bg-gray-50 text-gray-600 border-gray-100',
    medium: 'bg-blue-50 text-blue-700 border-blue-100',
    high: 'bg-orange-50 text-orange-700 border-orange-100',
    urgent: 'bg-red-50 text-red-700 border-red-100',
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">You have no tasks assigned to you.</p>
          <p className="text-sm text-gray-400 mt-1">Enjoy your free time or check with your manager!</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-[#1A56DB]/30 transition-all group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">/{task.projects.title}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1A56DB] transition-colors">{task.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description || 'No description provided.'}</p>
                
                <div className="flex items-center mt-3 text-xs text-gray-400 font-medium">
                   <Calendar className="w-3.5 h-3.5 mr-1" />
                   Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <select 
                    value={task.status}
                    disabled={loadingId === task.id}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`
                      appearance-none px-4 py-2 pr-10 rounded-lg text-sm font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/50
                      ${task.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                        task.status === 'review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'}
                    `}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done / Completed</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                {loadingId === task.id && (
                  <div className="w-5 h-5 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
