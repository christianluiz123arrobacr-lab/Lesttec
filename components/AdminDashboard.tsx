"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { AdminPhoneForm } from "./AdminPhoneForm";

type AdminState = "loading" | "logged-out" | "forbidden" | "admin";
type AdminStats = {
  phones: number;
  users: number;
  offerUsers: number;
};

export function AdminDashboard() {
  const [state, setState] = useState<AdminState>("loading");
  const [accessToken, setAccessToken] = useState("");
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<AdminStats>({ phones: 0, users: 0, offerUsers: 0 });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState("forbidden");
      return;
    }

    async function loadAdmin() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setState("logged-out");
        return;
      }

      setAccessToken(session.access_token);
      setEmail(session.user.email ?? "");

      const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();

      if (data?.role !== "admin") {
        setState("forbidden");
        return;
      }

      const [{ count: phoneCount }, { count: userCount }, { count: offerUserCount }] = await Promise.all([
        supabase.from("phones").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("wants_offers", true)
      ]);

      setStats({
        phones: phoneCount ?? 0,
        users: userCount ?? 0,
        offerUsers: offerUserCount ?? 0
      });
      setState("admin");
    }

    loadAdmin();
  }, []);

  if (state === "loading") {
    return <div className="notice">Verificando permissao...</div>;
  }

  if (state === "logged-out") {
    return (
      <div className="notice">
        <h3>Login necessario</h3>
        <p>Entre na sua conta primeiro. Se seu perfil for admin, o painel sera liberado.</p>
        <a className="button" href="/conta">
          Entrar
        </a>
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="notice">
        <h3>Acesso negado</h3>
        <p>Seu usuario esta logado, mas nao possui cargo admin. Essa area nao aparece para usuarios comuns.</p>
        <a className="button ghost" href="/">
          Voltar ao site
        </a>
      </div>
    );
  }

  return (
    <div className="compare-grid">
      <div className="stats-grid">
        <div className="stat-card">
          <strong>{stats.phones}</strong>
          <span>celulares cadastrados</span>
        </div>
        <div className="stat-card">
          <strong>{stats.users}</strong>
          <span>usuarios cadastrados</span>
        </div>
        <div className="stat-card">
          <strong>{stats.offerUsers}</strong>
          <span>aceitam receber ofertas</span>
        </div>
      </div>

      <div className="admin-layout">
        <AdminPhoneForm accessToken={accessToken} />
        <aside className="notice">
          <h3>Painel liberado</h3>
          <p>Logado como admin: {email}</p>
          <p>Por aqui voce cadastra celulares. O proximo passo e adicionar edicao, exclusao e cadastro de ofertas por loja.</p>
        </aside>
      </div>
    </div>
  );
}
