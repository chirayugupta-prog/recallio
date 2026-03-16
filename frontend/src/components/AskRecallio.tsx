"use client"

import { useState, useEffect, useRef } from "react"
import ChatMessage from "@/components/ChatMessage"
import ChatInput from "@/components/ChatInput"

export type Message = {
  role: "user" | "assistant"
  content: string
  sources?: any[]
}

interface AskRecallioProps {
  userId: string;
  session?: any;
}

export default function AskRecallio({ userId }: AskRecallioProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic jab naya message aaye
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = async (question: string) => {
    if (!userId) {
      alert("Please login first to ask Recallio.");
      return;
    }

    const userMsg: Message = { role: "user", content: question }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question, 
          user_id: userId 
        }),
      })

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json()

      const aiMsg: Message = { 
        role: "assistant", 
        content: data.answer,
        sources: data.sources 
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (error) {
      console.error("Recallio Error:", error)
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "Backend ingestion problem." 
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex flex-col h-[650px] w-full max-w-5xl mx-auto glass-panel rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border border-white/5">
      
      {/* 1. Header Area - Minimal & Clean */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          <h2 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">Neural Chat Engine</h2>
        </div>
        <div className="text-[10px] text-gray-500 font-mono px-2 py-1 bg-black/40 rounded border border-white/5">
          MODEL: LLAMA-3.3-70B
        </div>
      </div>

      {/* 2. Messages Area - Smooth & Spacious */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-blue-500/5"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <span className="text-3xl">🧠</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-300">Recallio is ready.</p>
              <p className="text-xs text-gray-500 italic mt-1">"Analyze my latest career updates from Gmail..."</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-start gap-3 ml-2">
            <div className="flex space-x-1 mt-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <span className="text-[11px] text-blue-400/80 font-medium tracking-wide">
              Scanning your digital life...
            </span>
          </div>
        )}
      </div>

      {/* 3. Input Area - Floating Modern Box */}
      <div className="p-6 bg-[#080808] border-t border-white/5 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="relative group">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none"></div>
        </div>
        <p className="text-[10px] text-center text-gray-600 mt-3 font-medium uppercase tracking-tighter">
          Powered by Voyage AI & Groq Llama 3
        </p>
      </div>
    </div>
  )
}