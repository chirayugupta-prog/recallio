"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; 
import Dashboard from "./dashboard/page"; // Folder path check karein
import Login from "./login/page";       

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  // Agar session nahi hai toh Login dikhao, warna Dashboard
  if (!session) return <Login />;

  return <Dashboard session={session} />;
}