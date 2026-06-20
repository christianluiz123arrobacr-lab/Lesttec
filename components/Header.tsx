"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    async function loadUser() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      setIsLoggedIn(Boolean(user));

      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsAdmin(data?.role === "admin");
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header className="topbar">
      <div className="shell nav">
        <Link href="/" className="brand" aria-label="PhoneBase">
          <span className="brand-mark">P</span>
          <span>PhoneBase</span>
        </Link>
        <nav className="nav-links" aria-label="Navegacao principal">
          <Link href="/celulares">Celulares</Link>
          <Link href="/comparar">Comparar</Link>
          {isAdmin ? <Link href="/admin">Admin</Link> : null}
          <Link href="/conta">{isLoggedIn ? "Minha conta" : "Entrar"}</Link>
        </nav>
        <div className="search">Busque celulares, tablets e TVs</div>
      </div>
    </header>
  );
}
