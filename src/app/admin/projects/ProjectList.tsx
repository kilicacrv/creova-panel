'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Briefcase, AlertCircle, Building2, Calendar } from 'lucide-react'
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
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData)
        window.location.reload()
      } else {
        await createProject(formData)
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const statusColors = {
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    paused: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all client projects and track their status.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Progress/Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No projects found. Click "Add Project" to create one.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 mr-3 shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{project.title}</p>
                          {project.budget && (
                            <p className="text-xs text-gray-500 mt-0.5">Budget: {project.budget.toLocaleString()} {project.currency}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-700">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        {project.clients?.company_name || 'Unknown Client'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {project.start_date && (
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="w-10 text-gray-400">Start:</span>
                            {new Date(project.start_date).toLocaleDateString()}
                          </div>
                        )}
                        {project.end_date && (
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="w-10 text-gray-400">End:</span>
                            {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        )}
                        {!project.start_date && !project.end_date && (
                          <span className="text-gray-400 italic text-xs">No dates set</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${statusColors[project.status] || 'bg-gray-100'}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEdit(project)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-2"
                        title="Edit Project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete Project"
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
                {editingProject ? 'Edit Project' : 'Add New Project'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingProject?.title || ''} 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Client *</label>
                <select 
                  name="client_id" 
                  defaultValue={editingProject?.client_id || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                >
                  <option value="" disabled>-- Select a client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={3}
                  defaultValue={editingProject?.description || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    defaultValue={editingProject?.start_date || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    defaultValue={editingProject?.end_date || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (AED)</label>
                  <input 
                    type="number" 
                    name="budget"
                    step="0.01"
                    defaultValue={editingProject?.budget || ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingProject?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
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
                  {isLoading ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
