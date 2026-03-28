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
    { id: 'todo', title: 'Registry / To Do', bgColor: 'bg-gray-50/50', accent: 'border-gray-200' },
    { id: 'in_progress', title: 'Active Execution', bgColor: 'bg-red-50/20', accent: 'border-red-100' },
    { id: 'review', title: 'Internal Audit', bgColor: 'bg-gray-900', accent: 'border-gray-800' },
    { id: 'done', title: 'Terminated / Done', bgColor: 'bg-black', accent: 'border-black' }
  ]

  const priorityColors = {
    low: 'bg-gray-50 text-gray-400 border-gray-100',
    medium: 'bg-black text-white border-black',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    urgent: 'bg-red-50 text-brand-red border-red-100'
  }

  const columnTextColors = {
    todo: 'text-gray-400',
    in_progress: 'text-brand-red',
    review: 'text-gray-400',
    done: 'text-emerald-500'
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Mission Control</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personnel Task Orchestration</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all shadow-xl hover:shadow-red-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
          Deploy New Task
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-20 text-center shadow-2xl">
          <ListTodo className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Sector Offline</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 leading-relaxed">Initialization failed: Create a designated project hub before task deployment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id)
            const isDark = col.id === 'review' || col.id === 'done'
            return (
              <div key={col.id} className={`${col.bgColor} rounded-[2rem] p-6 border ${col.accent} shadow-inner flex flex-col min-h-[700px] relative`}>
                {col.id === 'in_progress' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
                )}
                
                <div className="flex justify-between items-center mb-8 px-2 relative z-10">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-900'}`}>{col.title}</h3>
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border transition-all ${isDark ? 'bg-white/10 text-white border-white/20' : 'bg-white text-gray-400 border-gray-100'}`}>
                    {colTasks.length} NODES
                  </span>
                </div>
                
                <div className="space-y-5 flex-1 relative z-10">
                  {colTasks.map(task => (
                    <div key={task.id} className={`bg-white p-6 rounded-[1.8rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all group relative overflow-hidden ${isDark ? 'hover:scale-[1.02]' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[8px] uppercase font-black tracking-widest px-2.5 py-1.5 rounded-lg border transition-all ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => openEdit(task)} className="p-2 text-gray-300 hover:text-black hover:bg-gray-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      
                      <h4 className="font-black text-gray-900 text-sm mb-2 leading-tight uppercase tracking-tight group-hover:text-brand-red transition-colors">{task.title}</h4>
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-red opacity-30" />
                         <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest truncate">{task.projects?.title || 'System Core'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mt-6 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2" title="Commanded By">
                          <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                             <UserIcon className="w-3 h-3" />
                          </div>
                          <span className="truncate max-w-[80px]">
                            {task.profiles?.full_name?.split(' ')[0] || 'Unassigned'}
                          </span>
                        </div>
                        {task.due_date && (
                          <div className={`flex items-center gap-2 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-brand-red font-black' : ''}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Quick Status Move */}
                      <div className="mt-5 relative group/select">
                        <select 
                          value={task.status} 
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="w-full text-[9px] font-black uppercase tracking-widest border border-gray-50 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-red-100 text-gray-400 bg-gray-50 hover:bg-white hover:text-black transition-all cursor-pointer appearance-none"
                        >
                          <option value="todo">LOG: PENDING</option>
                          <option value="in_progress">LOG: EXECUTING</option>
                          <option value="review">LOG: AUDIT</option>
                          <option value="done">LOG: COMPLETE</option>
                        </select>
                        <ArrowUpRight className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className={`text-center p-12 border-2 border-dashed rounded-[2rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all opacity-20 ${isDark ? 'border-white/20 text-white' : 'border-gray-200 text-gray-400'}`}>
                      SECURE EMPTY
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                   {editingTask ? 'Modify Ops' : 'Initialize Task'}
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personnel Task Profile</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="bg-red-50 text-brand-red p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-5 h-5 mr-4 shrink-0" />
                  Kernel Override: {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transmission Title <span className="text-brand-red font-black">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingTask?.title || ''} 
                  required
                  placeholder="EX: EXECUTE MEDIA AUDIT V4"
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all placeholder:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registry Hub <span className="text-brand-red font-black">*</span></label>
                  <select 
                    name="project_id" 
                    defaultValue={editingTask?.project_id || ''}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- SELECT RADIUS --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operator Assignment</label>
                  <select 
                    name="assigned_to" 
                    defaultValue={editingTask?.assigned_to || ''}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="">-- UNASSIGNED --</option>
                    {team.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name?.toUpperCase() || m.email?.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mission Meta Description</label>
                <textarea 
                  name="description" 
                  rows={4}
                  defaultValue={editingTask?.description || ''} 
                  placeholder="OPERATIONAL DIRECTIVES..."
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-bold text-[11px] uppercase tracking-widest transition-all placeholder:text-gray-200 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Epoch Deadline</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    defaultValue={editingTask?.due_date || ''} 
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[10px] uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority Metric</label>
                  <select 
                    name="priority" 
                    defaultValue={editingTask?.priority || 'medium'}
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="low">LOW PRIORITY</option>
                    <option value="medium">MEDIUM PRIO</option>
                    <option value="high">HIGH THREAT</option>
                    <option value="urgent">MAX CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingTask?.status || 'todo'}
                    className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="todo">LOG: PENDING</option>
                    <option value="in_progress">LOG: EXECUTING</option>
                    <option value="review">LOG: AUDIT</option>
                    <option value="done">LOG: COMPLETE</option>
                  </select>
                </div>
              </div>

              <div className="pt-10 flex justify-end gap-5 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                  disabled={isLoading}
                >
                  Cancel Protocol
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-4 bg-black hover:bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-red-200 active:scale-95 flex items-center"
                >
                  {isLoading ? (
                    'DEPLOYING...'
                  ) : (
                    <>CONFIRM DEPLOY <ArrowRight className="ml-3 w-4 h-4" /></>
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
