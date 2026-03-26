'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, CalendarDays, AlertCircle, Image as ImageIcon, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react'
import Image from 'next/image'
import { createContent, updateContent, deleteContent, updateContentStatus } from './actions'

type Project = { id: string; title: string; client_id: string; clients?: { company_name: string } | { company_name: string }[] }

type ContentItem = {
  id: string
  project_id: string
  title: string
  description: string | null
  content: string | null
  platform: string
  image_url: string | null
  scheduled_for: string | null
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
  feedback: string | null
  created_at: string
  projects?: Project
}

export default function CalendarList({ 
  initialItems, 
  projects 
}: { 
  initialItems: ContentItem[]
  projects: Project[]
}) {
  const [items, setItems] = useState(initialItems)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function openCreate() {
    setError('')
    setEditingItem(null)
    setIsModalOpen(true)
  }

  function openEdit(item: ContentItem) {
    setError('')
    setEditingItem(item)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this content item?')) return
    
    try {
      const result = await deleteContent(id)
      if (result?.error) {
        alert(result.error)
      } else {
        setItems(prev => prev.filter(i => i.id !== id))
      }
    } catch (err: any) {
      alert('An unexpected error occurred.')
    }
  }

  async function handleQuickStatus(id: string, status: string) {
    try {
      const result = await updateContentStatus(id, status)
      if (result?.error) {
        alert(result.error)
      } else {
        window.location.reload()
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
      if (editingItem) {
        result = await updateContent(editingItem.id, formData)
      } else {
        result = await createContent(formData)
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
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    published: 'bg-blue-100 text-blue-700 border-blue-200'
  }

  const platforms = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'twitter', name: 'Twitter/X' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'blog', name: 'Blog/Website' }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Plan, review, and approve client social media and content.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#1A56DB] hover:bg-[#1e4eb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Post details</th>
                <th className="px-6 py-4">Project / Platform</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Approval Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No content planned. Click "Add Content" to start scheduling.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        {item.image_url ? (
                          <div className="relative w-12 h-12 mr-3 shrink-0">
                            <Image src={item.image_url} alt="" fill sizes="48px" className="rounded object-cover border border-gray-200" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center mr-3 shrink-0">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          {item.content && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs" title={item.content}>
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 mb-1">
                        {item.projects?.title || 'Unknown Project'}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded capitalize">
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.scheduled_for ? (
                        <div className="flex items-center text-gray-900">
                          <CalendarDays className="w-4 h-4 mr-2 text-[#1A56DB]" />
                          <span>
                            {new Date(item.scheduled_for).toLocaleDateString()}<br/>
                            <span className="text-xs text-gray-500">
                              {new Date(item.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Unscheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${statusColors[item.status] || 'bg-gray-100'}`}>
                        {item.status}
                      </span>
                      {item.feedback && item.status === 'rejected' && (
                        <div className="mt-2 text-[10px] text-red-600 flex items-start bg-red-50 p-1.5 rounded border border-red-100">
                          <MessageSquare className="w-3 h-3 mr-1 shrink-0 mt-0.5" />
                          <span className="line-clamp-2" title={item.feedback}>{item.feedback}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'draft' && (
                        <button 
                          onClick={() => handleQuickStatus(item.id, 'pending')}
                          className="p-2 border border-[#1A56DB]/20 bg-blue-50 rounded-lg text-[#1A56DB] hover:bg-[#1A56DB]/10 transition-colors mr-1"
                          title="Send for Review"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {(item.status === 'approved' || item.status === 'pending') && (
                        <button 
                          onClick={() => handleQuickStatus(item.id, 'published')}
                          className="p-2 border border-blue-200 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors mr-1"
                          title="Mark Published"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => openEdit(item)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-[#1A56DB] hover:bg-blue-50 hover:border-blue-200 transition-colors mr-1"
                        title="Edit Content"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        title="Delete Post"
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Content' : 'Add Content to Calendar'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingItem?.project_id || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    <option value="" disabled>-- Select a project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'Unknown Client'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform *</label>
                  <select 
                    name="platform" 
                    defaultValue={editingItem?.platform || 'instagram'}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Reference Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingItem?.title || ''} 
                  required
                  placeholder="e.g., Summer Sale Promo Video"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Caption / Copy text</label>
                <textarea 
                  name="content" 
                  rows={4}
                  defaultValue={editingItem?.content || ''} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  placeholder="Write your creative copy here..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image / Asset URL</label>
                  <input 
                    type="url" 
                    name="image_url" 
                    defaultValue={editingItem?.image_url || ''} 
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For</label>
                  <input 
                    type="datetime-local" 
                    name="scheduled_for" 
                    defaultValue={editingItem?.scheduled_for ? new Date(editingItem.scheduled_for).toISOString().slice(0, 16) : ''} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                <select 
                  name="status" 
                  defaultValue={editingItem?.status || 'draft'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                >
                  <option value="draft">Draft (Internal)</option>
                  <option value="pending">Pending (Awaiting Client Approval)</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Setting this to "Pending" will allow the client to see it in their portal to approve or reject.
                </p>
              </div>

              {editingItem?.feedback && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <p className="text-xs font-semibold text-orange-800 mb-1">Client Feedback:</p>
                  <p className="text-sm text-orange-700">{editingItem.feedback}</p>
                </div>
              )}

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
                  {isLoading ? 'Saving...' : 'Save Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
