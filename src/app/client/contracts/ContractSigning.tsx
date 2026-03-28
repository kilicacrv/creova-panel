'use client'

import { useState, useRef } from 'react'
import { FileText, CheckCircle, Clock, Download, AlertCircle, PenTool, Loader2, ShieldCheck, Zap, ArrowRight, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function ContractSigning({ initialContracts }: { initialContracts: any[] }) {
  const [contracts, setContracts] = useState(initialContracts)
  const [selectedContractId, setSelectedContractId] = useState<string | null>(initialContracts[0]?.id || null)
  
  const [signatureName, setSignatureName] = useState('')
  const [isSigning, setIsSigning] = useState(false)
  const [error, setError] = useState('')
  const contractRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClient()
  
  const selectedContract = contracts.find(c => c.id === selectedContractId)

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedContract) return
    setIsSigning(true)
    setError('')

    try {
      // 1. Generate PDF on client side
      const html2pdf = (await import('html2pdf.js')).default
      
      const opt = {
        margin:       0.5,
        filename:     `Creova_Protocol_${selectedContract.title.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      }

      // Generate the PDF blob
      if (!contractRef.current) return
      const pdfBlob = await html2pdf().from(contractRef.current).set(opt).output('blob')

      // 2. Upload to Supabase Storage
      const fileName = `signed-contracts/${selectedContract.client_id}/${selectedContract.id}_${Date.now()}.pdf`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(fileName)

      const fileUrl = publicUrlData.publicUrl

      // 3. Update Contract status in Database
      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          status: 'active',
          signed_at: new Date().toISOString(),
          signature_name: signatureName,
          signed_pdf_url: fileUrl
        })
        .eq('id', selectedContract.id)

      if (updateError) throw updateError

      // Update local state
      setContracts(prev => prev.map(c => 
        c.id === selectedContract.id ? 
        { ...c, status: 'active', signed_at: new Date().toISOString(), signature_name: signatureName, signed_pdf_url: fileUrl } 
        : c
      ))
      
      alert('Registry Protocol Executed. Master Agreement securely archived.')

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to execute protocol signature.')
    } finally {
      setIsSigning(false)
    }
  }

  if (contracts.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-24 text-center flex flex-col items-center justify-center shadow-sm">
        <FileText className="w-20 h-20 text-gray-100 mb-8" />
        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">Zero Protocols Identified</h3>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 max-w-sm">When the agency dispatches a master agreement for review, it will securely populate this matrix.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      {/* Sidebar List */}
      <div className="xl:col-span-4 space-y-6">
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 italic ml-2">Registry Portfolio</h3>
        {contracts.map(contract => (
          <div 
            key={contract.id}
            onClick={() => setSelectedContractId(contract.id)}
            className={`p-6 rounded-[2rem] border transition-all cursor-pointer group hover:shadow-2xl relative overflow-hidden ${
              selectedContractId === contract.id 
                ? 'bg-black border-black shadow-xl shadow-black/10 text-white' 
                : 'bg-white border-gray-100 hover:border-gray-200 text-gray-900'
            }`}
          >
             {selectedContractId === (contract.id) && <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red rounded-full blur-3xl opacity-20 -mr-12 -mt-12"></div>}
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                  <h3 className="font-black text-sm uppercase tracking-tight italic line-clamp-1">{contract.title}</h3>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${selectedContractId === contract.id ? 'text-gray-400' : 'text-gray-300'}`}>Ref: PROTOCOL_{contract.id.slice(0,8)}</p>
               </div>
               {contract.status === 'active' ? (
                 <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
               ) : (
                 <Clock className={`w-5 h-5 shrink-0 ${selectedContractId === contract.id ? 'text-brand-red animate-pulse' : 'text-amber-500'}`} />
               )}
             </div>
             <div className={`mt-6 pt-6 border-t flex justify-between items-center relative z-10 ${selectedContractId === contract.id ? 'border-white/10' : 'border-gray-50'}`}>
               <span className="font-black text-sm italic">${parseFloat(contract.monthly_fee).toLocaleString()} <span className="text-[9px] not-italic opacity-40">/MO</span></span>
               <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                 contract.status === 'active' 
                   ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                   : (selectedContractId === contract.id ? 'bg-white/10 text-white border-white/20' : 'bg-amber-50 text-amber-600 border-amber-100')
               }`}>{contract.status}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Main Document View */}
      <div className="xl:col-span-8">
        {selectedContract ? (
          <div className="bg-white border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-700">
            
            {/* Action Bar */}
            <div className="bg-black px-10 py-6 border-b border-white/5 flex justify-between items-center">
               <span className="text-[9px] uppercase font-black tracking-[0.4em] text-gray-500 italic">CREOVA_LEGAL_PROTOCOL_VIEWER</span>
               {selectedContract.signed_pdf_url && (
                 <a 
                   href={selectedContract.signed_pdf_url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center text-[9px] font-black uppercase tracking-widest text-brand-red hover:text-white transition-colors group"
                 >
                   <Download className="w-4 h-4 mr-3 group-hover:-translate-y-1 transition-transform" /> Export Secure PDF
                 </a>
               )}
            </div>

            {/* Contract Content (To be captured as PDF) */}
            <div className="p-16 lg:p-24 overflow-y-auto max-h-[700px] bg-white text-gray-900 font-sans custom-scrollbar" ref={contractRef}>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 border-b-8 border-black pb-12">
                  <div>
                    <img src="/brand/logo.png" alt="Creova" className="h-10 w-auto mb-10 block grayscale transition-all hover:grayscale-0" />
                    <h1 className="text-6xl font-black tracking-[calc(-0.04em)] uppercase italic leading-none">{selectedContract.title}</h1>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-2">Protocol Deployment ID</p>
                    <p className="text-xs font-black font-mono bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 italic">{selectedContract.id.toUpperCase()}</p>
                  </div>
               </div>
               
               <div className="space-y-16 text-[15px] leading-relaxed mb-24">
                 <section>
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 italic">01. OPERATIONAL_SCOPE</h2>
                   <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner italic font-black text-gray-800 uppercase tracking-tight">
                     <p className="whitespace-pre-wrap">{selectedContract.description}</p>
                   </div>
                 </section>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-12 border-y-2 border-gray-50">
                   <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-50">
                      <p className="text-gray-300 text-[10px] uppercase tracking-[0.4em] font-black mb-4 italic">TEMPORAL_EFFECTIVE_WINDOW</p>
                      <p className="font-black text-xl text-gray-900 uppercase tracking-tighter italic">
                         {new Date(selectedContract.start_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} 
                         <span className="mx-4 text-brand-red">→</span> 
                         {new Date(selectedContract.end_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                   </div>
                   <div className="bg-black p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] font-black mb-4 italic">CAPITAL_INVESTMENT_LEAD</p>
                      <div className="flex items-end gap-2">
                        <p className="font-black text-5xl text-white tracking-tighter italic">${parseFloat(selectedContract.monthly_fee).toLocaleString()}</p>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">/ MONTHLY_CYCLE</span>
                      </div>
                   </div>
                 </div>

                 <section>
                   <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 italic">02. FINANCIAL_PROTOCOL</h2>
                   <p className="whitespace-pre-wrap font-black text-gray-700 uppercase tracking-tight">{selectedContract.payment_terms || "Standard net zero terms apply. Ledgers synchronized on the 1st of each calendar cycle."}</p>
                 </section>

                 {selectedContract.clauses && (
                   <section>
                     <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 italic">03. AGENCY_PROVISIONS</h2>
                     <div className="p-8 bg-red-50/20 border-l-8 border-brand-red rounded-r-[2rem] italic font-black text-brand-red uppercase tracking-tight text-sm leading-relaxed">
                        {selectedContract.clauses}
                     </div>
                   </section>
                 )}
               </div>

               {/* Digital Signature Visual Stamp (Shows on PDF if signed) */}
               {selectedContract.status === 'active' && (
                 <div className="mt-40 pt-16 border-t-8 border-black flex flex-col lg:flex-row justify-between items-end gap-12">
                    <div className="text-left w-full lg:w-auto">
                       <p className="text-[10px] text-gray-300 uppercase tracking-[0.4em] font-black mb-6 italic">DIGITALLY_CERTIFIED_BY</p>
                       <p className="font-serif text-6xl text-black italic border-b-2 border-gray-100 pb-4 tracking-tighter">{selectedContract.signature_name}</p>
                    </div>
                    <div className="text-right w-full lg:w-auto">
                       <div className="inline-flex items-center text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 px-8 py-4 rounded-2xl border border-emerald-100 mb-6 shadow-xl shadow-emerald-500/10 italic">
                         <ShieldCheck className="w-5 h-5 mr-3" /> REGISTERED_PROTOCOL_VERIFIED
                       </div>
                       <p className="text-[10px] text-gray-300 font-mono font-black uppercase tracking-widest italic opacity-60">TIMESTAMP_NODE: {new Date(selectedContract.signed_at).toISOString()}</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Signing Form (Only visible if pending) */}
            {selectedContract.status === 'pending' && (
               <div className="bg-black p-12 lg:p-16 border-t border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red rounded-full blur-[120px] opacity-10 -mr-48 -mt-48 transition-all duration-1000 group-hover:scale-125"></div>
                <form onSubmit={handleSign} className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                     <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic flex items-center">
                          <PenTool className="w-8 h-8 mr-6 text-brand-red" /> EXECUTE_SIGNATURE
                        </h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 ml-14">By executing this signature, you legally certify acceptance of the specified protocol.</p>
                     </div>
                     {isSigning && <div className="flex items-center gap-3 text-[10px] font-black text-brand-red uppercase tracking-widest animate-pulse"><Zap className="w-4 h-4" /> ENCRYPTING_NODE...</div>}
                  </div>
                  
                  {error && (
                    <div className="mb-10 bg-red-500/10 text-brand-red p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center border border-brand-red/20 shadow-2xl animate-in shake-200">
                      <AlertCircle className="w-6 h-6 mr-4 shrink-0" /> KERNEL_EXCEPTION: {error}
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        required
                        placeholder="ENTER FULL LEGAL NAME..."
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full h-20 px-10 border border-white/10 rounded-3xl focus:outline-none focus:ring-8 focus:ring-red-500/10 bg-white/5 font-serif italic text-4xl text-white shadow-2xl transition-all placeholder:font-sans placeholder:not-italic placeholder:text-gray-700 placeholder:text-sm placeholder:uppercase placeholder:font-black placeholder:tracking-[0.3em]"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!signatureName || isSigning}
                      className="h-20 px-16 bg-white hover:bg-brand-red text-black hover:text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl transition-all shadow-[0_20px_60px_rgba(255,255,255,0.1)] hover:shadow-red-500/40 disabled:opacity-20 active:scale-95 shrink-0"
                    >
                      {isSigning ? 'PROCESSING...' : 'EXECUTE_PROTOCOL'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
