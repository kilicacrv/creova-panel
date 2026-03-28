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
      setError(err.message || 'An error occurred during content generation.')
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
      <div className="bg-white p-10 lg:p-14 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-[100px] -mr-40 -mt-40 opacity-40"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
             <div className="p-3 bg-blue-50 rounded-2xl">
                <Sparkles className="w-8 h-8 text-blue-600" />
             </div>
             <div className="h-10 w-px bg-gray-100 mx-2" />
             <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Smart Assistant v4.0</span>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight mt-1">
                  AI Content Generator
                </h1>
             </div>
          </div>
          <p className="text-gray-500 text-sm font-medium max-w-2xl leading-relaxed">
            Generate high-conversion campaign copy, social media narratives, and professional proposals with Creova's advanced AI engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8 tracking-tight flex items-center">
               <Target className="w-5 h-5 mr-3 text-blue-600" />
               Configuration
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-4 ml-1">Content Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="cursor-pointer group/opt">
                    <input type="radio" name="type" value="Social Media Post" className="peer sr-only" defaultChecked />
                    <div className="p-4 border-2 border-gray-50 rounded-2xl text-center hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:bg-blue-50/30 peer-checked:text-blue-600 transition-all shadow-sm">
                      <MessageSquare className="w-5 h-5 mx-auto mb-2 opacity-40 peer-checked:opacity-100" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">Social</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group/opt">
                    <input type="radio" name="type" value="Ad Copy (Facebook/Google)" className="peer sr-only" />
                    <div className="p-4 border-2 border-gray-50 rounded-2xl text-center hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:bg-blue-50/30 peer-checked:text-blue-600 transition-all shadow-sm">
                      <Megaphone className="w-5 h-5 mx-auto mb-2 opacity-40 peer-checked:opacity-100" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">Ad Copy</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group/opt">
                    <input type="radio" name="type" value="Proposal Outline" className="peer sr-only" />
                    <div className="p-4 border-2 border-gray-50 rounded-2xl text-center hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:bg-blue-50/30 peer-checked:text-blue-600 transition-all shadow-sm">
                      <Presentation className="w-5 h-5 mx-auto mb-2 opacity-40 peer-checked:opacity-100" />
                      <span className="text-[10px] font-bold uppercase tracking-wider block">Proposal</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 ml-1">Tone of Voice</label>
                <select name="tone" className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all cursor-pointer">
                  <option value="Professional & Trustworthy">Professional & Trustworthy</option>
                  <option value="Casual & Friendly">Casual & Friendly</option>
                  <option value="Bold & Persuasive">Bold & Persuasive</option>
                  <option value="Humorous & Witty">Humorous & Witty</option>
                  <option value="Urgent & Promotional">Urgent & Promotional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 ml-1 flex justify-between">
                   <span>Details / Instructions</span>
                   <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea 
                  name="prompt" 
                  required
                  rows={6}
                  placeholder="e.g. Write a social media post about our new luxury watch collection launch..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-600 text-sm transition-all resize-none min-h-[160px] placeholder:text-gray-400"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-3 fill-current" />
                    Generate Content
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px] relative overflow-hidden group">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Generated Content
              </h2>
              <button 
                onClick={handleCopy}
                disabled={!result || isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg transition-all border border-gray-200 text-xs font-semibold disabled:opacity-50 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <div className="p-10 lg:p-14 flex-grow overflow-y-auto relative z-10">
              {error ? (
                <div className="bg-red-50 text-red-600 p-8 rounded-lg flex items-start border border-red-100 animate-in shake-200">
                  <AlertCircle className="w-5 h-5 mr-4 shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Error Occurred</p>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center p-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-8 animate-pulse">Generating Content...</p>
                </div>
              ) : result ? (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-[1.8] text-base animate-in fade-in duration-1000">
                  {result}
                  <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                     <span>Deployment Ready</span>
                     <span>v4.0.2</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-40 select-none">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                    <Type className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 leading-relaxed max-w-[200px]">
                    Enter instructions to generate content
                  </p>
                </div>
              )}
            </div>
            
            {/* Ambient Background Gradient for the result area */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none opacity-50"></div>
          </div>
        </div>

      </div>

      <div className="bg-gray-900 p-10 lg:p-14 rounded-xl shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] -mr-[250px] -mt-[250px] opacity-10"></div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div>
               <h3 className="text-3xl font-bold text-white tracking-tight mb-2">AI Optimization</h3>
               <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">High-performance content generation</p>
            </div>
            <div className="flex gap-10">
               <div className="flex flex-col">
                  <span className="text-blue-500 font-bold text-3xl tracking-tight">98.4%</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Accuracy</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-bold text-3xl tracking-tight">~1.2s</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Speed</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-white font-bold text-3xl tracking-tight">GPT-4o</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Model</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
