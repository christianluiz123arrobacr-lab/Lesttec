import type { Phone } from "./types";

export function finalScore(phone: Phone) {
  const score =
    phone.scorePerformance * 0.25 +
    phone.scoreCamera * 0.2 +
    phone.scoreBattery * 0.15 +
    phone.scoreDisplay * 0.15 +
    phone.scoreBuild * 0.1 +
    phone.scoreValue * 0.15;

  return Number(score.toFixed(1));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
