import { phones as mockPhones, prices as mockPrices } from "./mock-data";
import { getSupabaseBrowserClient } from "./supabase";
import type { Phone, PhonePrice } from "./types";

export function mapPhone(row: Record<string, unknown>): Phone {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    brand: String(row.brand),
    imageUrl: String(row.image_url),
    launchStatus: row.launch_status as Phone["launchStatus"],
    releaseDate: String(row.release_date),
    price: Number(row.price),
    bestPrice: Number(row.best_price),
    affiliateUrl: String(row.affiliate_url),
    chipset: String(row.chipset),
    ramGb: Number(row.ram_gb),
    storageGb: Number(row.storage_gb),
    display: String(row.display),
    displayHz: Number(row.display_hz),
    batteryMah: Number(row.battery_mah),
    chargingW: Number(row.charging_w),
    mainCameraMp: Number(row.main_camera_mp),
    video: String(row.video),
    os: String(row.os),
    antutuScore: Number(row.antutu_score),
    antutuVersion: String(row.antutu_version),
    heightMm: Number(row.height_mm),
    widthMm: Number(row.width_mm),
    thicknessMm: Number(row.thickness_mm),
    weightG: Number(row.weight_g),
    waterResistance: String(row.water_resistance),
    scorePerformance: Number(row.score_performance),
    scoreCamera: Number(row.score_camera),
    scoreBattery: Number(row.score_battery),
    scoreDisplay: Number(row.score_display),
    scoreBuild: Number(row.score_build),
    scoreValue: Number(row.score_value),
    verdict: String(row.verdict)
  };
}

export function mapPrice(row: Record<string, unknown>): PhonePrice {
  return {
    id: String(row.id),
    phoneId: String(row.phone_id),
    store: String(row.store),
    price: Number(row.price),
    url: String(row.url),
    updatedAt: String(row.updated_at)
  };
}

export async function getPhones(): Promise<Phone[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockPhones;

  const { data, error } = await supabase.from("phones").select("*").order("score_value", { ascending: false });
  if (error || !data?.length) return mockPhones;

  return data.map(mapPhone);
}

export async function getPhoneBySlug(slug: string): Promise<Phone | null> {
  const phones = await getPhones();
  return phones.find((phone) => phone.slug === slug) ?? null;
}

export async function getPricesByPhoneId(phoneId: string): Promise<PhonePrice[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockPrices.filter((price) => price.phoneId === phoneId);

  const { data, error } = await supabase
    .from("phone_prices")
    .select("*")
    .eq("phone_id", phoneId)
    .order("price", { ascending: true });

  if (error || !data?.length) return mockPrices.filter((price) => price.phoneId === phoneId);

  return data.map(mapPrice);
}
