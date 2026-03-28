'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Briefcase, AlertCircle, Building2, Calendar, Zap, ArrowRight, DollarSign } from 'lucide-react'
import { createProject, updateProject, deleteProject } from './actions'

type Client = {
  id: string
  company_name: string
}

type Project = {
  id: string
  client_id: string
  title: string
  description: string | null
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  start_date: string | null
  end_date: string | null
  budget: number | null
  currency: string
  created_at: string
  clients?: Client // From Supabase join
}

export default function ProjectList({ initialProjects, clients }: { initialProjects: Project[], clients: Client[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setError('')
    setEditingProject(null)
    setIsModalOpen(true)
  }

  function openEdit(project: Project) {
    setError('')
    setEditingProject(project)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this project? All related tasks and invoices will be deleted as well.')) return
    
    try {
      const result = await deleteProject(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setProjects(prev => prev.filter(p => p.id !== id))
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
    
    try {
      let result
      if (editingProject) {
        result = await updateProject(editingProject.id, formData)
      } else {
        result = await createProject(formData)
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

  const statusColors = {
    active: 'bg-red-50 text-brand-red border-red-100',
    completed: 'bg-black text-white border-black',
    paused: 'bg-gray-100 text-gray-400 border-gray-200',
    cancelled: 'bg-gray-50 text-gray-300 border-gray-100'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Project Matrix</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Operational Lifecycle Management</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all shadow-xl hover:shadow-red-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
          Initialize Project
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Initiative</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Hub</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Progress</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Briefcase className="w-12 h-12 text-gray-100 mb-4" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Zero active projects in current sector.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-red-50/10 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mr-5 shrink-0 transition-all group-hover:bg-brand-red group-hover:text-white group-hover:rotate-3 shadow-inner border border-gray-100 group-hover:border-transparent">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight text-base group-hover:text-brand-red transition-colors">{project.title}</p>
                          {project.budget && (
                            <div className="flex items-center gap-1.5 mt-1">
                               <DollarSign className="w-3 h-3 text-emerald-500" />
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cap: {project.budget.toLocaleString()} {project.currency}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <Building2 className="w-4 h-4 mr-2.5 text-gray-300 group-hover:text-black transition-colors" />
                        {project.clients?.company_name || 'System Anonymous'}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        {project.start_date && (
                          <div className="flex items-center text-[9px] font-black uppercase tracking-tighter text-gray-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                            <span className="w-16">Genesis:</span>
                            <span className="text-gray-900">{new Date(project.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                        {project.end_date && (
                          <div className="flex items-center text-[9px] font-black uppercase tracking-tighter text-gray-400">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-red mr-2" />
                            <span className="w-16">Deadline:</span>
                            <span className="text-gray-900">{new Date(project.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                        {!project.start_date && !project.end_date && (
                          <span className="text-gray-300 italic text-[10px] font-black uppercase tracking-widest">Term undefined</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusColors[project.status] || 'bg-gray-100'}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                        <button 
                          onClick={() => openEdit(project)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black hover:shadow-lg transition-all"
                          title="Edit Blueprint"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-brand-red hover:shadow-lg transition-all"
                          title="Terminate Archive"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                   {editingProject ? 'Modify Initiative' : 'Initialize Blueprint'}
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Registry Entry Profile</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-2xl transition-all"
              >
                <XIcon className="w-6 h-6" />
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
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initiative Title <span className="text-brand-red font-black">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingProject?.title || ''} 
                  required
                  placeholder="EX: Q4 BRAND DEPLOYMENT PHASE"
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all placeholder:text-gray-200"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Client Hub <span className="text-brand-red font-black">*</span></label>
                <select 
                  name="client_id" 
                  defaultValue={editingProject?.client_id || ''}
                  required
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  <option value="" disabled>-- SELECT RECIPIENT --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Description</label>
                <textarea 
                  name="description" 
                  rows={4}
                  defaultValue={editingProject?.description || ''} 
                  placeholder="METADATA & LOGISTICAL OVERVIEW..."
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-bold text-[11px] uppercase tracking-widest transition-all placeholder:text-gray-200 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Genesis Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    defaultValue={editingProject?.start_date || ''} 
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Termination Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    defaultValue={editingProject?.end_date || ''} 
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resource Cap (AED)</label>
                  <input 
                    type="number" 
                    name="budget"
                    step="0.01"
                    defaultValue={editingProject?.budget || ''} 
                    placeholder="0.00"
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all placeholder:text-gray-200"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lifecycle Phase</label>
                  <select 
                    name="status" 
                    defaultValue={editingProject?.status || 'active'}
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="active">Active Execution</option>
                    <option value="completed">Terminated / Done</option>
                    <option value="paused">On Hold / Stasis</option>
                    <option value="cancelled">Abort / Cancelled</option>
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
                    'COMMITTING...'
                  ) : (
                    <>SAVE BLUEPRINT <ArrowRight className="ml-3 w-4 h-4" /></>
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

function XIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
