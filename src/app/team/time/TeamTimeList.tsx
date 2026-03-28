'use client'

import { useState } from 'react'
import { Plus, Timer, History, Trash2, Edit2, AlertCircle, Building2, CheckSquare, ArrowRight } from 'lucide-react'
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
  
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Personal Ledger</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Individual Performance Tracking Node</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-brand-red hover:bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 flex items-center active:scale-95 relative z-10"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Effort
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center group hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center shrink-0 shadow-inner ring-1 ring-red-100 group-hover:scale-110 transition-transform">
               <Timer className="w-8 h-8" />
            </div>
            <div className="ml-6">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Temporal Yield</p>
               <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{totalHours.toFixed(1)}<span className="text-lg ml-0.5 text-gray-300 italic">h</span></h3>
            </div>
         </div>
         <div className="bg-black p-8 rounded-[2rem] shadow-2xl flex items-center group hover:bg-[#0a0a0a] transition-all border border-gray-900">
            <div className="w-16 h-16 bg-brand-red text-white shadow-xl shadow-red-900/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
               <History className="w-8 h-8" />
            </div>
            <div className="ml-6">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Archive Density</p>
               <h3 className="text-4xl font-black text-white tracking-tighter">{entries.length}<span className="text-lg ml-1.5 text-brand-red italic text-opacity-50">nodes</span></h3>
            </div>
         </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-20"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Epoch</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Quantum</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <History className="w-16 h-16 text-gray-100 mx-auto mb-6 opacity-30" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Local archives purged. Zero temporal activity identified.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="font-black text-gray-900 uppercase tracking-tight flex items-center text-lg group-hover:text-brand-red transition-colors">
                          {entry.projects?.title || 'System Maintenance'}
                        </div>
                        {entry.tasks && (
                          <div className="text-[9px] text-brand-red font-black uppercase tracking-[0.15em] mt-2 flex items-center">
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                            {entry.tasks.title}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2 font-medium italic group-hover:text-gray-600 transition-colors">
                           "{entry.notes || 'Static documentation node.'}"
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-gray-900 font-bold uppercase tracking-tight">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 flex items-center">
                        {entry.billable ? <div className="w-1.5 h-1.5 rounded-full bg-brand-red mr-2" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mr-2" />}
                        {entry.billable ? 'Billable Resource' : 'Internal Ops'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-xl shadow-lg ring-4 ring-gray-100 group-hover:bg-brand-red transition-colors">
                          {entry.hours}<span className="text-xs text-white/50 ml-1">h</span>
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                        <button 
                          onClick={() => openEdit(entry)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-red-100 hover:shadow-lg hover:shadow-red-50 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-gray-200 hover:shadow-lg transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 transform transition-all scale-in-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-red"></div>
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase italic">
                  {editingEntry ? 'Recalibrate Log' : 'Post Temporal Node'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">Effort Aggregation Matrix</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all font-bold text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Cluster</label>
                    <select 
                      name="project_id" 
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-sm uppercase tracking-widest cursor-pointer"
                    >
                      <option value="">-- SYSTEM GENERAL --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub-Node Task</label>
                    <select 
                      name="task_id" 
                      defaultValue={editingEntry?.task_id || ''}
                      disabled={!selectedProject}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-sm uppercase tracking-widest disabled:opacity-30 cursor-pointer"
                    >
                      <option value="">-- AGGREGATE --</option>
                      {filteredTasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Temporal Stamp</label>
                     <input 
                       type="date" 
                       name="date" 
                       defaultValue={editingEntry?.date || new Date().toISOString().split('T')[0]} 
                       required
                       className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantum (Hours)</label>
                     <input 
                       type="number" 
                       name="hours" 
                       step="0.25"
                       defaultValue={editingEntry?.hours || ''} 
                       required
                       placeholder="2.50"
                       className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-xl"
                     />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Activity Documentation</label>
                   <textarea 
                     name="notes" 
                     rows={3}
                     defaultValue={editingEntry?.notes || ''} 
                     placeholder="Detail the deliverable impact of this temporal allocation..."
                     className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all text-sm font-medium resize-none placeholder:text-gray-300"
                   ></textarea>
                </div>

                <div className="p-6 bg-red-50/30 rounded-[2rem] border border-red-50">
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="billable" 
                      defaultChecked={editingEntry ? editingEntry.billable : true}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-red shadow-inner"></div>
                    <span className="ml-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 group-hover:text-brand-red transition-colors">Yield-Generating Asset</span>
                  </label>
                </div>
              </div>

              {error && <div className="text-[10px] font-black uppercase tracking-widest text-brand-red bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center">
                 <AlertCircle className="w-4 h-4 mr-3" /> {error}
              </div>}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-brand-red text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-gray-100 disabled:opacity-50 active:scale-95 flex items-center justify-center"
              >
                {isLoading ? 'Processing...' : (
                  <>COMMIT OPERATIONAL LOG <ArrowRight className="w-4 h-4 ml-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
