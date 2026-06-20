"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { UserProfile } from "@/lib/types";

type Mode = "login" | "register";

const emptyProfile: Omit<UserProfile, "id" | "role"> = {
  fullName: "",
  phone: "",
  city: "",
  state: "",
  budgetMin: 0,
  budgetMax: 0,
  preferredBrands: [],
  wantsOffers: true
};

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id),
    role: row.role === "admin" ? "admin" : "user",
    fullName: String(row.full_name ?? ""),
    phone: String(row.phone ?? ""),
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    budgetMin: Number(row.budget_min ?? 0),
    budgetMax: Number(row.budget_max ?? 0),
    preferredBrands: Array.isArray(row.preferred_brands) ? row.preferred_brands.map(String) : [],
    wantsOffers: Boolean(row.wants_offers)
  };
}

export function AccountClient() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    async function loadProfile() {
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        setUserId("");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();

      if (data) {
        const nextProfile = mapProfile(data);
        setRole(nextProfile.role);
        setProfile({
          fullName: nextProfile.fullName,
          phone: nextProfile.phone,
          city: nextProfile.city,
          state: nextProfile.state,
          budgetMin: nextProfile.budgetMin,
          budgetMax: nextProfile.budgetMax,
          preferredBrands: nextProfile.preferredBrands,
          wantsOffers: nextProfile.wantsOffers
        });
      }
    }

    loadProfile();
  }, [supabase]);

  function updateProfileField<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return setMessage("Supabase nao esta configurado.");

    setLoading(true);
    setMessage("");

    const metadata = {
      full_name: profile.fullName,
      phone: profile.phone,
      city: profile.city,
      state: profile.state,
      budget_min: profile.budgetMin,
      budget_max: profile.budgetMax,
      preferred_brands: profile.preferredBrands,
      wants_offers: profile.wantsOffers
    };

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        setLoading(false);
        return setMessage(error.message);
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          role: "user",
          ...metadata
        });
      }

      setMessage("Conta criada. Se o Supabase pedir confirmacao, confirme seu e-mail antes de entrar.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setLoading(false);
        return setMessage(error.message);
      }

      setUserId(data.user.id);
      setMessage("Login feito com sucesso.");
      window.location.reload();
    }

    setLoading(false);
  }

  async function saveProfile() {
    if (!supabase || !userId) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.fullName,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        budget_min: profile.budgetMin,
        budget_max: profile.budgetMax,
        preferred_brands: profile.preferredBrands,
        wants_offers: profile.wantsOffers
      })
      .eq("id", userId);

    setMessage(error ? error.message : "Perfil atualizado.");
    setLoading(false);
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="admin-layout">
      <form className="form-card" onSubmit={handleAuth}>
        <div className="section-header">
          <div>
            <h2>{userId ? "Minha conta" : mode === "login" ? "Entrar" : "Criar conta"}</h2>
            <p className="section-subtitle">Use seus dados para receber ofertas e alertas melhores.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>E-mail</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </div>
          {!userId ? (
            <div className="field">
              <label>Senha</label>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
            </div>
          ) : null}
          <div className="field">
            <label>Nome</label>
            <input value={profile.fullName} onChange={(event) => updateProfileField("fullName", event.target.value)} />
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input value={profile.phone} onChange={(event) => updateProfileField("phone", event.target.value)} />
          </div>
          <div className="field">
            <label>Cidade</label>
            <input value={profile.city} onChange={(event) => updateProfileField("city", event.target.value)} />
          </div>
          <div className="field">
            <label>Estado</label>
            <input value={profile.state} onChange={(event) => updateProfileField("state", event.target.value)} />
          </div>
          <div className="field">
            <label>Orcamento minimo</label>
            <input value={profile.budgetMin || ""} onChange={(event) => updateProfileField("budgetMin", Number(event.target.value))} type="number" />
          </div>
          <div className="field">
            <label>Orcamento maximo</label>
            <input value={profile.budgetMax || ""} onChange={(event) => updateProfileField("budgetMax", Number(event.target.value))} type="number" />
          </div>
          <div className="field full">
            <label>Marcas de interesse</label>
            <input
              value={profile.preferredBrands.join(", ")}
              onChange={(event) => updateProfileField("preferredBrands", event.target.value.split(",").map((brand) => brand.trim()).filter(Boolean))}
              placeholder="Samsung, Xiaomi, Apple"
            />
          </div>
          <label className="field full checkbox-line">
            <input
              checked={profile.wantsOffers}
              onChange={(event) => updateProfileField("wantsOffers", event.target.checked)}
              type="checkbox"
            />
            Quero receber ofertas e alertas de preco.
          </label>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          {!userId ? (
            <>
              <button className="button" disabled={loading} type="submit">
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
              <button className="button ghost" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Criar conta" : "Ja tenho conta"}
              </button>
            </>
          ) : (
            <>
              <button className="button" disabled={loading} type="button" onClick={saveProfile}>
                Salvar perfil
              </button>
              <button className="button ghost" type="button" onClick={signOut}>
                Sair
              </button>
            </>
          )}
          {message ? <span className="muted">{message}</span> : null}
        </div>
      </form>

      <aside className="notice">
        <h3>{role === "admin" ? "Conta admin" : "Conta comum"}</h3>
        <p>
          Usuarios comuns recebem ofertas e podem salvar preferencias. Apenas perfis com cargo admin veem o botao Admin e acessam o painel.
        </p>
      </aside>
    </div>
  );
}
