import { phones as mockPhones, prices as mockPrices } from "./mock-data";
import { getSupabaseBrowserClient } from "./supabase";
import type { Phone, PhonePrice, PhoneReview, PriceHistory } from "./types";

function stringValue(row: Record<string, unknown>, key: string) {
  const value = row[key];
  return value === null || value === undefined ? "" : String(value);
}

function numberValue(row: Record<string, unknown>, key: string) {
  const value = Number(row[key] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function booleanValue(row: Record<string, unknown>, key: string) {
  return row[key] === true;
}

export function mapPhone(row: Record<string, unknown>): Phone {
  return {
    id: stringValue(row, "id"),
    slug: stringValue(row, "slug"),
    name: stringValue(row, "name"),
    brand: stringValue(row, "brand"),
    imageUrl: stringValue(row, "image_url"),
    launchStatus: (stringValue(row, "launch_status") || "available") as Phone["launchStatus"],
    publicationStatus: (stringValue(row, "publication_status") || "published") as Phone["publicationStatus"],
    releaseDate: stringValue(row, "release_date"),
    price: numberValue(row, "price"),
    bestPrice: numberValue(row, "best_price"),
    affiliateUrl: stringValue(row, "affiliate_url"),
    chipset: stringValue(row, "chipset"),
    gpu: stringValue(row, "gpu"),
    ramGb: numberValue(row, "ram_gb"),
    ramType: stringValue(row, "ram_type"),
    storageGb: numberValue(row, "storage_gb"),
    storageType: stringValue(row, "storage_type"),
    display: stringValue(row, "display"),
    screenType: stringValue(row, "screen_type"),
    screenResolution: stringValue(row, "screen_resolution"),
    displayHz: numberValue(row, "display_hz"),
    batteryMah: numberValue(row, "battery_mah"),
    chargingW: numberValue(row, "charging_w"),
    mainCameraMp: numberValue(row, "main_camera_mp"),
    ultrawideCameraMp: numberValue(row, "ultrawide_camera_mp"),
    telephotoCameraMp: numberValue(row, "telephoto_camera_mp"),
    selfieCameraMp: numberValue(row, "selfie_camera_mp"),
    video: stringValue(row, "video"),
    os: stringValue(row, "os"),
    antutuScore: numberValue(row, "antutu_score"),
    antutuVersion: stringValue(row, "antutu_version"),
    heightMm: numberValue(row, "height_mm"),
    widthMm: numberValue(row, "width_mm"),
    thicknessMm: numberValue(row, "thickness_mm"),
    weightG: numberValue(row, "weight_g"),
    waterResistance: stringValue(row, "water_resistance"),
    protection: stringValue(row, "protection"),
    nfc: booleanValue(row, "nfc"),
    fiveG: booleanValue(row, "five_g"),
    dualSim: booleanValue(row, "dual_sim"),
    esim: booleanValue(row, "esim"),
    memoryCard: booleanValue(row, "memory_card"),
    stereoSpeakers: booleanValue(row, "stereo_speakers"),
    audioJack: booleanValue(row, "audio_jack"),
    usbType: stringValue(row, "usb_type"),
    wifi: stringValue(row, "wifi"),
    bluetooth: stringValue(row, "bluetooth"),
    gps: stringValue(row, "gps"),
    networkBands: stringValue(row, "network_bands"),
    pros: stringValue(row, "pros"),
    cons: stringValue(row, "cons"),
    scorePerformance: numberValue(row, "score_performance"),
    scoreCamera: numberValue(row, "score_camera"),
    scoreBattery: numberValue(row, "score_battery"),
    scoreDisplay: numberValue(row, "score_display"),
    scoreBuild: numberValue(row, "score_build"),
    scoreValue: numberValue(row, "score_value"),
    shortReview: stringValue(row, "short_review"),
    recommendedFor: stringValue(row, "recommended_for"),
    notRecommendedFor: stringValue(row, "not_recommended_for"),
    alternatives: stringValue(row, "alternatives"),
    minHistoricalPrice: numberValue(row, "min_historical_price"),
    lastPriceCheckedAt: stringValue(row, "last_price_checked_at"),
    screenSizeIn: numberValue(row, "screen_size_in"),
    brightnessNits: numberValue(row, "brightness_nits"),
    cameraSensor: stringValue(row, "camera_sensor"),
    hasOis: booleanValue(row, "has_ois"),
    opticalZoom: stringValue(row, "optical_zoom"),
    updatePromise: stringValue(row, "update_promise"),
    biometricType: stringValue(row, "biometric_type"),
    wirelessChargingW: numberValue(row, "wireless_charging_w"),
    reverseCharging: booleanValue(row, "reverse_charging"),
    editorialPriority: numberValue(row, "editorial_priority"),
    verdict: stringValue(row, "verdict")
  };
}

export function mapPrice(row: Record<string, unknown>): PhonePrice {
  return {
    id: String(row.id),
    phoneId: String(row.phone_id),
    store: String(row.store),
    price: Number(row.price),
    url: String(row.url),
    updatedAt: String(row.updated_at),
    coupon: stringValue(row, "coupon"),
    cashback: stringValue(row, "cashback"),
    inStock: row.in_stock !== false,
    trustedStore: row.trusted_store !== false
  };
}

export async function getPhones(): Promise<Phone[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return mockPhones;

  const { data, error } = await supabase.from("phones").select("*").eq("publication_status", "published").order("score_value", { ascending: false });
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


export function mapReview(row: Record<string, unknown>): PhoneReview {
  return {
    id: stringValue(row, "id"),
    phoneId: stringValue(row, "phone_id"),
    rating: numberValue(row, "rating"),
    contact: stringValue(row, "contact"),
    ownedStatus: stringValue(row, "owned_status"),
    pros: stringValue(row, "pros"),
    cons: stringValue(row, "cons"),
    comment: stringValue(row, "comment"),
    createdAt: stringValue(row, "created_at")
  };
}

export function mapPriceHistory(row: Record<string, unknown>): PriceHistory {
  return {
    id: stringValue(row, "id"),
    phoneId: stringValue(row, "phone_id"),
    store: stringValue(row, "store"),
    price: numberValue(row, "price"),
    url: stringValue(row, "url"),
    capturedAt: stringValue(row, "captured_at")
  };
}

export async function getReviewsByPhoneId(phoneId: string): Promise<PhoneReview[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("phone_reviews")
    .select("*")
    .eq("phone_id", phoneId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data?.length) return [];
  return data.map(mapReview);
}

export async function getPriceHistoryByPhoneId(phoneId: string): Promise<PriceHistory[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("phone_id", phoneId)
    .order("captured_at", { ascending: false })
    .limit(8);

  if (error || !data?.length) return [];
  return data.map(mapPriceHistory);
}
