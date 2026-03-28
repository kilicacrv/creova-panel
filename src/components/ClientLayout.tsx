'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, 
  LayoutDashboard, 
  FolderOpen, 
  Receipt, 
  CalendarCheck, 
  Menu, 
  X,
  LogOut,
  Settings,
  FileText,
  Megaphone,
  ShieldCheck,
  Bell,
  Zap
} from 'lucide-react'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Terminal Overview', href: '/client', icon: LayoutDashboard },
    { name: 'Active Nodes', href: '/client/projects', icon: FolderOpen },
    { name: 'Financial Ledger', href: '/client/invoices', icon: Receipt },
    { name: 'Asset Approvals', href: '/client/approvals', icon: CalendarCheck },
    { name: 'Legal Protocols', href: '/client/contracts', icon: FileText },
    { name: 'Growth Logistics', href: '/client/campaigns', icon: Megaphone },
  ]

  const isActive = (path: string) => {
    if (path === '/client' && pathname !== '/client') return false
    return pathname?.startsWith(path)
  }

  const handleLogout = async () => {
    window.location.href = '/auth/logout'
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans antialiased text-gray-900">
      {/* Mobile Menu Button - Fixed Top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6">
        <div className="flex items-center">
          <img src="/brand/logo.png" alt="Creova" className="h-8 w-auto object-contain" />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 rounded-2xl transition-all"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-100 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) w-72
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shrink-0 flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 border-b border-gray-50 shrink-0">
          <Link href="/client" className="group">
            <img src="/brand/logo.png" alt="Creova" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-6 py-10 space-y-10 custom-scrollbar">
           <div className="space-y-4">
            <h3 className="px-5 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-2 italic">Client Interface</h3>
            <div className="space-y-1.5">
               {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group/nav
                      ${active 
                        ? 'bg-black text-white shadow-2xl shadow-black/10 translate-x-1' 
                        : 'text-gray-500 hover:text-black hover:bg-gray-50'}
                    `}
                  >
                    <item.icon className={`w-4 h-4 mr-4 shrink-0 transition-transform group-hover/nav:scale-110 ${active ? 'text-brand-red' : 'text-gray-300 group-hover/nav:text-black'}`} />
                    {item.name}
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse"></div>}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Area (Support & Logout) */}
        <div className="p-6 border-t border-gray-50 shrink-0 bg-gray-50/30">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm mb-4">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-50 rounded-xl">
                   <ShieldCheck className="w-4 h-4 text-brand-red" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Secure Protocol</span>
             </div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">End-to-end encrypted hub access active.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 rounded-2xl hover:bg-black hover:text-white transition-all group shadow-sm hover:shadow-xl"
          >
            <LogOut className="w-4 h-4 mr-4 shrink-0 text-gray-300 group-hover:text-brand-red transition-colors" />
            Terminate Link
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-20 lg:pt-0 overflow-y-auto custom-scrollbar">
        <header className="h-24 lg:h-32 flex items-center justify-between px-6 lg:px-12 shrink-0 border-b border-gray-50 bg-white/50">
           <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 italic mb-1">Authenticated Hub</h2>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">Command Environment</span>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-6">
              <button className="p-3 bg-gray-50 text-gray-400 hover:text-black hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all relative">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-red rounded-full"></span>
              </button>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Client_01_Live</span>
                 <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-sm shadow-2xl shadow-black/10">C</div>
              </div>
           </div>
        </header>
        <div className="flex-1 w-full max-w-7xl mx-auto p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  )
}
