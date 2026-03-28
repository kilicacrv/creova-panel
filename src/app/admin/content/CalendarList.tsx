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
    draft: 'bg-gray-50 text-gray-400 border-gray-100',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-brand-red border-red-100',
    published: 'bg-black text-white border-black shadow-lg shadow-black/10'
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Content Grid</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Multi-Channel Asset Scheduling</p>
        </div>
        <button
          onClick={openCreate}
          className="relative z-10 bg-black hover:bg-brand-red text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center transition-all shadow-xl hover:shadow-red-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
          Plan Asset
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Post Metadata</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hub / Platform</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Node</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Registry Status</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center">
                       <CalendarDays className="w-16 h-16 text-gray-100 mb-6" />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em] italic">No content nodes deployed in current timeline.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/10 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-start">
                        {item.image_url ? (
                          <div className="relative w-14 h-14 mr-5 shrink-0 group-hover:rotate-2 transition-transform">
                            <Image src={item.image_url} alt="" fill sizes="56px" className="rounded-2xl object-cover border border-gray-100 shadow-sm" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-5 shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight text-sm group-hover:text-brand-red transition-colors">{item.title}</p>
                          {item.content && (
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 line-clamp-1 max-w-xs italic" title={item.content}>
                              "{item.content}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 text-[11px] uppercase tracking-tight mb-2 flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-2 text-gray-300 group-hover:text-black transition-colors" />
                        {item.projects?.title || 'GENERAL_HUB'}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg group-hover:bg-white transition-all">
                        {item.platform}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      {item.scheduled_for ? (
                        <div className="flex items-center text-gray-900">
                          <Clock className="w-4 h-4 mr-3 text-brand-red opacity-40" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {new Date(item.scheduled_for).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}<br/>
                            <span className="text-[8px] text-gray-400">
                              T- {new Date(item.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 italic">Floating timeline</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${statusColors[item.status] || 'bg-gray-100'}`}>
                        {item.status}
                      </span>
                      {item.feedback && item.status === 'rejected' && (
                        <div className="mt-3 text-[8px] font-black uppercase tracking-[0.2em] text-brand-red flex items-start bg-red-50 p-3 rounded-xl border border-red-100 animate-in slide-in-from-top-1">
                          <MessageSquare className="w-3 h-3 mr-2 shrink-0 mt-0.5" />
                          <span className="line-clamp-2" title={item.feedback}>{item.feedback}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {item.status === 'draft' && (
                          <button 
                            onClick={() => handleQuickStatus(item.id, 'pending')}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-brand-red hover:bg-brand-red hover:text-white hover:border-brand-red hover:shadow-lg transition-all active:scale-90"
                            title="Transmit for Clearance"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(item.status === 'approved' || item.status === 'pending') && (
                          <button 
                            onClick={() => handleQuickStatus(item.id, 'published')}
                            className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-500 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-lg transition-all active:scale-90"
                            title="Commit to Live Registry"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => openEdit(item)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-black hover:shadow-lg transition-all"
                          title="Modify Asset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-brand-red hover:border-brand-red hover:shadow-lg transition-all"
                          title="Terminate Asset"
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-gray-50 bg-gray-50/50">
              <div>
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                   {editingItem ? 'Modify Content node' : 'Initialize Asset'}
                 </h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Registry Timeline Entry</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              {error && (
                <div className="bg-red-50 text-brand-red p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-5 h-5 mr-4 shrink-0" />
                  Kernel Override: {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Radius *</label>
                  <select 
                    name="project_id" 
                    defaultValue={editingItem?.project_id || ''}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <option value="" disabled>-- SELECT RADIUS --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title.toUpperCase()} ({(p.clients as any)?.company_name || (p.clients as any)?.[0]?.company_name || 'UNK'})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Distribution Platform *</label>
                  <select 
                    name="platform" 
                    defaultValue={editingItem?.platform || 'instagram'}
                    required
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Reference ID *</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingItem?.title || ''} 
                  required
                  placeholder="EX: Q4 BRAND DEPLOYMENT V8"
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Creative Copy / Directive</label>
                <textarea 
                  name="content" 
                  rows={4}
                  defaultValue={editingItem?.content || ''} 
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-bold text-[11px] uppercase tracking-widest transition-all placeholder:text-gray-200 resize-none"
                  placeholder="DIRECTIVE INPUT REQUIRED..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resource URL (Asset)</label>
                  <input 
                    type="url" 
                    name="image_url" 
                    defaultValue={editingItem?.image_url || ''} 
                    placeholder="https://cloud.registry/asset.jpg"
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Activation window</label>
                  <input 
                    type="datetime-local" 
                    name="scheduled_for" 
                    defaultValue={editingItem?.scheduled_for ? new Date(editingItem.scheduled_for).toISOString().slice(0, 16) : ''} 
                    className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lifecycle Clearance</label>
                <select 
                  name="status" 
                  defaultValue={editingItem?.status || 'draft'}
                  className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
                >
                  <option value="draft">INTERNAL DRAFT</option>
                  <option value="pending">PENDING CLIENT CLEARANCE</option>
                  <option value="approved">APPROVED FOR INGESTION</option>
                  <option value="rejected">REJECTED / ABORT</option>
                  <option value="published">DEPLOYED / LIVE</option>
                </select>
                <p className="flex items-center text-[8px] font-black text-gray-300 uppercase tracking-widest mt-3 ml-1">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Transitioning to "Pending" initiates client portal notification.
                </p>
              </div>

              {editingItem?.feedback && (
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
                  <p className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> Client Feedback Override:
                  </p>
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-tight italic">"{editingItem.feedback}"</p>
                </div>
              )}

              <div className="pt-10 flex justify-end gap-5 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                  disabled={isLoading}
                >
                  Abort Protocol
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-4 bg-black hover:bg-brand-red text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-red-200 active:scale-95 flex items-center"
                >
                  {isLoading ? (
                    'COMMITTING...'
                  ) : (
                    <>SAVE CONTENT NODE <ArrowRight className="ml-3 w-4 h-4" /></>
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
