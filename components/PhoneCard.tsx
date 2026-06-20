import Link from "next/link";
import type { Phone } from "@/lib/types";
import { finalScore, formatCurrency } from "@/lib/scoring";

export function PhoneCard({ phone }: { phone: Phone }) {
  return (
    <Link href={`/celulares/${phone.slug}`} className="phone-card">
      <img className="phone-card-image" src={phone.imageUrl} alt={phone.name} />
      <div>
        <h3>{phone.name}</h3>
        <p className="muted">{phone.brand}</p>
      </div>
      <div className="meta">
        <span className="badge score-badge">Nota {finalScore(phone)}</span>
        <span className="badge">{phone.ramGb} GB RAM</span>
        <span className="badge">{phone.storageGb} GB</span>
      </div>
      <strong className="price">{formatCurrency(phone.bestPrice)}</strong>
    </Link>
  );
}
