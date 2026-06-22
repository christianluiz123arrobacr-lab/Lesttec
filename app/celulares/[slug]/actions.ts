"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServiceClient } from "@/lib/supabase";

type ActionState = { ok: boolean; message: string };

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  const parsed = Number(textValue(formData, key).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function getClientOrError(): Promise<{ ok: true; supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>> } | ActionState> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { ok: false, message: "Supabase ainda nao esta configurado para salvar esse recurso." };
  return { ok: true, supabase };
}

export async function createPriceAlertAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const client = await getClientOrError();
  if (!("supabase" in client)) return client;

  const phoneId = textValue(formData, "phone_id");
  const contact = textValue(formData, "contact");
  const targetPrice = numberValue(formData, "target_price");

  if (!phoneId || !contact || targetPrice <= 0) {
    return { ok: false, message: "Informe contato e preco alvo validos." };
  }

  const { error } = await client.supabase.from("price_alerts").insert({
    phone_id: phoneId,
    contact,
    target_price: targetPrice,
    channel: "email_whatsapp"
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath("/celulares");
  return { ok: true, message: "Alerta criado. Vamos usar esse contato quando o preco baixar." };
}

export async function savePhoneListAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const client = await getClientOrError();
  if (!("supabase" in client)) return client;

  const phoneId = textValue(formData, "phone_id");
  const contact = textValue(formData, "contact") || "anonimo";
  const status = textValue(formData, "status");

  if (!phoneId || !["want", "have", "had"].includes(status)) {
    return { ok: false, message: "Escolha uma acao valida para esse celular." };
  }

  const { error } = await client.supabase.from("user_phone_lists").upsert(
    { phone_id: phoneId, contact, status },
    { onConflict: "phone_id,contact,status" }
  );

  if (error) return { ok: false, message: error.message };
  revalidatePath("/celulares");
  return { ok: true, message: "Preferencia registrada." };
}

export async function createReviewAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const client = await getClientOrError();
  if (!("supabase" in client)) return client;

  const phoneId = textValue(formData, "phone_id");
  const rating = numberValue(formData, "rating");
  const comment = textValue(formData, "comment");

  if (!phoneId || rating < 1 || rating > 10 || comment.length < 10) {
    return { ok: false, message: "Envie nota de 1 a 10 e comentario com pelo menos 10 caracteres." };
  }

  const { error } = await client.supabase.from("phone_reviews").insert({
    phone_id: phoneId,
    contact: textValue(formData, "contact") || "anonimo",
    rating,
    owned_status: textValue(formData, "owned_status") || "unknown",
    pros: textValue(formData, "pros"),
    cons: textValue(formData, "cons"),
    comment
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/celulares/${textValue(formData, "phone_slug")}`);
  return { ok: true, message: "Opiniao enviada para aparecer na pagina do aparelho." };
}
