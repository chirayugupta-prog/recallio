"use client";
import { useState } from "react";

export default function SyncButton({ session, userId }: { session: any; userId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setStatus("Syncing...");

    try {
      const token = session?.provider_token; 

      if (!token) {
        setStatus("Session expired. Please relogin.");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/gmail/ingest?user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Server Error" }));
        throw new Error(errData.detail || "Sync failed");
      }

      const data = await res.json();
      setStatus(`${data.ingested} emails synced successfully.`);
      setLastSynced(new Date().toLocaleTimeString());
      
      setTimeout(() => setStatus(""), 5000);
      
    } catch (error: any) {
      console.error("Sync Error:", error);
      setStatus(error.name === "TypeError" ? "Backend unreachable" : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 group">
      {lastSynced && !status && (
        <span className="text-[9px] text-gray-500 font-mono tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
          LAST INDEXED: {lastSynced}
        </span>
      )}

      <button
        onClick={handleSync}
        disabled={loading}
        className={`relative overflow-hidden px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 border
          ${loading 
            ? "bg-gray-900 border-white/5 text-gray-500 cursor-not-allowed shadow-none" 
            : "bg-[#0A0A0A] border-blue-500/30 text-blue-400 hover:text-white hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95"
          }`}
      >
        <div className="flex items-center gap-3">
          {loading ? (
            <>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span>Processing Inbox</span>
            </>
          ) : (
            <>
              <span className="text-[12px] opacity-80">🔄</span>
              <span>Sync Inbox</span>
            </>
          )}
        </div>

        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        )}
      </button>
      
      {status && (
        <div className={`mt-1 animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-2 py-1 px-3 rounded-full border text-[9px] font-medium uppercase tracking-tight
          ${status.includes("Error") || status.includes("failed") || status.includes("expired")
            ? "bg-red-500/10 border-red-500/20 text-red-400" 
            : "bg-green-500/10 border-green-500/20 text-green-400"}`}>
          <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
          {status}
        </div>
      )}
    </div>
  );
}