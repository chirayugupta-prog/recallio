"use client";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        scopes: 'https://www.googleapis.com/auth/gmail.readonly'
      }
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white p-4">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-[#333] bg-clip-text text-transparent">
          Recallio
        </h1>
        <p className="text-gray-500 text-xs tracking-[0.6em] uppercase font-bold">
          Search your digital life
        </p>
      </div>

      <button 
        onClick={handleLogin}
        className="group relative px-12 py-4 bg-white text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-4 shadow-2xl hover:shadow-white/10"
      >
        <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
        Continue with Google
      </button>

      <div className="absolute bottom-12 flex items-center gap-3 text-[10px] text-gray-600 uppercase tracking-widest font-medium">
        <span className="w-8 h-[1px] bg-gray-800"></span>
        Secure • Private • AI Powered
        <span className="w-8 h-[1px] bg-gray-800"></span>
      </div>
    </div>
  );
}