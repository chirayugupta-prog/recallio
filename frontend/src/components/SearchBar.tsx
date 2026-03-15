"use client"

import { useState } from "react"

export default function SearchBar({ setResults, userId }: any) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query) return;
    if (!userId) {
      alert("User identification lost. Please re-login.");
      return;
    }

    setLoading(true)
    try {
      const res = await fetch(
        `http://localhost:8000/search?query=${encodeURIComponent(query)}&user_id=${userId}`
      )

      if (!res.ok) throw new Error("Search failed");
      
      const data = await res.json()
      setResults(data)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full group">
      {/* Background Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
      
      <div className="relative flex gap-2 items-center bg-[#0A0A0A] border border-white/5 p-2 rounded-2xl shadow-2xl focus-within:border-blue-500/40 transition-all">
        
        {/* Command Icon */}
        <div className="pl-4 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        <input
          type="text"
          placeholder="Filter indexed intelligence..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          className="flex-1 bg-transparent py-3 px-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none disabled:cursor-not-allowed"
          disabled={loading}
        />

        {/* Action Button */}
        <button
          onClick={search}
          disabled={loading || !query}
          className={`
            min-w-[100px] px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all
            ${loading || !query 
              ? "bg-white/5 text-gray-600 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-[0.98]"}
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Searching</span>
            </div>
          ) : (
            "Execute Search"
          )}
        </button>
      </div>

      {/* Shortcut Hint */}
      <div className="mt-2 flex justify-between px-2">
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Global Index Search</p>
        <p className="text-[9px] text-gray-600 font-mono italic">Press [Enter] to query</p>
      </div>
    </div>
  )
}