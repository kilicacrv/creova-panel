'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, MessageSquare, Megaphone, Presentation, RefreshCw } from 'lucide-react'
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
      setError(err.message || 'An error occurred during generation.')
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-[#1A56DB]" />
          AI Copywriter Assistant
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate high-converting ad copy, social media posts, and proposals instantly using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Prompt Configuration</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What are we writing?</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="Social Media Post" className="peer sr-only" defaultChecked />
                    <div className="p-3 border border-gray-200 rounded-lg text-center hover:bg-gray-50 peer-checked:border-[#1A56DB] peer-checked:bg-blue-50 peer-checked:text-[#1A56DB] transition-colors">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Social</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="Ad Copy (Facebook/Google)" className="peer sr-only" />
                    <div className="p-3 border border-gray-200 rounded-lg text-center hover:bg-gray-50 peer-checked:border-[#1A56DB] peer-checked:bg-blue-50 peer-checked:text-[#1A56DB] transition-colors">
                      <Megaphone className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Ad Copy</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="type" value="Proposal Outline" className="peer sr-only" />
                    <div className="p-3 border border-gray-200 rounded-lg text-center hover:bg-gray-50 peer-checked:border-[#1A56DB] peer-checked:bg-blue-50 peer-checked:text-[#1A56DB] transition-colors">
                      <Presentation className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">Proposal</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                <select name="tone" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white">
                  <option value="Professional & Trustworthy">Professional & Trustworthy</option>
                  <option value="Casual & Friendly">Casual & Friendly</option>
                  <option value="Bold & Persuasive">Bold & Persuasive</option>
                  <option value="Humorous & Witty">Humorous & Witty</option>
                  <option value="Urgent & Promotional">Urgent & Promotional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Product Details *</label>
                <textarea 
                  name="prompt" 
                  required
                  rows={4}
                  placeholder="e.g. A summer sale for a luxury watch brand offering 20% off all divers watches. Target audience is young professionals."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full bg-[#1A56DB] hover:bg-[#1e4eb8] text-white py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Copy
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[400px]">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                Generated Result
              </h2>
              <button 
                onClick={handleCopy}
                disabled={!result || isGenerating}
                className="text-gray-500 hover:text-[#1A56DB] flex items-center text-xs font-medium disabled:opacity-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? <span className="text-green-600">Copied!</span> : 'Copy Text'}
              </button>
            </div>
            
            <div className="p-6 flex-grow overflow-y-auto">
              {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start text-sm">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  {error}
                </div>
              ) : isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 pt-10">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-[#1A56DB] rounded-full animate-spin"></div>
                  <p className="text-sm animate-pulse">Consulting the AI minds...</p>
                </div>
              ) : result ? (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center pt-20">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Sparkles className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm">Your generated AI copy will appear here.</p>
                  <p className="text-xs mt-1 text-gray-400 max-w-xs">Fill out the prompt configuration on the left and hit generate.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Ensure additional icons are properly provided
import { AlertCircle } from 'lucide-react'
