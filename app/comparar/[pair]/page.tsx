import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getPhoneBySlug, getPhones } from "@/lib/phones";
import { finalScore, formatCurrency, formatNumber } from "@/lib/scoring";

const rows = [
  ["Nota final", (v: any) => finalScore(v)],
  ["Preço", (v: any) => formatCurrency(v.bestPrice)],
  ["Processador", (v: any) => v.chipset],
  ["AnTuTu", (v: any) => formatNumber(v.antutuScore)],
  ["Tela", (v: any) => `${v.screenSizeIn || "-"} pol. • ${v.displayHz} Hz`],
  ["Câmera", (v: any) => `${v.mainCameraMp} MP${v.hasOis ? " • OIS" : ""}`],
  ["Bateria", (v: any) => `${v.batteryMah} mAh • ${v.chargingW} W`],
  ["Peso", (v: any) => `${v.weightG} g`]
] as const;

function winnerLabel(aValue: number, bValue: number, label: string) {
  if (aValue === bValue) return `Empate em ${label}`;
  return aValue > bValue ? `Melhor em ${label}: primeiro modelo` : `Melhor em ${label}: segundo modelo`;
}

export async function generateStaticParams() {
  const phones = (await getPhones()).slice(0, 6);
  return phones.flatMap((phone, index) => phones.slice(index + 1).map((other) => ({ pair: `${phone.slug}-vs-${other.slug}` })));
}

export default async function AutoComparePage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const [firstSlug, secondSlug] = pair.split("-vs-");
  const first = await getPhoneBySlug(firstSlug);
  const second = await getPhoneBySlug(secondSlug);
  if (!first || !second) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Comparativo automático</p>
            <h1>{first.name} vs {second.name}</h1>
            <p className="muted">Resumo direto com vencedor por nota, preço, bateria, câmera e desempenho.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell comparison-winner-grid">
            <div className="info-card"><h3>{winnerLabel(finalScore(first), finalScore(second), "nota")}</h3><p>{first.name}: {finalScore(first)} • {second.name}: {finalScore(second)}</p></div>
            <div className="info-card"><h3>Melhor preço: {first.bestPrice <= second.bestPrice ? first.name : second.name}</h3><p>{formatCurrency(first.bestPrice)} vs {formatCurrency(second.bestPrice)}</p></div>
            <div className="info-card"><h3>{winnerLabel(first.antutuScore, second.antutuScore, "desempenho")}</h3><p>{formatNumber(first.antutuScore)} vs {formatNumber(second.antutuScore)}</p></div>
            <div className="info-card"><h3>{winnerLabel(first.batteryMah, second.batteryMah, "bateria")}</h3><p>{first.batteryMah} mAh vs {second.batteryMah} mAh</p></div>
          </div>
        </section>
        <section className="section">
          <div className="shell table-card">
            <table className="data-table comparison-table">
              <thead><tr><th>Item</th><th>{first.name}</th><th>{second.name}</th></tr></thead>
              <tbody>{rows.map(([label, render]) => <tr key={label}><th>{label}</th><td>{render(first)}</td><td>{render(second)}</td></tr>)}</tbody>
            </table>
            <Link className="button ghost" href="/comparar">Comparar outros modelos</Link>
          </div>
        </section>
      </main>
    </>
  );
}
