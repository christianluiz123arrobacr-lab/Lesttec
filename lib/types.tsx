export type Phone = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  launchStatus: "available" | "rumor" | "new";
  releaseDate: string;
  price: number;
  bestPrice: number;
  affiliateUrl: string;
  chipset: string;
  ramGb: number;
  storageGb: number;
  display: string;
  displayHz: number;
  batteryMah: number;
  chargingW: number;
  mainCameraMp: number;
  video: string;
  os: string;
  antutuScore: number;
  antutuVersion: string;
  heightMm: number;
  widthMm: number;
  thicknessMm: number;
  weightG: number;
  waterResistance: string;
  scorePerformance: number;
  scoreCamera: number;
  scoreBattery: number;
  scoreDisplay: number;
  scoreBuild: number;
  scoreValue: number;
  verdict: string;
};

export type PhonePrice = {
  id: string;
  phoneId: string;
  store: string;
  price: number;
  url: string;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  role: "user" | "admin";
  fullName: string;
  phone: string;
  city: string;
  state: string;
  budgetMin: number;
  budgetMax: number;
  preferredBrands: string[];
  wantsOffers: boolean;
};
