"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

// --- HELPERS ---
function decodeBase64(data: string) {
  try {
    return decodeURIComponent(
      atob(data.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
  } catch (e) {
    try {
      return atob(data.replace(/-/g, "+").replace(/_/g, "/"))
    } catch { return "" }
  }
}

function extractBody(payload: any): string {
  if (!payload) return ""
  if (payload.body?.data) return decodeBase64(payload.body.data)
  
  if (payload.parts) {
    const htmlPart = payload.parts.find((p: any) => p.mimeType === "text/html")
    if (htmlPart && htmlPart.body?.data) return decodeBase64(htmlPart.body.data)

    for (const part of payload.parts) {
      const result = extractBody(part)
      if (result) return result
    }

    const plainPart = payload.parts.find((p: any) => p.mimeType === "text/plain")
    if (plainPart && plainPart.body?.data) return decodeBase64(plainPart.body.data)
  }
  return ""
}

function getHeader(headers: any[], name: string) {
  const h = headers?.find((x) => x.name.toLowerCase() === name.toLowerCase())
  return h ? h.value : ""
}

export default function EmailViewer({ email, close }: any) {
  const [fullEmail, setFullEmail] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmail = useCallback(async () => {
    if (!email?.source_id) return
    setLoading(true)
    setError(null)
    setFullEmail(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.provider_token
      if (!token) {
        setError("Session expired. Please login again.")
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/gmail/email/${email.source_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const dataEmail = await res.json()
      setFullEmail(dataEmail)
    } catch (err: any) {
      setError("Failed to load full thread.")
    } finally {
      setLoading(false)
    }
  }, [email])

  useEffect(() => {
    if (email) loadEmail()
  }, [email, loadEmail])

  if (!email) return null

  return (
    <div className="flex-1 flex flex-col bg-[#050505] h-full overflow-hidden border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
      
      {/* 1. Dynamic Header Section */}
      <div className="bg-[#0A0A0A] p-8 border-b border-white/5 relative">
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={close} 
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-white"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-white tracking-tight leading-snug mb-4">
            {fullEmail ? getHeader(fullEmail.payload.headers, "Subject") : email.title}
          </h2>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 text-xs">
                {email.metadata?.from?.charAt(0).toUpperCase() || "E"}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  {getHeader(fullEmail?.payload?.headers || [], "From") || email.metadata?.from}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {getHeader(fullEmail?.payload?.headers || [], "Date") || "Original Message"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 bg-white relative">
        {loading ? (
          <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Neural Decryption...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 bg-[#050505] flex flex-col items-center justify-center p-10 text-center">
            <p className="text-red-400 font-mono text-xs mb-4">{error}</p>
            <button onClick={loadEmail} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase hover:bg-white/10 transition">Re-attempt Fetch</button>
          </div>
        ) : (
          <div className="w-full h-full">
            {extractBody(fullEmail?.payload) ? (
              <iframe
                title="email-content"
                className="w-full h-full border-none"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        body { font-family: -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #1a1a1a; background-color: #fff; margin: 0; }
                        img { max-width: 100% !important; height: auto !important; }
                        pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; }
                        .preview-badge { background: #fff7ed; color: #c2410c; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: bold; margin-bottom: 20px; display: inline-block; border: 1px solid #ffedd5; }
                      </style>
                    </head>
                    <body>${extractBody(fullEmail?.payload)}</body>
                  </html>
                `}
              />
            ) : (
              <div className="p-10 bg-white h-full overflow-y-auto">
                <div className="mb-6 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg text-xs font-bold uppercase tracking-wider inline-block">
                  Semantic Preview
                </div>
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {email.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}