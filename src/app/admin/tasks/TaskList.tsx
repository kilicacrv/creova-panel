'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Calendar, AlertCircle, User as UserIcon, ListTodo, X, Zap, ArrowRight, ArrowUpRight } from 'lucide-react'
import { createTask, updateTask, updateTaskStatus, deleteTask } from './actions'

type Project = { id: string; title: string }
type TeamMember = { id: string; full_name: string | null; email?: string }

type Task = {
  id: string
  project_id: string
  assigned_to: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  created_at: string
  projects?: Project
  profiles?: TeamMember
}

export default function TaskList({ 
  initialTasks, 
  projects, 
  team 
}: { 
  initialTasks: Task[]
  projects: Project[]
  team: TeamMember[]
}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setError('')
    setEditingTask(null)
    setIsModalOpen(true)
  }

  function openEdit(task: Task) {
    setError('')
    setEditingTask(task)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      const result = await deleteTask(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setTasks(prev => prev.filter(t => t.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t))
      const result = await updateTaskStatus(id, newStatus)
      if (result?.error) {
        alert(result.error)
        window.location.reload()
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
      window.location.reload()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      let result
      if (editingTask) {
        result = await updateTask(editingTask.id, formData)
      } else {
        result = await createTask(formData)
      }

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const columns = [
    { id: 'todo', title: 'To Do', bgColor: 'bg-gray-50/50', accent: 'border-gray-100' },
    { id: 'in_progress', title: 'In Progress', bgColor: 'bg-blue-50/10', accent: 'border-blue-50' },
    { id: 'review', title: 'Review', bgColor: 'bg-amber-50/10', accent: 'border-amber-50' },
    { id: 'done', title: 'Done', bgColor: 'bg-emerald-50/10', accent: 'border-emerald-50' }
  ]

  const priorityColors = {
    low: 'bg-gray-50 text-gray-500 border-gray-100',
    medium: 'bg-blue-50 text-blue-600 border-blue-100',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    urgent: 'bg-red-50 text-red-600 border-red-100'
  }

  const columnTextColors = {
    todo: 'text-gray-500',
    in_progress: 'text-blue-600',
    review: 'text-amber-600',
    done: 'text-emerald-600'
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team assignments and progress</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Task
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-20 text-center shadow-sm">
          <ListTodo className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Projects</h3>
          <p className="text-sm text-gray-400 mt-2">Create a project before you can start adding tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id)
            const isDark = col.id === 'review' || col.id === 'done'
            return (
              <div key={col.id} className={`${col.bgColor} rounded-xl p-5 border ${col.accent} flex flex-col min-h-[600px] relative`}>
                <div className="flex justify-between items-center mb-6 px-1 relative z-10">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{col.title}</h3>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-white text-gray-500 border border-gray-100 shadow-sm">
                    {colTasks.length}
                  </span>
                </div>
                
                <div className="space-y-5 flex-1 relative z-10">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border transition-all ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5">
                          <button onClick={() => openEdit(task)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-snug group-hover:text-blue-600 transition-colors">{task.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium truncate mb-4">{task.projects?.title || 'General'}</p>
                      
                      <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                           {task.profiles?.full_name?.split(' ')[0] || 'Unassigned'}
                        </div>
                        {task.due_date && (
                          <div className={`flex items-center gap-1.5 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-bold' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Quick Status Move */}
                      <div className="mt-4">
                        <select 
                          value={task.status} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full text-[10px] font-bold border border-gray-100 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-gray-400 bg-gray-50 hover:bg-white hover:text-gray-900 transition-all cursor-pointer appearance-none"
                        >
                          <option value="todo">Pending</option>
                          <option value="in_progress">Executing</option>
                          <option value="review">Audit</option>
                          <option value="done">Complete</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-lg text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                       Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   {editingTask ? 'Edit Task' : 'New Task'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Configure task details and assignment</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Task Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingTask?.title || ''} 
                  required
                  placeholder="e.g. Design Landing Page"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Project <span className="text-red-500">*</span></label>
                  <select 
                    name="project_id" 
                    defaultValue={editingTask?.project_id || ''}
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Assign To</label>
                  <select 
                    name="assigned_to" 
                    defaultValue={editingTask?.assigned_to || ''}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {team.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  name="description" 
                  rows={4}
                  defaultValue={editingTask?.description || ''} 
                  placeholder="Task details and instructions..."
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Due Date</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    defaultValue={editingTask?.due_date || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Priority</label>
                  <select 
                    name="priority" 
                    defaultValue={editingTask?.priority || 'medium'}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingTask?.status || 'todo'}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all active:scale-95"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95 flex items-center"
                >
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>{editingTask ? 'Update Task' : 'Create Task'} <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
