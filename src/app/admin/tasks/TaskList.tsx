'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Calendar, AlertCircle, User as UserIcon, ListTodo } from 'lucide-react'
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
    { id: 'todo', title: 'To Do', bgColor: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', bgColor: 'bg-blue-50' },
    { id: 'review', title: 'In Review', bgColor: 'bg-yellow-50' },
    { id: 'done', title: 'Done', bgColor: 'bg-green-50' }
  ]

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
          <p className="text-sm text-gray-500 mt-1">Manage project tasks and team assignments.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Projects Found</h3>
          <p className="text-sm text-gray-500 mt-1">You need to create a project before adding tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id)
            return (
              <div key={col.id} className={`${col.bgColor} rounded-xl p-4 border border-gray-200/50`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">{col.title}</h3>
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 font-medium">
                    {colTasks.length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow group">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button onClick={() => openEdit(task)} className="p-1 text-gray-400 hover:text-[#1A56DB]"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 text-sm mb-1 leading-snug">{task.title}</h4>
                      <p className="text-xs text-blue-600 mb-3 truncate">{task.projects?.title}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                        <div className="flex items-center gap-1" title="Assigned To">
                          <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-[80px]">
                            {task.profiles?.full_name || 'Unassigned'}
                          </span>
                        </div>
                        {task.due_date && (
                          <div className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-600 font-medium' : ''}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Quick Status Move */}
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="mt-3 w-full text-xs border border-gray-200 rounded p-1.5 focus:outline-none focus:border-[#1A56DB] text-gray-600 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                      >
                        <option value="todo">Move to: To Do</option>
                        <option value="in_progress">Move to: In Progress</option>
                        <option value="review">Move to: In Review</option>
                        <option value="done">Move to: Done</option>
                      </select>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                      No tasks
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingTask?.title || ''} 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingTask?.project_id || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="" disabled>-- Select Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select 
                    name="assigned_to" 
                    defaultValue={editingTask?.assigned_to || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {team.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={3}
                  defaultValue={editingTask?.description || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    name="due_date" 
                    defaultValue={editingTask?.due_date || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    name="priority" 
                    defaultValue={editingTask?.priority || 'medium'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-sm bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingTask?.status || 'todo'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-sm bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1e4eb8] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
