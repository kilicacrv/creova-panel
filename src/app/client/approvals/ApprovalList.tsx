'use client'

import { useState } from 'react'
import { CheckSquare, X, FileText, Calendar, Share2, ImageIcon, AlertCircle, ShieldCheck, Zap, Sparkles, Clock, Globe, Target, ArrowRight } from 'lucide-react'
import Image from 'next/image'
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
      const result = await updateContentApproval(selectedItem.id, status, feedback)
      if (result?.error) {
        setError(result.error)
      } else {
        // Update local state
        setItems(prev => prev.map(item => 
          item.id === selectedItem.id ? { ...item, status, feedback } : item
        ))
        setIsModalOpen(false)
      }
    } catch (err: any) {
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const platformIcons: Record<string, any> = {
    instagram: <Globe className="w-3 h-3" />,
    facebook: <Globe className="w-3 h-3" />,
    linkedin: <Globe className="w-3 h-3" />,
    twitter: <Globe className="w-3 h-3" />,
    tiktok: <Globe className="w-3 h-3" />,
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-40"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Asset Approvals</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Content Verification & Deployment Protocol</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
              <Sparkles className="w-5 h-5 text-brand-red" />
           </div>
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">Awaiting Final Verification</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {items.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center">
            <ShieldCheck className="w-20 h-20 text-gray-100 mb-8" />
            <h3 className="text-gray-900 font-black text-2xl uppercase tracking-tighter italic">Queue Clear</h3>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 max-w-sm">No pending assets require verification at this current temporal coordinate.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-2">
              {/* Media Preview */}
              <div className="aspect-[4/5] bg-black flex items-center justify-center relative overflow-hidden">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.title} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0" />
                ) : (
                  <div className="flex flex-col items-center text-gray-700">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                    <span className="text-[9px] uppercase font-black tracking-[0.3em] text-gray-600 italic">No_Asset_Uplink</span>
                  </div>
                )}
                
                <div className="absolute top-6 left-6 px-4 py-2 bg-black/90 backdrop-blur-md rounded-xl text-white text-[9px] font-black uppercase tracking-widest flex items-center shadow-2xl border border-white/10 group-hover:bg-brand-red group-hover:border-brand-red transition-colors">
                  {platformIcons[item.platform.toLowerCase()] || <Globe className="w-3 h-3" />}
                  <span className="ml-3 italic">{item.platform}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-8 flex-grow space-y-4">
                <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg italic group-hover:text-brand-red transition-colors">{item.title}</h3>
                <div className="h-px w-full bg-gray-50"></div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-tight leading-relaxed line-clamp-3">
                  {item.content || 'System: No caption package detected.'}
                </p>

                <div className="pt-4 flex items-center justify-between">
                   <div className="flex items-center text-[9px] text-gray-400 font-black uppercase tracking-widest italic font-mono">
                     <Clock className="w-3 h-3 mr-2 opacity-30" />
                     {item.scheduled_for ? new Date(item.scheduled_for).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'PROTOCOL_TBD'}
                   </div>
                   <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${item.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.status}
                   </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="px-8 pb-8">
                {item.status === 'pending' ? (
                  <button 
                    onClick={() => openApproval(item)}
                    className="w-full bg-black hover:bg-brand-red text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-red-200 active:scale-95 group/btn flex items-center justify-center"
                  >
                    Verification Interface <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className={`w-full py-5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center border shadow-inner ${
                    item.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-red-50 text-brand-red border-red-100'
                  }`}>
                    {item.status === 'approved' ? <ShieldCheck className="w-4 h-4 mr-3" /> : <X className="w-4 h-4 mr-3" />}
                    Asset {item.status}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-500">
            
            {/* Preview on Modal (Left) */}
            <div className="lg:w-1/2 bg-black shrink-0 relative min-h-[400px]">
              {selectedItem.image_url ? (
                <Image src={selectedItem.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
              ) : (
                <div className="h-full flex items-center justify-center text-white/10">
                   <Target className="w-32 h-32" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-10 left-10">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 italic">Creative Preview</p>
                 <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">{selectedItem.title}</h4>
              </div>
            </div>

            {/* Decision Form (Right) */}
            <div className="lg:w-1/2 p-12 flex flex-col bg-white overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Verification Matrix</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{selectedItem.platform} Marketing Node • Registry Active</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-300 hover:text-brand-red hover:bg-red-50 rounded-2xl transition-all">
                   <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 flex-grow">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 italic">Content Payload:</p>
                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-sm font-black text-gray-800 uppercase tracking-tight whitespace-pre-wrap leading-relaxed shadow-inner italic">
                    {selectedItem.content || 'System_Audit: No caption payload identified.'}
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic ml-2">
                    Operational Feedback / Revision Logic
                  </label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="ENTER CALIBRATION FEEDBACK..."
                    className="w-full px-8 py-6 border border-gray-100 rounded-[2rem] bg-gray-50 focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 text-xs font-black uppercase tracking-widest resize-none transition-all shadow-inner"
                  ></textarea>
                </div>

                {error && (
                  <div className="bg-red-50 text-brand-red p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center border border-red-100 animate-in shake-200">
                    <AlertCircle className="w-5 h-5 mr-4" /> Kernel Error: {error}
                  </div>
                )}
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6 pt-10 border-t border-gray-50">
                <button 
                  onClick={() => handleAction('rejected')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-10 py-5 bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-brand-red hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                >
                  <X className="w-4 h-4 mr-3" />
                  Terminate Asset
                </button>
                <button 
                  onClick={() => handleAction('approved')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-10 py-5 bg-black hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl hover:shadow-emerald-200 disabled:opacity-50 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 mr-3" />
                  Verify Payload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
