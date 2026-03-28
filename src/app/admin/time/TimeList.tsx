'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Timer, AlertCircle, Building2, CheckSquare, CalendarDays, TrendingUp, ArrowRight } from 'lucide-react'
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
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Time Ledger</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Executive Resource Tracking Engine</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-brand-red hover:bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 flex items-center active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Initialize Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex items-center group hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center mr-6 ring-1 ring-red-100 shadow-inner group-hover:scale-110 transition-transform">
            <Timer className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Aggregate Investment</div>
            <div className="text-4xl font-black text-gray-900 tracking-tighter">{totalHours.toFixed(1)}<span className="text-lg ml-0.5 text-gray-300 italic">h</span></div>
          </div>
        </div>
        <div className="bg-black border border-gray-900 rounded-[2rem] p-8 shadow-xl flex items-center group hover:bg-[#0a0a0a] transition-all">
          <div className="w-16 h-16 bg-brand-red text-white rounded-2xl flex items-center justify-center mr-6 shadow-xl shadow-red-900/20 group-hover:rotate-6 transition-transform">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Billable Yield</div>
            <div className="text-4xl font-black text-white tracking-tighter">{billableHours.toFixed(1)}<span className="text-lg ml-0.5 text-brand-red italic text-opacity-50">h</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resource</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assignment</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Yield</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Notes</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">Zero nodes active in current ledger.</div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-red-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900 uppercase tracking-tight group-hover:text-brand-red transition-colors">{entry.profiles?.full_name || 'Unknown Identity'}</div>
                      <div className="text-[10px] text-gray-400 font-black mt-1 flex items-center uppercase tracking-widest">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {entry.projects ? (
                        <>
                          <div className="font-bold text-gray-900 mb-1 flex items-center italic">
                            {entry.projects.title} 
                          </div>
                          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center">
                             {(entry.projects.clients as any)?.company_name || (entry.projects.clients as any)?.[0]?.company_name || 'Generic Client'}
                             {entry.tasks && <span className="mx-2 opacity-30">•</span>}
                             {entry.tasks?.title}
                          </div>
                        </>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Global Admin Task</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-gray-900 text-xl bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                          {entry.hours}<span className="text-xs text-gray-400 ml-0.5">h</span>
                        </span>
                        {entry.billable ? (
                          <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" title="Billable Asset"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-200" title="Non-billable Asset"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-gray-500 line-clamp-2 max-w-[300px] font-medium leading-relaxed">
                        {entry.notes || 'No meta documentation provided.'}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
            <div className="flex justify-between items-center p-10 border-b border-gray-50 bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic">
                  {editingEntry ? 'Calibrate Log' : 'Initialize Yield'}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Resource Allocation Matrix</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-black hover:shadow-md transition-all font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
              {error && (
                <div className="bg-red-50 text-brand-red p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100">
                  <AlertCircle className="w-4 h-4 mr-3" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Asset Allocation</label>
                  <select 
                    name="project_id" 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm"
                  >
                    <option value="">-- General Operations --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'Generic Client'})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Directive Node</label>
                  <select 
                    name="task_id" 
                    defaultValue={editingEntry?.task_id || ''}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm disabled:opacity-30"
                    disabled={!selectedProject}
                  >
                    <option value="">-- Aggregate Project Time --</option>
                    {filteredTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Temporal Stamp</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={editingEntry?.date || new Date().toISOString().split('T')[0]} 
                    required
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quantum (Hours)</label>
                  <input 
                    type="number" 
                    name="hours" 
                    step="0.25"
                    min="0.25"
                    max="24"
                    defaultValue={editingEntry?.hours || ''} 
                    required
                    placeholder="e.g. 2.50"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-black text-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 bg-red-50/30 rounded-[2rem] border border-red-50">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="billable" 
                    defaultChecked={editingEntry ? editingEntry.billable : true}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-red"></div>
                  <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-gray-900">Billable Yield Asset</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Meta Documentation</label>
                <textarea 
                  name="notes" 
                  rows={4}
                  defaultValue={editingEntry?.notes || ''} 
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-red-50 focus:bg-white transition-all font-medium text-sm resize-none placeholder:text-gray-300"
                  placeholder="Summarize the core impact of this temporal allocation..."
                ></textarea>
              </div>

              <div className="pt-6 flex justify-end gap-4 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  disabled={isLoading}
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-red hover:bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-100 active:scale-95 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? 'Processing...' : (
                    <>Commit Log <ArrowRight className="w-4 h-4 ml-3" /></>
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
