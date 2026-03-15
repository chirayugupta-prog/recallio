"use client"

export default function EmailResults({ results, openEmail }: any) {
  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
        <div className="text-4xl mb-4 opacity-20">📥</div>
        <p className="text-gray-500 text-sm font-medium tracking-wide">No neural matches found.</p>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2 font-bold">Try adjusting your query engine parameters</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {results.map((item: any) => (
        <div
          key={item.id}
          onClick={() => openEmail(item)}
          className="group relative bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl cursor-pointer hover:bg-white/[0.03] hover:border-blue-500/30 transition-all duration-300 shadow-xl overflow-hidden"
        >
          {/* Subtle Background Glow on Hover */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex items-start gap-5">
            {/* Neural Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0 shadow-lg group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300">
              {item.title ? item.title[0].toUpperCase() : "E"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-200 text-base truncate pr-6 group-hover:text-white transition-colors">
                  {item.title || "Untitled Metadata Stream"}
                </h3>
                
                {item.similarity && (
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {Math.round(item.similarity * 100)}% Accuracy
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium group-hover:text-gray-400 transition-colors">
                {item.content}
              </p>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-black">
                    {item.source || "Gmail Server"}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-white/10"></div>
                  <span className="text-[9px] text-gray-500 font-mono italic">
                    {item.metadata?.date || "Recently Indexed"}
                  </span>
                </div>
                
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  Open Thread →
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}