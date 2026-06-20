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

export async function createPhoneAction(_previousState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = getSupabaseServiceClient();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase ainda nao esta configurado. Preencha .env.local para salvar no banco."
    };
  }

  if (!adminPassword || textValue(formData, "admin_password") !== adminPassword) {
    return {
      ok: false,
      message: "Senha admin incorreta ou ADMIN_PASSWORD nao configurada."
    };
  }

  const name = textValue(formData, "name");
  const slug = textValue(formData, "slug");

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

  const { error } = await supabase.from("phones").upsert(payload, { onConflict: "slug" });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  revalidatePath("/");
  revalidatePath("/celulares");
  revalidatePath(`/celulares/${slug}`);

  return {
    ok: true,
    message: "Celular salvo com sucesso."
  };
}
