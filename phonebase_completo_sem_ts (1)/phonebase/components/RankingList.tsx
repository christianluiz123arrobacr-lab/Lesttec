import Link from "next/link";
import type { Phone } from "@/lib/types";
import { finalScore, formatCurrency } from "@/lib/scoring";

type RankingListProps = {
  title: string;
  phones: Phone[];
  mode: "score" | "value" | "price";
};

export function RankingList({ title, phones, mode }: RankingListProps) {
  return (
    <div className="rank-list">
      <h3>{title}</h3>
      {phones.map((phone, index) => (
        <Link className="rank-item" href={`/celulares/${phone.slug}`} key={phone.id}>
          <strong>{index + 1}</strong>
          <img className="rank-thumb" src={phone.imageUrl} alt="" />
          <span>
            <strong>{phone.name}</strong>
            <br />
            <span className="muted">
              {mode === "price" ? "Melhor preco" : mode === "value" ? "Custo-beneficio" : "Nota final"}
            </span>
          </span>
          <span className="price">
            {mode === "price" ? formatCurrency(phone.bestPrice) : mode === "value" ? phone.scoreValue.toFixed(1) : finalScore(phone)}
          </span>
        </Link>
      ))}
    </div>
  );
}
