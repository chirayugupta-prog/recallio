"use client"

import { useState, KeyboardEvent } from "react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input)
      setInput("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative flex items-center gap-2 bg-[#141414] border border-white/10 rounded-2xl px-4 py-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all shadow-inner">
      
      {/* Search Icon / Indicator */}
      <span className="text-gray-500 text-lg ml-1">🔍</span>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Recallio about your digital life..."
        disabled={disabled}
        className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-sm text-gray-200 placeholder:text-gray-600 disabled:cursor-not-allowed"
      />

      {/* Action Button */}
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={`
          flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
          ${input.trim() && !disabled 
            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95" 
            : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"}
        `}
      >
        {disabled ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="text-lg">↑</span>
        )}
      </button>

      {/* Floating Shortcut Hint */}
      <div className="absolute -bottom-6 right-4">
        <p className="text-[9px] text-gray-700 font-mono tracking-widest uppercase">
          Press Enter to Search
        </p>
      </div>
    </div>
  )
}