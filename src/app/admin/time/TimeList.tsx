'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Timer, AlertCircle, Building2, CheckSquare, CalendarDays, TrendingUp, ArrowRight, X } from 'lucide-react'
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from './actions'

type Project = { id: string; title: string; client_id: string; clients?: { company_name: string } | { company_name: string }[] }
type Task = { id: string; project_id: string; title: string }
type Profile = { id: string; full_name: string | null }

type TimeEntry = {
  id: string
  user_id: string
  project_id: string | null
  task_id: string | null
  hours: number
  date: string
  billable: boolean
  notes: string | null
  created_at: string
  projects?: Project
  tasks?: Task
  profiles?: Profile
}

export default function TimeList({ 
  initialTime, 
  projects,
  tasks
}: { 
  initialTime: TimeEntry[]
  projects: Project[]
  tasks: Task[]
}) {
  const [entries, setEntries] = useState(initialTime)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedProject, setSelectedProject] = useState<string>('')

  function openCreate() {
    setError('')
    setEditingEntry(null)
    setSelectedProject('')
    setIsModalOpen(true)
  }

  function openEdit(entry: TimeEntry) {
    setError('')
    setEditingEntry(entry)
    setSelectedProject(entry.project_id || '')
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this time entry?')) return
    
    try {
      const result = await deleteTimeEntry(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setEntries(prev => prev.filter(e => e.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    if (!formData.get('billable')) formData.append('billable', 'false')
    
    try {
      let result
      if (editingEntry) {
        result = await updateTimeEntry(editingEntry.id, formData)
      } else {
        result = await createTimeEntry(formData)
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

  const filteredTasks = tasks.filter(t => t.project_id === selectedProject)
  
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
  const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + Number(e.hours), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Track billable hours and project resources</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Time
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm flex items-center group hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-6 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Timer className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Hours</div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{totalHours.toFixed(1)}<span className="text-lg ml-1 text-gray-400 font-medium">h</span></div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm flex items-center group hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mr-6 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Billable Hours</div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{billableHours.toFixed(1)}<span className="text-lg ml-1 text-gray-400 font-medium">h</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project / Task</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 ? (
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="text-sm font-medium text-gray-400">No time entries found.</div>
                  </td>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{entry.profiles?.full_name || 'Member'}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-1 flex items-center uppercase tracking-wider">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {entry.projects ? (
                        <>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{entry.projects.title}</div>
                          <div className="text-xs text-gray-500 font-medium">
                             {(entry.projects.clients as any)?.company_name || (entry.projects.clients as any)?.[0]?.company_name || 'Client'}
                             {entry.tasks && <span className="mx-2 text-gray-300">•</span>}
                             {entry.tasks?.title}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">General Admin</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-lg">
                          {entry.hours}<span className="text-xs text-gray-400 ml-0.5 font-medium">h</span>
                        </span>
                        {entry.billable ? (
                          <div className="w-2 h-2 rounded-full bg-blue-600" title="Billable"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-200" title="Non-billable"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-[250px] font-medium">
                        {entry.notes || '-'}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button 
                          onClick={() => openEdit(entry)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Entry"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEntry ? 'Edit Entry' : 'Log Time'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Record hours for projects and tasks</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Project</label>
                  <select 
                    name="project_id" 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="">General Operations</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'Client'})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Task</label>
                  <select 
                    name="task_id" 
                    defaultValue={editingEntry?.task_id || ''}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer disabled:opacity-50"
                    disabled={!selectedProject}
                  >
                    <option value="">General Project Time</option>
                    {filteredTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={editingEntry?.date || new Date().toISOString().split('T')[0]} 
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Hours</label>
                  <input 
                    type="number" 
                    name="hours" 
                    step="0.25"
                    min="0.25"
                    max="24"
                    defaultValue={editingEntry?.hours || ''} 
                    required
                    placeholder="e.g. 2.5"
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="billable" 
                    defaultChecked={editingEntry ? editingEntry.billable : true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-semibold text-gray-700">Billable Hours</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Notes</label>
                <textarea 
                  name="notes" 
                  rows={4}
                  defaultValue={editingEntry?.notes || ''} 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none placeholder:text-gray-400"
                  placeholder="What did you work on today?..."
                ></textarea>
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
                  {isLoading ? 'Saving...' : (
                    <>Save Entry <ArrowRight className="w-4 h-4 ml-2" /></>
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
