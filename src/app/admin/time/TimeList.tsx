'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Timer, AlertCircle, Building2, CheckSquare, CalendarDays, TrendingUp } from 'lucide-react'
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
      await deleteTimeEntry(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    // Explicitly handle unchecking the checkbox
    if (!formData.get('billable')) formData.append('billable', 'false')
    
    try {
      if (editingEntry) {
        await updateTimeEntry(editingEntry.id, formData)
      } else {
        await createTimeEntry(formData)
      }
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const filteredTasks = tasks.filter(t => t.project_id === selectedProject)
  
  // Calculate totals
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
  const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + Number(e.hours), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Log worked hours against projects and specific tasks.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Time
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Hours Tracked</div>
            <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Billable Hours</div>
            <div className="text-2xl font-bold text-gray-900">{billableHours.toFixed(1)}h</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Team Member</th>
                <th className="px-6 py-4">Project / Task</th>
                <th className="px-6 py-4">Time Logged</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No time entries found. Click "Log Time" to add one.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{entry.profiles?.full_name || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <CalendarDays className="w-3.5 h-3.5 mr-1" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {entry.projects ? (
                        <>
                          <div className="font-medium text-gray-900 mb-1 flex items-center">
                            <Building2 className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {entry.projects.title} 
                            <span className="text-gray-400 font-normal ml-1">({(entry.projects.clients as any)?.company_name || (entry.projects.clients as any)?.[0]?.company_name || 'Unknown Client'})</span>
                          </div>
                          {entry.tasks && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <CheckSquare className="w-3.5 h-3.5 mr-1" />
                              {entry.tasks.title}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No specific project</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A56DB] text-lg bg-blue-50 px-2 py-0.5 rounded">
                          {entry.hours}h
                        </span>
                        {entry.billable ? (
                          <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">Billable</span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">Non-billable</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-[250px]" title={entry.notes || ''}>
                        {entry.notes || <span className="text-gray-400 italic">No notes</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEdit(entry)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-1"
                        title="Edit Log"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEntry ? 'Edit Time Log' : 'Log Time'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select 
                    name="project_id" 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="">-- General / No Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'Unknown Client'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                  <select 
                    name="task_id" 
                    defaultValue={editingEntry?.task_id || ''}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white disabled:opacity-50"
                    disabled={!selectedProject}
                  >
                    <option value="">-- General Project Time --</option>
                    {filteredTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Worked *</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={editingEntry?.date || new Date().toISOString().split('T')[0]} 
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours Logged *</label>
                  <input 
                    type="number" 
                    name="hours" 
                    step="0.25"
                    min="0.25"
                    max="24"
                    defaultValue={editingEntry?.hours || ''} 
                    required
                    placeholder="e.g. 2.5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="billable" 
                    defaultChecked={editingEntry ? editingEntry.billable : true}
                    className="w-4 h-4 text-[#1A56DB] rounded border-gray-300 focus:ring-[#1A56DB]"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">This time is billable to the client</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What did you work on?</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editingEntry?.notes || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                  placeholder="Designed the landing page hero section..."
                ></textarea>
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
                  {isLoading ? 'Saving...' : 'Save Time Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// End of file
