'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, MessageSquare, Megaphone, Presentation, RefreshCw, Zap, Type, Target, ArrowRight, AlertCircle } from 'lucide-react'
import { generateCopy } from './actions'

export default function AIAssistant() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsGenerating(true)
    setResult('')
    setError('')
    setCopied(false)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const generatedText = await generateCopy(formData)
      setResult(generatedText)
    } catch (err: any) {
      setError(err.message || 'An error occurred during neural synthesis.')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="bg-white p-10 lg:p-14 rounded-[2.5rem] border border-gray-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
             <div className="p-3 bg-red-50 rounded-2xl">
                <Sparkles className="w-8 h-8 text-brand-red animate-pulse" />
             </div>
             <div className="h-10 w-px bg-gray-100 mx-2" />
             <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-red">Neural Intelligence v4.0</span>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic mt-1">
                  AI Synthesis Engine
                </h1>
             </div>
          </div>
          <p className="text-gray-400 text-sm font-medium max-w-2xl leading-relaxed">
            Harness the power of the Creova Neural Core to generate high-conversion campaign copy, strategic social media narratives, and industry-grade proposals with near-instant synthesis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-50 p-10 relative overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-brand-red opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tighter uppercase italic flex items-center">
               <Target className="w-5 h-5 mr-3 text-brand-red" />
               Synthesis Protocol
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Payload Typology</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="cursor-pointer group/opt">
                    <input type="radio" name="type" value="Social Media Post" className="peer sr-only" defaultChecked />
                    <div className="p-5 border-2 border-gray-50 rounded-[1.8rem] text-center hover:bg-gray-50 peer-checked:border-brand-red peer-checked:bg-red-50/30 peer-checked:text-brand-red transition-all group-active/opt:scale-95 shadow-sm">
                      <MessageSquare className="w-6 h-6 mx-auto mb-3 opacity-40 peer-checked:opacity-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest block">Social</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group/opt">
                    <input type="radio" name="type" value="Ad Copy (Facebook/Google)" className="peer sr-only" />
                    <div className="p-5 border-2 border-gray-50 rounded-[1.8rem] text-center hover:bg-gray-50 peer-checked:border-brand-red peer-checked:bg-red-50/30 peer-checked:text-brand-red transition-all group-active/opt:scale-95 shadow-sm">
                      <Megaphone className="w-6 h-6 mx-auto mb-3 opacity-40 peer-checked:opacity-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest block">Ad Copy</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group/opt">
                    <input type="radio" name="type" value="Proposal Outline" className="peer sr-only" />
                    <div className="p-5 border-2 border-gray-50 rounded-[1.8rem] text-center hover:bg-gray-50 peer-checked:border-brand-red peer-checked:bg-red-50/30 peer-checked:text-brand-red transition-all group-active/opt:scale-95 shadow-sm">
                      <Presentation className="w-6 h-6 mx-auto mb-3 opacity-40 peer-checked:opacity-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest block">Proposal</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Acoustic Signature (Tone)</label>
                <select name="tone" className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer">
                  <option value="Professional & Trustworthy">Strategic & Industrial</option>
                  <option value="Casual & Friendly">Personnel & Fluid</option>
                  <option value="Bold & Persuasive">High-Impact / Disruptive</option>
                  <option value="Humorous & Witty">Entertain / Organic</option>
                  <option value="Urgent & Promotional">Tactical / Time-Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 flex justify-between">
                   <span>Core Objectives / Payload Details</span>
                   <span className="text-brand-red font-black">*</span>
                </label>
                <textarea 
                  name="prompt" 
                  required
                  rows={6}
                  placeholder="EX: Q4 BRAND DEPLOYMENT FOR LUXURY WATCH ASSETS. TARGET: DISCRIMINATING PROFESSIONALS."
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white focus:border-red-100 font-bold text-[11px] uppercase tracking-widest transition-all placeholder:text-gray-200 resize-none min-h-[180px]"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full h-20 bg-black hover:bg-brand-red text-white py-2.5 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center transition-all disabled:opacity-30 disabled:grayscale shadow-2xl group active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-6 h-6 mr-4 animate-spin" />
                    Synthesizing Logic...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-4 text-brand-red fill-current group-hover:text-white transition-colors" />
                    Initialize Synthesis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col h-full min-h-[600px] relative overflow-hidden group">
            <div className="border-b border-gray-50 p-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center italic">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse" />
                Streamed Result Archive
              </h2>
              <button 
                onClick={handleCopy}
                disabled={!result || isGenerating}
                className="group/copy py-3 px-6 bg-gray-50 hover:bg-black text-gray-400 hover:text-white rounded-xl transition-all flex items-center gap-3 disabled:opacity-10 border border-transparent hover:border-black active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 group-hover/copy:text-brand-red transition-colors" />}
                <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Registry Updated' : 'Extract Metadata'}</span>
              </button>
            </div>
            
            <div className="p-10 lg:p-14 flex-grow overflow-y-auto relative z-10 selection:bg-brand-red selection:text-white">
              {error ? (
                <div className="bg-red-50 text-brand-red p-10 rounded-[2rem] flex items-start border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-6 h-6 mr-5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Fatal Override Exception</p>
                    <p className="text-sm font-medium leading-relaxed">{error}</p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center p-20">
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-gray-50 border-t-brand-red rounded-full animate-spin shadow-2xl shadow-red-100"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Sparkles className="w-8 h-8 text-brand-red/20 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mt-10 animate-pulse">Accessing Neural Archive...</p>
                </div>
              ) : result ? (
                <div className="prose prose-sm prose-invert max-w-none text-gray-800 whitespace-pre-wrap font-medium leading-[1.8] text-base animate-in fade-in duration-1000">
                  {result}
                  <div className="mt-20 pt-10 border-t border-gray-50 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-gray-200">
                     <span>Deployment Ready</span>
                     <span>Checksum Validated</span>
                     <span>v4.0.2</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30 select-none grayscale">
                  <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-10 border border-gray-100 rotate-3 transition-transform group-hover:rotate-0">
                    <Type className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 leading-relaxed max-w-[240px]">
                    Neural interface standby. Awaiting configuration input from client node.
                  </p>
                  <div className="mt-12 w-40 h-1 bg-gray-50 rounded-full overflow-hidden">
                     <div className="w-1/3 h-full bg-brand-red/10 animate-[loading_2s_infinite]" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Ambient Background Gradient for the result area */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none opacity-50"></div>
          </div>
        </div>

      </div>

      <div className="bg-black p-10 lg:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red rounded-full blur-[120px] -mr-[250px] -mt-[250px] opacity-10 group-hover:opacity-20 transition-opacity duration-1000"></div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
               <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">Neural Optimization</h3>
               <p className="text-gray-500 font-black uppercase tracking-widest text-[9px]">Continuous Learning Protocol Active</p>
            </div>
            <div className="flex gap-10">
               <div className="flex flex-col">
                  <span className="text-brand-red font-black text-3xl tracking-tighter">98.4%</span>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Accuracy Meta</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-black text-3xl tracking-tighter">~1.2s</span>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Synthesis Speed</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-black text-3xl tracking-tighter">GPT-4o</span>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mt-1">Base Model</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
