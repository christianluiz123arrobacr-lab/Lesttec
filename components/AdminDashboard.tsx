"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { deleteOfferAction, deletePhoneAction, saveOfferAction } from "@/app/admin/actions";
import { mapPhone, mapPrice } from "@/lib/phones";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Phone, PhonePrice } from "@/lib/types";
import { AdminPhoneForm } from "./AdminPhoneForm";

type AdminState = "loading" | "logged-out" | "forbidden" | "admin";
type AdminStats = {
  phones: number;
  users: number;
  offerUsers: number;
};
type AdminProfile = {
  id: string;
  role: string;
  fullName: string;
  phone: string;
  city: string;
  state: string;
  budgetMin: number;
  budgetMax: number;
  preferredBrands: string[];
  wantsOffers: boolean;
};

const actionInitialState = {
  ok: false,
  message: ""
};

function AdminPhoneManager({ accessToken }: { accessToken: string }) {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [offers, setOffers] = useState<PhonePrice[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deleteState, deleteAction, deletePending] = useActionState(deletePhoneAction, actionInitialState);
  const [offerState, offerAction, offerPending] = useActionState(saveOfferAction, actionInitialState);
  const [deleteOfferState, deleteOffer, deleteOfferPending] = useActionState(deleteOfferAction, actionInitialState);

  const selectedPhone = useMemo(() => phones.find((phone) => phone.id === selectedId) ?? null, [phones, selectedId]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase ainda nao esta configurado.");
      setLoading(false);
      return;
    }
    const client = supabase;

    async function loadPhones() {
      setLoading(true);
      const { data, error } = await client.from("phones").select("*").order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const mappedPhones = (data ?? []).map(mapPhone);
      setPhones(mappedPhones);
      setSelectedId((current) => (mappedPhones.some((phone) => phone.id === current) ? current : ""));
      setLoading(false);
    }

    loadPhones();
  }, [deleteState, offerState, deleteOfferState]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !selectedPhone) {
      setOffers([]);
      return;
    }
    const client = supabase;
    const selectedPhoneId = selectedPhone.id;

    async function loadOffers() {
      const { data, error } = await client
        .from("phone_prices")
        .select("*")
        .eq("phone_id", selectedPhoneId)
        .order("price", { ascending: true });

      if (error) {
        setMessage(error.message);
        return;
      }

      setOffers((data ?? []).map(mapPrice));
    }

    loadOffers();
  }, [selectedPhone, offerState, deleteOfferState]);

  return (
    <div className="admin-manager">
      <div className="admin-sidebar form-card">
        <div className="admin-heading">
          <div>
            <h3>Celulares</h3>
            <p className="muted">{phones.length} cadastrados</p>
          </div>
          <button className="button ghost" type="button" onClick={() => setSelectedId("")}>
            Novo
          </button>
        </div>

        {loading ? <p className="muted">Carregando celulares...</p> : null}
        {message ? <p className="muted">{message}</p> : null}

        <div className="admin-phone-list">
          {phones.map((phone) => (
            <button
              className={`admin-phone-item ${selectedPhone?.id === phone.id ? "active" : ""}`}
              key={phone.id}
              type="button"
              onClick={() => setSelectedId(phone.id)}
            >
              <img alt="" src={phone.imageUrl} />
              <span>
                <strong>{phone.name}</strong>
                <small>
                  {phone.brand} - R$ {phone.bestPrice.toLocaleString("pt-BR")}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-main-stack">
        <AdminPhoneForm key={selectedPhone?.id ?? "new-phone"} accessToken={accessToken} phone={selectedPhone} />

        {selectedPhone ? (
          <div className="form-card">
            <div className="admin-heading">
              <div>
                <h3>Ofertas de {selectedPhone.name}</h3>
                <p className="muted">Cadastre lojas e links afiliados. O menor preco vira o preco principal.</p>
              </div>
              <form action={deleteAction}>
                <input name="access_token" type="hidden" value={accessToken} />
                <input name="phone_id" type="hidden" value={selectedPhone.id} />
                <input name="slug" type="hidden" value={selectedPhone.slug} />
                <button className="button danger" disabled={deletePending} type="submit">
                  {deletePending ? "Excluindo..." : "Excluir celular"}
                </button>
              </form>
            </div>

            {deleteState.message ? <p className={deleteState.ok ? "winner" : "muted"}>{deleteState.message}</p> : null}

            <form className="offer-form" action={offerAction}>
              <input name="access_token" type="hidden" value={accessToken} />
              <input name="phone_id" type="hidden" value={selectedPhone.id} />
              <input name="phone_slug" type="hidden" value={selectedPhone.slug} />
              <div className="field">
                <label>Loja</label>
                <input name="store" placeholder="Amazon, Mercado Livre..." required />
              </div>
              <div className="field">
                <label>Preco</label>
                <input name="price" type="number" step="0.01" placeholder="2399" required />
              </div>
              <div className="field">
                <label>Link da oferta</label>
                <input name="url" placeholder="https://..." required />
              </div>
              <button className="button" disabled={offerPending} type="submit">
                {offerPending ? "Salvando..." : "Adicionar oferta"}
              </button>
            </form>

            {offerState.message ? <p className={offerState.ok ? "winner" : "muted"}>{offerState.message}</p> : null}

            <div className="offer-list">
              {offers.map((offer) => (
                <div className="offer-item" key={offer.id}>
                  <div>
                    <strong>{offer.store}</strong>
                    <span>R$ {offer.price.toLocaleString("pt-BR")}</span>
                  </div>
                  <a className="button ghost" href={offer.url} target="_blank" rel="noreferrer">
                    Abrir
                  </a>
                  <form action={deleteOffer}>
                    <input name="access_token" type="hidden" value={accessToken} />
                    <input name="offer_id" type="hidden" value={offer.id} />
                    <input name="phone_id" type="hidden" value={selectedPhone.id} />
                    <input name="phone_slug" type="hidden" value={selectedPhone.slug} />
                    <button className="button danger" disabled={deleteOfferPending} type="submit">
                      Excluir
                    </button>
                  </form>
                </div>
              ))}
              {!offers.length ? <p className="muted">Nenhuma oferta cadastrada para este celular.</p> : null}
              {deleteOfferState.message ? (
                <p className={deleteOfferState.ok ? "winner" : "muted"}>{deleteOfferState.message}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="notice">Cadastre um celular primeiro para adicionar ofertas por loja.</div>
        )}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [state, setState] = useState<AdminState>("loading");
  const [accessToken, setAccessToken] = useState("");
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<AdminStats>({ phones: 0, users: 0, offerUsers: 0 });
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const offerContacts = profiles
    .filter((profile) => profile.wantsOffers)
    .map(
      (profile) =>
        `${profile.fullName || "Sem nome"} | ${profile.phone || "Sem WhatsApp"} | ${profile.city || "-"}-${profile.state || "-"} | R$ ${profile.budgetMin} a R$ ${profile.budgetMax} | ${profile.preferredBrands.join(", ") || "Sem marcas"}`
    )
    .join("\n");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setState("forbidden");
      return;
    }
    const client = supabase;

    async function loadAdmin() {
      const { data: sessionData } = await client.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setState("logged-out");
        return;
      }

      setAccessToken(session.access_token);
      setEmail(session.user.email ?? "");

      const { data } = await client.from("profiles").select("role").eq("id", session.user.id).maybeSingle();

      if (data?.role !== "admin") {
        setState("forbidden");
        return;
      }

      const [{ count: phoneCount }, { count: userCount }, { count: offerUserCount }, { data: profileRows }] = await Promise.all([
        client.from("phones").select("id", { count: "exact", head: true }),
        client.from("profiles").select("id", { count: "exact", head: true }),
        client.from("profiles").select("id", { count: "exact", head: true }).eq("wants_offers", true),
        client
          .from("profiles")
          .select("id,role,full_name,phone,city,state,budget_min,budget_max,preferred_brands,wants_offers")
          .order("created_at", { ascending: false })
          .limit(30)
      ]);

      setStats({
        phones: phoneCount ?? 0,
        users: userCount ?? 0,
        offerUsers: offerUserCount ?? 0
      });
      setProfiles(
        (profileRows ?? []).map((profile) => ({
          id: String(profile.id),
          role: String(profile.role),
          fullName: String(profile.full_name ?? ""),
          phone: String(profile.phone ?? ""),
          city: String(profile.city ?? ""),
          state: String(profile.state ?? ""),
          budgetMin: Number(profile.budget_min ?? 0),
          budgetMax: Number(profile.budget_max ?? 0),
          preferredBrands: Array.isArray(profile.preferred_brands) ? profile.preferred_brands.map(String) : [],
          wantsOffers: profile.wants_offers === true
        }))
      );
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
        <AdminPhoneManager accessToken={accessToken} />
        <aside className="notice">
          <h3>Painel liberado</h3>
          <p>Logado como admin: {email}</p>
          <p>Por aqui voce cadastra, edita e exclui celulares. Tambem da para adicionar ofertas por loja com link afiliado.</p>
          <h3>Usuarios recentes</h3>
          <label className="admin-copy-box">
            <strong>Contatos para ofertas</strong>
            <textarea readOnly value={offerContacts} />
          </label>
          <div className="admin-user-list">
            {profiles.map((profile) => (
              <div className="admin-user-item" key={profile.id}>
                <strong>{profile.fullName || "Sem nome"}</strong>
                <span>{profile.phone || "Sem WhatsApp"}</span>
                <span>
                  {profile.city || "-"} / {profile.state || "-"}
                </span>
                <span>
                  R$ {profile.budgetMin.toLocaleString("pt-BR")} ate R$ {profile.budgetMax.toLocaleString("pt-BR")}
                </span>
                <span>{profile.preferredBrands.join(", ") || "Sem marcas"}</span>
                <span>{profile.wantsOffers ? "Aceita ofertas" : "Nao aceita ofertas"}</span>
              </div>
            ))}
            {!profiles.length ? <p>Nenhum usuario encontrado.</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
