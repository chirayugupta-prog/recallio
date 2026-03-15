"use client"

import { Message } from "@/components/AskRecallio"

export default function ChatMessage({ message }: { message: Message }) {
  const isAI = message.role === "assistant"

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex gap-3 max-w-[85%] ${isAI ? "flex-row" : "flex-row-reverse"}`}>
        
        {/* Avatar Area */}
        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold border ${
          isAI 
          ? "bg-blue-600/10 border-blue-500/20 text-blue-400" 
          : "bg-white/5 border-white/10 text-gray-400"
        }`}>
          {isAI ? "AI" : "ME"}
        </div>

        <div className="flex flex-col gap-2">
          {/* Message Bubble */}
          <div className={`
            p-4 rounded-2xl text-sm leading-relaxed shadow-2xl
            ${isAI 
              ? "bg-[#111111] text-gray-200 border border-white/5 rounded-tl-none" 
              : "bg-blue-600 text-white rounded-tr-none shadow-[0_0_20px_rgba(37,99,235,0.2)]"}
          `}>
            <div className="whitespace-pre-wrap font-medium tracking-tight">
              {message.content}
            </div>
            
            {/* Sources Section */}
            {isAI && message.sources && message.sources.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    Verified Citations
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((source: any, idx: number) => (
                    <a 
                      key={idx} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] bg-black/40 hover:bg-blue-500/10 px-3 py-2 rounded-xl border border-white/5 text-blue-400 hover:border-blue-500/40 transition-all group"
                    >
                      <span className="text-[12px] group-hover:scale-110 transition-transform">📄</span>
                      <span className="max-w-[120px] truncate font-bold uppercase tracking-tighter">
                        {source.title || `Data Unit #${idx + 1}`}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp or Status (Optional) */}
          {isAI && (
            <span className="text-[9px] text-gray-600 font-mono uppercase ml-1">
              Neural Response Generated
            </span>
          )}
        </div>
      </div>
    </div>
  )
}