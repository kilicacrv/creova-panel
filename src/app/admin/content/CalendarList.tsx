'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, CalendarDays, AlertCircle, Image as ImageIcon, MessageSquare, Send, CheckCircle, Clock, Zap, ArrowRight, X, Globe, Sparkles } from 'lucide-react'
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
    draft: 'bg-gray-50 text-gray-500 border-gray-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    approved: 'bg-blue-50 text-blue-700 border-blue-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-100'
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Content Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage multi-channel social posts</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center transition-all shadow-sm active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          New Post
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Post</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project / Platform</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <CalendarDays className="w-12 h-12 text-gray-200 mb-4" />
                       <p className="text-sm font-medium text-gray-400">No scheduled content found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-start">
                        {item.image_url ? (
                          <div className="relative w-12 h-12 mr-4 shrink-0 group-hover:rotate-2 transition-transform">
                            <Image src={item.image_url} alt="" fill sizes="48px" className="rounded-lg object-cover border border-gray-100 shadow-sm" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mr-4 shrink-0 transition-all">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</p>
                          {item.content && (
                            <p className="text-[10px] font-medium text-gray-400 mt-1 line-clamp-1 max-w-xs" title={item.content}>
                              {item.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-semibold text-gray-900 text-xs flex items-center mb-1">
                        <Globe className="w-3.5 h-3.5 mr-2 text-gray-400" />
                        {item.projects?.title || 'General'}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {item.scheduled_for ? (
                        <div className="flex items-center text-gray-900">
                          <Clock className="w-4 h-4 mr-2 text-blue-600 opacity-40" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            {new Date(item.scheduled_for).toLocaleDateString()}<br/>
                            <span className="text-[10px] text-gray-400 font-medium lowercase">
                              at {new Date(item.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-gray-400 italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${statusColors[item.status] || 'bg-gray-100'}`}>
                        {item.status}
                      </span>
                      {item.feedback && item.status === 'rejected' && (
                        <div className="mt-2 text-[10px] font-medium text-red-600 flex items-start bg-red-50 p-2 rounded-lg border border-red-100">
                          <MessageSquare className="w-3 h-3 mr-1.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-2" title={item.feedback}>{item.feedback}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {item.status === 'draft' && (
                          <button 
                            onClick={() => handleQuickStatus(item.id, 'pending')}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Submit for Approval"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(item.status === 'approved' || item.status === 'pending') && (
                          <button 
                            onClick={() => handleQuickStatus(item.id, 'published')}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Publish Live"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => openEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Post"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/30">
              <div>
                 <h2 className="text-xl font-bold text-gray-900">
                   {editingItem ? 'Edit Post' : 'New Post'}
                 </h2>
                 <p className="text-xs text-gray-500 mt-1">Schedule social media content and assets</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-4 h-4 mr-3 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Project <span className="text-red-500">*</span></label>
                  <select 
                    name="project_id" 
                    defaultValue={editingItem?.project_id || ''}
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'Client'})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Platform <span className="text-red-500">*</span></label>
                  <select 
                    name="platform" 
                    defaultValue={editingItem?.platform || 'instagram'}
                    required
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Post Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingItem?.title || ''} 
                  required
                  placeholder="e.g. New Product Launch Teaser"
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Creative Caption</label>
                <textarea 
                  name="content" 
                  rows={4}
                  defaultValue={editingItem?.content || ''} 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none placeholder:text-gray-400"
                  placeholder="Enter the post caption or content..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Image URL</label>
                  <input 
                    type="url" 
                    name="image_url" 
                    defaultValue={editingItem?.image_url || ''} 
                    placeholder="https://example.com/image.jpg"
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Schedule At</label>
                  <input 
                    type="datetime-local" 
                    name="scheduled_for" 
                    defaultValue={editingItem?.scheduled_for ? new Date(editingItem.scheduled_for).toISOString().slice(0, 16) : ''} 
                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Status</label>
                <select 
                  name="status" 
                  defaultValue={editingItem?.status || 'draft'}
                  className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                </select>
                <p className="flex items-center text-[10px] font-medium text-gray-400 mt-2 ml-1">
                  <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-500" />
                  Setting to "Pending" notifies the client for approval.
                </p>
              </div>

              {editingItem?.feedback && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 font-medium">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> Client Feedback
                  </p>
                  <p className="text-xs text-gray-900 leading-relaxed italic">"{editingItem.feedback}"</p>
                </div>
              )}

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
                    <>Save Post <ArrowRight className="ml-2 w-4 h-4" /></>
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
