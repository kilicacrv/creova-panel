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
    active: 'bg-red-50 text-blue-600 border-red-100',
    completed: 'bg-black text-white border-black',
    paused: 'bg-gray-100 text-gray-400 border-gray-200',
    cancelled: 'bg-gray-50 text-gray-300 border-gray-100'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your agency projects and timelines</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Project
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Briefcase className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-sm font-medium text-gray-400">No active projects found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-red-50/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mr-4 shrink-0 transition-all group-hover:bg-blue-50 group-hover:text-blue-600 border border-gray-100 shadow-sm">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{project.title}</p>
                          {project.budget && (
                            <div className="flex items-center gap-1.5 mt-1">
                               <p className="text-xs text-gray-500">Budget: {project.budget.toLocaleString()} {project.currency}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs font-medium text-gray-600">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        {project.clients?.company_name || 'Individual'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        {project.start_date && (
                          <div className="flex items-center text-[10px] font-medium text-gray-400">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 mr-2" />
                            <span className="w-16">Started:</span>
                            <span className="text-gray-700">{new Date(project.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {project.end_date && (
                          <div className="flex items-center text-[10px] font-medium text-gray-400">
                             <div className="w-1 h-1 rounded-full bg-blue-600 mr-2" />
                            <span className="w-16">Due:</span>
                            <span className="text-gray-700">{new Date(project.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                        project.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button 
                          onClick={() => openEdit(project)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Project"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   {editingProject ? 'Edit Project' : 'New Project'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Configure project details and budget</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <XIcon className="w-5 h-5" />
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Project Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingProject?.title || ''} 
                  required
                  placeholder="e.g. Website Overhaul"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Client <span className="text-red-500">*</span></label>
                <select 
                  name="client_id" 
                  defaultValue={editingProject?.client_id || ''}
                  required
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                >
                  <option value="" disabled>Select a client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  name="description" 
                  rows={4}
                  defaultValue={editingProject?.description || ''} 
                  placeholder="Describe the project goals and scope..."
                  className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Start Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    defaultValue={editingProject?.start_date || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">End Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    defaultValue={editingProject?.end_date || ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Budget (AED)</label>
                  <input 
                    type="number" 
                    name="budget"
                    step="0.01"
                    defaultValue={editingProject?.budget || ''} 
                    placeholder="0.00"
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingProject?.status || 'active'}
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
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
                    <>{editingProject ? 'Update Project' : 'Create Project'} <ArrowRight className="ml-2 w-4 h-4" /></>
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
