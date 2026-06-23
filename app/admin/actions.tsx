"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase";

type ActionState = {
  ok: boolean;
  message: string;
};

function numberValue(formData: FormData, key: string) {
  const parsed = Number(String(formData.get(key) ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampScore(value: number) {
  return Math.min(10, Math.max(0, value));
}

function isSafeUrl(value: string) {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function booleanValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
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

  if (profileError || !["admin", "owner"].includes(String(profile?.role))) {
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
  const slug = textValue(formData, "slug") || slugify(name);
  const phoneId = textValue(formData, "phone_id");

  if (!name || !slug) {
    return {
      ok: false,
      message: "Nome e slug sao obrigatorios."
    };
  }

  const affiliateUrl = textValue(formData, "affiliate_url");
  const imageUrl = textValue(formData, "image_url");

  if (!isSafeUrl(affiliateUrl) || !isSafeUrl(imageUrl)) {
    return { ok: false, message: "Use apenas URLs https:// em imagem e links afiliados." };
  }

  const payload = {
    slug,
    name,
    brand: textValue(formData, "brand"),
    image_url: imageUrl,
    launch_status: textValue(formData, "launch_status") || "available",
    publication_status: textValue(formData, "publication_status") || "draft",
    release_date: textValue(formData, "release_date") || new Date().toISOString().slice(0, 10),
    price: numberValue(formData, "price"),
    best_price: numberValue(formData, "best_price"),
    affiliate_url: affiliateUrl,
    chipset: textValue(formData, "chipset"),
    gpu: textValue(formData, "gpu"),
    ram_gb: numberValue(formData, "ram_gb"),
    ram_type: textValue(formData, "ram_type"),
    storage_gb: numberValue(formData, "storage_gb"),
    storage_type: textValue(formData, "storage_type"),
    display: textValue(formData, "display"),
    screen_type: textValue(formData, "screen_type"),
    screen_resolution: textValue(formData, "screen_resolution"),
    display_hz: numberValue(formData, "display_hz"),
    battery_mah: numberValue(formData, "battery_mah"),
    charging_w: numberValue(formData, "charging_w"),
    main_camera_mp: numberValue(formData, "main_camera_mp"),
    ultrawide_camera_mp: numberValue(formData, "ultrawide_camera_mp"),
    telephoto_camera_mp: numberValue(formData, "telephoto_camera_mp"),
    selfie_camera_mp: numberValue(formData, "selfie_camera_mp"),
    video: textValue(formData, "video"),
    os: textValue(formData, "os"),
    antutu_score: numberValue(formData, "antutu_score"),
    antutu_version: textValue(formData, "antutu_version"),
    height_mm: numberValue(formData, "height_mm"),
    width_mm: numberValue(formData, "width_mm"),
    thickness_mm: numberValue(formData, "thickness_mm"),
    weight_g: numberValue(formData, "weight_g"),
    water_resistance: textValue(formData, "water_resistance"),
    protection: textValue(formData, "protection"),
    nfc: booleanValue(formData, "nfc"),
    five_g: booleanValue(formData, "five_g"),
    dual_sim: booleanValue(formData, "dual_sim"),
    esim: booleanValue(formData, "esim"),
    memory_card: booleanValue(formData, "memory_card"),
    stereo_speakers: booleanValue(formData, "stereo_speakers"),
    audio_jack: booleanValue(formData, "audio_jack"),
    usb_type: textValue(formData, "usb_type"),
    wifi: textValue(formData, "wifi"),
    bluetooth: textValue(formData, "bluetooth"),
    gps: textValue(formData, "gps"),
    network_bands: textValue(formData, "network_bands"),
    pros: textValue(formData, "pros"),
    cons: textValue(formData, "cons"),
    score_performance: clampScore(numberValue(formData, "score_performance")),
    score_camera: clampScore(numberValue(formData, "score_camera")),
    score_battery: clampScore(numberValue(formData, "score_battery")),
    score_display: clampScore(numberValue(formData, "score_display")),
    score_build: clampScore(numberValue(formData, "score_build")),
    score_value: clampScore(numberValue(formData, "score_value")),
    short_review: textValue(formData, "short_review"),
    recommended_for: textValue(formData, "recommended_for"),
    not_recommended_for: textValue(formData, "not_recommended_for"),
    alternatives: textValue(formData, "alternatives"),
    min_historical_price: numberValue(formData, "min_historical_price"),
    screen_size_in: numberValue(formData, "screen_size_in"),
    brightness_nits: numberValue(formData, "brightness_nits"),
    camera_sensor: textValue(formData, "camera_sensor"),
    has_ois: booleanValue(formData, "has_ois"),
    optical_zoom: textValue(formData, "optical_zoom"),
    update_promise: textValue(formData, "update_promise"),
    biometric_type: textValue(formData, "biometric_type"),
    wireless_charging_w: numberValue(formData, "wireless_charging_w"),
    reverse_charging: booleanValue(formData, "reverse_charging"),
    editorial_priority: numberValue(formData, "editorial_priority"),
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

  await admin.supabase.from("admin_audit_logs").insert({ action: phoneId ? "phone.update" : "phone.upsert", entity_type: "phone", entity_id: slug, metadata: { name } });

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

  await admin.supabase.from("admin_audit_logs").insert({ action: "phone.delete", entity_type: "phone", entity_id: phoneId, metadata: { slug } });

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
  const coupon = textValue(formData, "coupon");
  const cashback = textValue(formData, "cashback");

  if (!phoneId || !store || !price || !url || !isSafeUrl(url)) {
    return {
      ok: false,
      message: "Preencha loja, preco e link da oferta."
    };
  }

  const { error } = await admin.supabase.from("phone_prices").insert({
    phone_id: phoneId,
    store,
    price,
    url,
    coupon,
    cashback,
    in_stock: booleanValue(formData, "in_stock"),
    trusted_store: booleanValue(formData, "trusted_store")
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

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else current += char;
  }

  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, ""));
}

export async function importPhonesCsvAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin(formData);

  if (!admin.ok) return admin;

  const csv = textValue(formData, "csv");
  const rows = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (rows.length < 2) return { ok: false, message: "Cole um CSV com cabecalho e pelo menos uma linha." };

  const headers = parseCsvLine(rows[0]).map((header) => header.trim());
  const allowed = new Set([
    "name",
    "slug",
    "brand",
    "image_url",
    "price",
    "best_price",
    "affiliate_url",
    "chipset",
    "ram_gb",
    "storage_gb",
    "battery_mah",
    "main_camera_mp",
    "antutu_score",
    "score_value",
    "publication_status"
  ]);

  const payloads = rows.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row: Record<string, string | number> = {};
    headers.forEach((header, index) => {
      if (!allowed.has(header)) return;
      const value = cells[index] ?? "";
      row[header] = ["price", "best_price", "ram_gb", "storage_gb", "battery_mah", "main_camera_mp", "antutu_score", "score_value"].includes(header)
        ? Number(value.replace(",", ".")) || 0
        : value;
    });
    row.name = String(row.name ?? "").trim();
    row.slug = String(row.slug || slugify(String(row.name)));
    row.publication_status = String(row.publication_status || "draft");
    return row;
  }).filter((row) => row.name && row.slug);

  if (!payloads.length) return { ok: false, message: "Nenhum celular valido encontrado no CSV." };

  const { error } = await admin.supabase.from("phones").upsert(payloads, { onConflict: "slug" });

  if (error) return { ok: false, message: error.message };

  await admin.supabase.from("admin_audit_logs").insert({
    action: "phone.csv_import",
    entity_type: "phone",
    metadata: { count: payloads.length }
  });

  revalidatePhonePages();

  return { ok: true, message: `${payloads.length} celulares importados/atualizados.` };
}
