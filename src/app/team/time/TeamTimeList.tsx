'use client'

import { useState } from 'react'
import { Plus, Timer, History, Trash2, Edit2, AlertCircle, Building2, CheckSquare } from 'lucide-react'
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from '@/app/admin/time/actions'

type Project = { id: string; title: string; client_id: string; clients?: { company_name: string } | { company_name: string }[] }
type Task = { id: string; project_id: string; title: string }

type TimeEntry = {
  id: string
  project_id: string | null
  task_id: string | null
  hours: number
  date: string
  billable: boolean
  notes: string | null
  created_at: string
  projects?: Project
  tasks?: Task
}

export default function TeamTimeList({ 
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
  
  // Totals for current user
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Time Tracking</h1>
          <p className="text-gray-500 mt-1 max-w-sm">Log your daily hours, track task time, and stay productive.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Worked Time
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-5">
            <div className="w-16 h-16 bg-blue-50 text-[#1A56DB] rounded-2xl flex items-center justify-center shrink-0">
               <Timer className="w-8 h-8" />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Logged Time</p>
               <h3 className="text-3xl font-black text-gray-900">{totalHours.toFixed(1)}h</h3>
            </div>
         </div>
         <div className="bg-gradient-to-br from-[#1A56DB] to-indigo-800 p-6 rounded-2xl shadow-xl flex items-center space-x-5 text-white">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
               <History className="w-8 h-8" />
            </div>
            <div>
               <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Recent Logs</p>
               <h3 className="text-3xl font-black">{entries.length} Entries</h3>
            </div>
         </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Activity Details</th>
                <th className="px-8 py-5">Logged On</th>
                <th className="px-8 py-5 text-center">Duration</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-gray-400">
                    <History className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <p className="font-bold text-gray-500">No time entries recorded yet.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="font-bold text-gray-900 flex items-center text-base">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {entry.projects?.title || 'General Activity'}
                        </div>
                        {entry.tasks && (
                          <div className="text-xs text-blue-600 font-bold mt-1.5 flex items-center">
                            <CheckSquare className="w-3.5 h-3.5 mr-1" />
                            {entry.tasks.title}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic max-w-sm">
                           "{entry.notes || 'No work description provided.'}"
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-gray-900 font-bold">{new Date(entry.date).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">
                        {entry.billable ? <span className="text-green-600">Billable</span> : <span>Internal</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="inline-flex items-center px-4 py-1.5 bg-gray-900 text-white rounded-xl font-black text-lg">
                          {entry.hours}h
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEdit(entry)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#1A56DB] hover:border-blue-100 hover:shadow-sm transition-all"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:border-red-100 hover:shadow-sm transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
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

      {/* Simplified Logging Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 transform transition-all">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                {editingEntry ? 'Update Time Log' : 'New Time Log'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-3xl font-light">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Project</label>
                    <select 
                      name="project_id" 
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all font-bold text-gray-900"
                    >
                      <option value="">-- No Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Task</label>
                    <select 
                      name="task_id" 
                      defaultValue={editingEntry?.task_id || ''}
                      disabled={!selectedProject}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all font-bold text-gray-900 disabled:opacity-40"
                    >
                      <option value="">-- General --</option>
                      {filteredTasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                     <input 
                       type="date" 
                       name="date" 
                       defaultValue={editingEntry?.date || new Date().toISOString().split('T')[0]} 
                       required
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] font-bold"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hours</label>
                     <input 
                       type="number" 
                       name="hours" 
                       step="0.25"
                       defaultValue={editingEntry?.hours || ''} 
                       required
                       placeholder="2.5"
                       className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] font-bold"
                     />
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Work Description</label>
                   <textarea 
                     name="notes" 
                     rows={3}
                     defaultValue={editingEntry?.notes || ''} 
                     placeholder="Detailed notes about your progress..."
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] transition-all text-sm font-medium resize-none"
                   ></textarea>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="billable" 
                    defaultChecked={editingEntry ? editingEntry.billable : true}
                    className="w-6 h-6 text-[#1A56DB] border-gray-200 rounded-lg focus:ring-[#1A56DB] transition-all"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-[#1A56DB] transition-colors">Mark as billable work</span>
                </label>
              </div>

              {error && <div className="text-xs text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center">
                 <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A56DB] hover:bg-indigo-700 text-white py-4 rounded-[1.25rem] font-black text-base transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {isLoading ? 'Saving Log...' : editingEntry ? 'Update Entry' : 'Post Time Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
