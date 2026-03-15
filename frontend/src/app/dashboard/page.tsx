"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase";
import SearchBar from "@/components/SearchBar"
import EmailResults from "@/components/EmailResults"
import EmailViewer from "@/components/EmailViewer"
import AskRecallio from "@/components/AskRecallio"
import SyncButton from "@/components/SyncButton"

export default function Dashboard({ session }: { session: any }) {
  const [results, setResults] = useState<any[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null)
  const userId = session?.user?.id;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; 
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* 1. Subtle Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/5 blur-[120px] rounded-full"></div>
      </div>

      {/* 2. Left Sidebar (Navigation & Info) */}
      {!selectedEmail && (
        <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl p-8 flex flex-col hidden lg:flex">
          <div className="mb-12">
            <h1 className="text-2xl font-black tracking-tighter italic text-white">RECALLIO</h1>
            <p className="text-[9px] text-blue-500 uppercase tracking-[0.3em] font-bold mt-1">Neural Index v1.0</p>
          </div>
          
          <nav className="flex-1 space-y-6">
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-4">Workspace</p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 text-sm font-medium text-gray-200 border border-white/5">💬 Neural Chat</button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium text-gray-500 transition">📂 Indexed Docs</button>
              </div>
            </div>
          </nav>

          <div className="mt-auto">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase mb-2 font-bold">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] text-gray-300 font-medium font-mono uppercase">API: ONLINE</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Main Content Area */}
      <div className={`flex flex-col h-full overflow-y-auto relative z-10 transition-all duration-700 ease-in-out ${selectedEmail ? "w-1/2 border-r border-white/5" : "flex-1"} custom-scrollbar`}>
        <div className="max-w-5xl mx-auto w-full p-8 lg:p-12">
          
          {/* Header */}
          <header className="mb-12 flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
            <div className="lg:hidden">
               <h1 className="text-xl font-black italic">R_</h1>
            </div>
            
            <div className="hidden lg:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Account Session</p>
              <p className="text-xs text-gray-300 font-mono mt-0.5">{session?.user?.email}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <SyncButton session={session} userId={userId} />
              <div className="h-6 w-[1px] bg-white/10"></div>
              <button 
                onClick={handleLogout}
                className="group flex items-center gap-2 text-[10px] text-gray-500 hover:text-red-500 transition-all font-bold uppercase tracking-widest"
              >
                Exit <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </header>

          <div className="space-y-16">
            {/* Neural Chat Section - Promoted to top for better UX */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                 <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Neural Chat</h2>
                 <div className="h-[1px] flex-1 bg-white/5"></div>
               </div>
               <AskRecallio userId={userId} />
            </section>

            {/* Query Engine / Search Section */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                 <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Advanced Search</h2>
                 <div className="h-[1px] flex-1 bg-white/5"></div>
               </div>
               <div className="glass-panel p-2 rounded-2xl">
                 <SearchBar setResults={setResults} userId={userId} />
               </div>
            </section>
            
            {/* Results Section */}
            <section className="space-y-6 pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Indexed Emails</h2>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">{results.length} Results</span>
              </div>
              <EmailResults results={results} openEmail={(email: any) => setSelectedEmail(email)} />
            </section>
          </div>
        </div>
      </div>

      {/* 4. Email Viewer Panel */}
      {selectedEmail && (
        <div className="w-1/2 h-full flex flex-col bg-white animate-in slide-in-from-right duration-500 ease-out z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          <EmailViewer email={selectedEmail} close={() => setSelectedEmail(null)} />
        </div>
      )}
    </div>
  )
}