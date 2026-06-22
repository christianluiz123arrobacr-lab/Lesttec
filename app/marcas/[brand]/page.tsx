import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PhoneCard } from "@/components/PhoneCard";
import { RankingList } from "@/components/RankingList";
import { getPhones } from "@/lib/phones";
import { finalScore } from "@/lib/scoring";

function normalize(value: string) {
  return decodeURIComponent(value).toLowerCase().replace(/-/g, " ");
}

export async function generateStaticParams() {
  const phones = await getPhones();
  return [...new Set(phones.map((phone) => phone.brand.toLowerCase().replace(/\s+/g, "-")))].map((brand) => ({ brand }));
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  const phones = await getPhones();
  const selected = normalize(brand);
  const brandPhones = phones.filter((phone) => phone.brand.toLowerCase() === selected);
  if (!brandPhones.length) notFound();
  const label = brandPhones[0].brand;
  const byValue = [...brandPhones].sort((a, b) => b.scoreValue - a.scoreValue);
  const byScore = [...brandPhones].sort((a, b) => finalScore(b) - finalScore(a));

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Marca</p>
            <h1>Celulares {label}</h1>
            <p className="muted">Melhores modelos, custo-benefício e ofertas cadastradas da marca.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <div className="grid">
              {byValue.map((phone) => <PhoneCard phone={phone} key={phone.id} />)}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="shell ranking">
            <RankingList title={`Melhor custo-benefício ${label}`} phones={byValue} mode="value" />
            <RankingList title={`Maior nota ${label}`} phones={byScore} mode="score" />
          </div>
        </section>
      </main>
    </>
  );
}
