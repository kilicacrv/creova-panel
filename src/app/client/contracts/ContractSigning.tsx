'use client'

import { useState, useRef } from 'react'
import { FileText, CheckCircle, Clock, Download, AlertCircle, PenTool, Loader2 } from 'lucide-react'
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
        margin:       1,
        filename:     `Contract_${selectedContract.title.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
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
      
      alert('Contract signed successfully! The PDF has been securely stored.')

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to sign the contract.')
    } finally {
      setIsSigning(false)
    }
  }

  if (contracts.length === 0) {
    return (
      <div className="bg-white border text-sm border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Contracts Yet</h3>
        <p className="text-gray-500 max-w-sm">When your agency sends you a proposal or contract to review, it will securely appear here.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm">
      {/* Sidebar List */}
      <div className="lg:col-span-4 space-y-4">
        {contracts.map(contract => (
          <div 
            key={contract.id}
            onClick={() => setSelectedContractId(contract.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedContractId === contract.id 
                ? 'bg-blue-50 border-[#1A56DB] shadow-sm' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
             <div className="flex justify-between items-start mb-2">
               <h3 className={`font-bold ${selectedContractId === contract.id ? 'text-[#1A56DB]' : 'text-gray-900'}`}>{contract.title}</h3>
               {contract.status === 'active' ? (
                 <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
               ) : contract.status === 'pending' ? (
                 <Clock className="w-5 h-5 text-amber-500 shrink-0" />
               ) : null}
             </div>
             <p className="text-xs text-gray-500 line-clamp-2">{contract.description}</p>
             <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
               <span className="font-semibold text-gray-900">${contract.monthly_fee}/mo</span>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                 contract.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
               }`}>{contract.status}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Main Document View */}
      <div className="lg:col-span-8">
        {selectedContract ? (
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden flex flex-col">
            
            {/* Action Bar */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
               <span className="text-gray-500 font-medium">Document Preview</span>
               {selectedContract.signed_pdf_url && (
                 <a 
                   href={selectedContract.signed_pdf_url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center text-sm font-bold text-[#1A56DB] hover:underline"
                 >
                   <Download className="w-4 h-4 mr-1.5" /> Download PDF
                 </a>
               )}
            </div>

            {/* Contract Content (To be captured as PDF) */}
            <div className="p-8 lg:p-12 overflow-y-auto max-h-[600px] bg-white text-gray-800" ref={contractRef}>
               <h1 className="text-3xl font-black mb-8 border-b-2 border-gray-900 pb-4">{selectedContract.title}</h1>
               
               <div className="space-y-6 text-sm leading-relaxed mb-12">
                 <section>
                   <h2 className="text-lg font-bold text-gray-900 mb-2">1. Scope of Work</h2>
                   <p className="whitespace-pre-wrap">{selectedContract.description}</p>
                 </section>
                 
                 <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
                   <div>
                     <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-1">Contract Duration</p>
                     <p className="font-medium">{new Date(selectedContract.start_date).toLocaleDateString()} to {new Date(selectedContract.end_date).toLocaleDateString()}</p>
                   </div>
                   <div>
                     <p className="text-gray-500 text-xs uppercase tracking-wide font-bold mb-1">Monthly Retainer</p>
                     <p className="font-medium text-lg">${parseFloat(selectedContract.monthly_fee).toLocaleString()}</p>
                   </div>
                 </div>

                 <section>
                   <h2 className="text-lg font-bold text-gray-900 mb-2">2. Payment Terms</h2>
                   <p className="whitespace-pre-wrap">{selectedContract.payment_terms || "Standard net terms apply."}</p>
                 </section>

                 {selectedContract.clauses && (
                   <section>
                     <h2 className="text-lg font-bold text-gray-900 mb-2">3. Additional Clauses</h2>
                     <p className="whitespace-pre-wrap text-gray-600 italic border-l-4 border-gray-200 pl-4 py-1">{selectedContract.clauses}</p>
                   </section>
                 )}
               </div>

               {/* Digital Signature Visual Stamp (Shows on PDF if signed) */}
               {selectedContract.status === 'active' && (
                 <div className="mt-16 border-t-2 border-green-500 pt-8 flex justify-between items-end">
                    <div>
                       <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Digitally Signed By</p>
                       <p className="font-serif text-3xl text-gray-900 italic">{selectedContract.signature_name}</p>
                    </div>
                    <div className="text-right">
                       <div className="inline-flex items-center text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded border border-green-200 mb-2">
                         <CheckCircle className="w-4 h-4 mr-1.5" /> VERIFIED SIGNATURE
                       </div>
                       <p className="text-xs text-gray-500 font-mono">{new Date(selectedContract.signed_at).toLocaleString()}</p>
                       <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {selectedContract.id}</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Signing Form (Only visible if pending) */}
            {selectedContract.status === 'pending' && (
              <div className="bg-gray-50 border-t border-gray-200 p-6">
                <form onSubmit={handleSign}>
                  <h3 className="font-bold text-gray-900 flex items-center mb-4">
                    <PenTool className="w-5 h-5 mr-2 text-blue-600" /> Complete Digital Signature
                  </h3>
                  {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" /> {error}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        required
                        placeholder="Type your full legal name to sign..."
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white font-serif italic text-lg shadow-inner"
                      />
                      <p className="text-xs text-gray-500 mt-2 ml-1">By signing, you agree to all terms outlined above.</p>
                    </div>
                    <button 
                      type="submit"
                      disabled={!signatureName || isSigning}
                      className="h-12 px-8 bg-[#1A56DB] hover:bg-[#1e4eb8] text-white font-bold rounded-xl transition-all shadow-md flex items-center disabled:opacity-50"
                    >
                      {isSigning ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</> : 'I Agree & Sign'}
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
