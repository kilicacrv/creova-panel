'use client'

import { useState } from 'react'
import { 
  CheckCircle2, XCircle, Clock, Copy, Download, Trash2, 
  ExternalLink, MessageSquare, AlertCircle, Loader2, Sparkles,
  Film, Image as ImageIcon, Search, Calendar
} from 'lucide-react'
import { approveMedia, rejectMedia, deleteMediaItem, cleanupMedia } from './actions'

type MediaItem = {
  id: string
  media_url: string
  media_type: 'image' | 'video'
  topic_context: string | null
  status: 'pending_admin' | 'approved' | 'rejected' | 'ready'
  generated_caption: string | null
  admin_feedback: string | null
  created_at: string
  clients: { company_name: string }
}

export default function MediaQueue({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  async function handleApprove(id: string) {
    if (!confirm('Approve this media and generate AI captions?')) return
    setLoadingId(id)
    try {
      await approveMedia(id)
      // Successful revalidation will handle UI update in a real Next.js app, 
      // but for immediate feedback we can optimistic update or reload
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReject(id: string) {
    const feedback = prompt('Provide feedback for rejection:')
    if (!feedback) return
    setLoadingId(id)
    try {
      await rejectMedia(id, feedback)
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleCleanup() {
    if (!confirm('This will delete all media items older than 7 days. Continue?')) return
    try {
      await cleanupMedia()
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.clients.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || item.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search client..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'pending_admin', 'ready', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
                ${filter === s ? 'bg-[#1A56DB] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
              `}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>
          <button
            onClick={handleCleanup}
            className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup (&gt;7d)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="relative aspect-video bg-black group">
              {item.media_type === 'video' ? (
                <video 
                  src={item.media_url} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  muted
                  playsInline
                />
              ) : (
                <img 
                  src={item.media_url} 
                  alt="" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              )}
              <div className="absolute top-4 left-4">
                <StatusBadge status={item.status} />
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={item.media_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-lg hover:bg-white transition-colors block"
                >
                  <ExternalLink className="w-4 h-4 text-gray-700" />
                </a>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{item.clients.company_name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-[#1A56DB]">
                  {item.media_type === 'video' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
              </div>

              {item.topic_context && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Context</p>
                  <p className="text-sm text-blue-900 line-clamp-2">{item.topic_context}</p>
                </div>
              )}

              {item.status === 'ready' && item.generated_caption && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group relative">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Generated Captions
                  </p>
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans italic leading-relaxed">
                    {item.generated_caption}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.generated_caption || '')
                      alert('Caption copied!')
                    }}
                    className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}

              {item.status === 'rejected' && item.admin_feedback && (
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Rejection Feedback
                  </p>
                  <p className="text-sm text-red-900 italic">"{item.admin_feedback}"</p>
                </div>
              )}

              <div className="pt-2 mt-auto grid grid-cols-2 gap-3">
                {item.status === 'pending_admin' ? (
                  <>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={loadingId === item.id}
                      className="h-11 rounded-xl font-bold text-red-600 border-2 border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={loadingId === item.id}
                      className="h-11 rounded-xl font-bold bg-[#1A56DB] text-white shadow-lg shadow-[#1A56DB]/20 hover:bg-[#1e4eb8] transition-all flex items-center justify-center gap-2"
                    >
                      {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="col-span-2 h-11 rounded-xl font-bold bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Finalized
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
          <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400">Your media queue is empty</h2>
          <p className="text-gray-400 mt-1">Pending uploads from editors will appear here.</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending_admin: 'bg-amber-100 text-amber-700 border-amber-200',
    ready: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
