"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AdminOnlyLink({ className, href, label }: { className?: string; href: string; label: string }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;

    async function loadAdmin() {
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsAdmin(data?.role === "admin");
    }

    loadAdmin();

    const { data: listener } = client.auth.onAuthStateChange(() => {
      loadAdmin();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isAdmin) return null;

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}
