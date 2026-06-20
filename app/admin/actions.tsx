"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase";

type ActionState = {
  ok: boolean;
  message: string;
};

function numberValue(formData: FormData, key: string) {
  return Number(String(formData.get(key) ?? "0").replace(",", "."));
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireAdmin(formData: FormData): Promise<
  | {
      ok: true;
      supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>;
    }
  | {
      ok: false;
      message: string;
    }
> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase ainda nao esta configurado."
    };
  }

  const accessToken = textValue(formData, "access_token");

  if (!accessToken) {
    return {
      ok: false,
      message: "Faca login como admin para cadastrar celulares."
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return {
      ok: false,
      message: "Sessao invalida. Entre novamente."
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return {
      ok: false,
      message: "Acesso negado. Seu usuario nao e admin."
    };
  }

  return {
    ok: true,
    supabase
  };
}

function revalidatePhonePages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/celulares");
  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/celulares/${slug}`);
  }
}

export async function createPhoneAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin(formData);

  if (!admin.ok) {
    return admin;
  }

  const name = textValue(formData, "name");
  const slug = textValue(formData, "slug");
  const phoneId = textValue(formData, "phone_id");

  if (!name || !slug) {
    return {
      ok: false,
      message: "Nome e slug sao obrigatorios."
    };
  }

  const payload = {
    slug,
    name,
    brand: textValue(formData, "brand"),
    image_url: textValue(formData, "image_url"),
    launch_status: textValue(formData, "launch_status") || "available",
    release_date: textValue(formData, "release_date") || new Date().toISOString().slice(0, 10),
    price: numberValue(formData, "price"),
    best_price: numberValue(formData, "best_price"),
    affiliate_url: textValue(formData, "affiliate_url"),
    chipset: textValue(formData, "chipset"),
    ram_gb: numberValue(formData, "ram_gb"),
    storage_gb: numberValue(formData, "storage_gb"),
    display: textValue(formData, "display"),
    display_hz: numberValue(formData, "display_hz"),
    battery_mah: numberValue(formData, "battery_mah"),
    charging_w: numberValue(formData, "charging_w"),
    main_camera_mp: numberValue(formData, "main_camera_mp"),
    video: textValue(formData, "video"),
    os: textValue(formData, "os"),
    antutu_score: numberValue(formData, "antutu_score"),
    antutu_version: textValue(formData, "antutu_version"),
    height_mm: numberValue(formData, "height_mm"),
    width_mm: numberValue(formData, "width_mm"),
    thickness_mm: numberValue(formData, "thickness_mm"),
    weight_g: numberValue(formData, "weight_g"),
    water_resistance: textValue(formData, "water_resistance"),
    score_performance: numberValue(formData, "score_performance"),
    score_camera: numberValue(formData, "score_camera"),
    score_battery: numberValue(formData, "score_battery"),
    score_display: numberValue(formData, "score_display"),
    score_build: numberValue(formData, "score_build"),
    score_value: numberValue(formData, "score_value"),
    verdict: textValue(formData, "verdict")
  };

  const { error } = phoneId
    ? await admin.supabase.from("phones").update(payload).eq("id", phoneId)
    : await admin.supabase.from("phones").upsert(payload, { onConflict: "slug" });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  revalidatePhonePages(slug);

  return {
    ok: true,
    message: "Celular salvo com sucesso."
  };
}

export async function deletePhoneAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin(formData);

  if (!admin.ok) {
    return admin;
  }

  const phoneId = textValue(formData, "phone_id");
  const slug = textValue(formData, "slug");

  if (!phoneId) {
    return {
      ok: false,
      message: "Selecione um celular para excluir."
    };
  }

  const { error } = await admin.supabase.from("phones").delete().eq("id", phoneId);

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  revalidatePhonePages(slug);

  return {
    ok: true,
    message: "Celular excluido."
  };
}

export async function saveOfferAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin(formData);

  if (!admin.ok) {
    return admin;
  }

  const phoneId = textValue(formData, "phone_id");
  const phoneSlug = textValue(formData, "phone_slug");
  const store = textValue(formData, "store");
  const price = numberValue(formData, "price");
  const url = textValue(formData, "url");

  if (!phoneId || !store || !price || !url) {
    return {
      ok: false,
      message: "Preencha loja, preco e link da oferta."
    };
  }

  const { error } = await admin.supabase.from("phone_prices").insert({
    phone_id: phoneId,
    store,
    price,
    url
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  const { data: bestOffer } = await admin.supabase
    .from("phone_prices")
    .select("price,url")
    .eq("phone_id", phoneId)
    .order("price", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (bestOffer) {
    await admin.supabase
      .from("phones")
      .update({
        best_price: Number(bestOffer.price),
        affiliate_url: String(bestOffer.url)
      })
      .eq("id", phoneId);
  }

  revalidatePhonePages(phoneSlug);

  return {
    ok: true,
    message: "Oferta adicionada."
  };
}

export async function deleteOfferAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin(formData);

  if (!admin.ok) {
    return admin;
  }

  const offerId = textValue(formData, "offer_id");
  const phoneId = textValue(formData, "phone_id");
  const phoneSlug = textValue(formData, "phone_slug");

  if (!offerId || !phoneId) {
    return {
      ok: false,
      message: "Selecione uma oferta para excluir."
    };
  }

  const { error } = await admin.supabase.from("phone_prices").delete().eq("id", offerId);

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  const { data: bestOffer } = await admin.supabase
    .from("phone_prices")
    .select("price,url")
    .eq("phone_id", phoneId)
    .order("price", { ascending: true })
    .limit(1)
    .maybeSingle();

  await admin.supabase
    .from("phones")
    .update({
      best_price: bestOffer ? Number(bestOffer.price) : 0,
      affiliate_url: bestOffer ? String(bestOffer.url) : ""
    })
    .eq("id", phoneId);

  revalidatePhonePages(phoneSlug);

  return {
    ok: true,
    message: "Oferta excluida."
  };
}
