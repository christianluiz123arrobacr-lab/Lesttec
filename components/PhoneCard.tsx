import Link from "next/link";
import type { Phone } from "@/lib/types";
import { finalScore, formatCurrency } from "@/lib/scoring";

export function PhoneCard({ phone }: { phone: Phone }) {
  const score = finalScore(phone);
  const savings = phone.price > phone.bestPrice ? Math.round(((phone.price - phone.bestPrice) / phone.price) * 100) : 0;

  return (
    <Link href={`/celulares/${phone.slug}`} className="phone-card">
      <div className="phone-card-media">
        <span className="phone-card-ribbon">{phone.fiveG ? "5G" : phone.launchStatus === "new" ? "Novo" : "Oferta"}</span>
        <img className="phone-card-image" src={phone.imageUrl} alt={phone.name} />
        <span className="phone-card-score">{score}</span>
      </div>

      <div className="phone-card-body">
        <div>
          <p className="phone-card-brand">{phone.brand}</p>
          <h3>{phone.name}</h3>
          <p className="phone-card-verdict">{phone.shortReview || phone.verdict || `${phone.chipset} com ${phone.ramGb} GB de RAM`}</p>
        </div>

        <div className="phone-card-specs">
          <span>{phone.ramGb} GB RAM</span>
          <span>{phone.storageGb} GB</span>
          <span>{phone.displayHz} Hz</span>
          <span>{phone.batteryMah} mAh</span>
        </div>

        <div className="phone-card-scores">
          <span><strong>{phone.scoreCamera || "-"}</strong>Câmera</span>
          <span><strong>{phone.scoreBattery || "-"}</strong>Bateria</span>
          <span><strong>{phone.scorePerformance || "-"}</strong>Perf.</span>
        </div>

        <div className="phone-card-footer">
          <span>
            <small>Melhor preço</small>
            <strong className="price">{formatCurrency(phone.bestPrice)}</strong>
          </span>
          {savings ? <em>{savings}% abaixo do preço médio</em> : <em>Comparar ofertas</em>}
        </div>
      </div>
    </Link>
  );
}
