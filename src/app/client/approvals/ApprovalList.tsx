'use client'

import { useState } from 'react'
import { CheckSquare, X, FileText, Calendar, Share2, ImageIcon, AlertCircle } from 'lucide-react'
import { updateContentApproval } from './actions'

type ContentItem = {
  id: string
  title: string
  description: string | null
  content: string | null
  platform: string
  image_url: string | null
  scheduled_for: string | null
  status: 'pending' | 'approved' | 'rejected'
  feedback: string | null
}

export default function ApprovalList({ initialItems }: { initialItems: ContentItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function openApproval(item: ContentItem) {
    setSelectedItem(item)
    setFeedback('')
    setError('')
    setIsModalOpen(true)
  }

  async function handleAction(status: 'approved' | 'rejected') {
    if (!selectedItem) return
    setIsSubmitting(true)
    setError('')

    try {
      await updateContentApproval(selectedItem.id, status, feedback)
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === selectedItem.id ? { ...item, status, feedback } : item
      ))
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const platformIcons: Record<string, any> = {
    instagram: <Share2 className="w-4 h-4" />,
    facebook: <Share2 className="w-4 h-4" />,
    linkedin: <Share2 className="w-4 h-4" />,
    twitter: <Share2 className="w-4 h-4" />,
    tiktok: <Share2 className="w-4 h-4" />,
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No content awaiting approval.</p>
            <p className="text-sm text-gray-400 mt-1">Check back later when the agency uploads new posts.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              {/* Media Preview */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-xs uppercase font-bold tracking-widest">No Media Preview</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-gray-900 text-xs font-bold flex items-center shadow-sm">
                  {platformIcons[item.platform]}
                  <span className="ml-1.5 capitalize">{item.platform}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                  {item.content || 'No caption provided.'}
                </p>

                <div className="flex items-center text-xs text-gray-500 font-medium pb-4 border-b border-gray-100">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#1A56DB]" />
                  Scheduled for: {item.scheduled_for ? new Date(item.scheduled_for).toLocaleString() : 'Not scheduled'}
                </div>
              </div>

              {/* Action Area */}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                {item.status === 'pending' ? (
                  <button 
                    onClick={() => openApproval(item)}
                    className="w-full bg-[#1A56DB] hover:bg-[#1e4eb8] text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    Review & Decide
                  </button>
                ) : (
                  <div className={`w-full py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center border ${
                    item.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {item.status === 'approved' ? <CheckSquare className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                    {item.status === 'approved' ? 'Post Approved' : 'Post Rejected'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
            
            {/* Preview on Modal (Left) */}
            <div className="md:w-1/2 bg-gray-100 shrink-0">
              {selectedItem.image_url ? (
                <img src={selectedItem.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300">
                   <ImageIcon className="w-20 h-20" />
                </div>
              )}
            </div>

            {/* Decision Form (Right) */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{selectedItem.platform} Channel</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl group flex items-center">
                   &times;
                </button>
              </div>

              <div className="flex-grow overflow-y-auto mb-6">
                <p className="text-sm font-medium text-gray-700 mb-1">Preview Copy:</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap">
                  {selectedItem.content || 'No caption.'}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    <FileText className="w-4 h-4 inline mr-1 text-blue-600" />
                    Feedback / Revisions (Optional)
                  </label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Provide feedback if you want changes made..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] text-sm resize-none"
                  ></textarea>
                </div>

                {error && <div className="text-xs text-red-600 flex items-center bg-red-50 p-2 rounded border border-red-100">
                   <AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}
                </div>}

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAction('rejected')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center px-4 py-3 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction('approved')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center px-4 py-3 bg-[#1A56DB] text-white font-bold rounded-xl hover:bg-[#1e4eb8] transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
