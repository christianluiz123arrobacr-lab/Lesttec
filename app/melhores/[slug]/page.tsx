import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PhoneCard } from "@/components/PhoneCard";
import { RankingList } from "@/components/RankingList";
import { getPhones } from "@/lib/phones";
import { finalScore } from "@/lib/scoring";

const configs: Record<string, { title: string; subtitle: string; filter: (phone: Awaited<ReturnType<typeof getPhones>>[number]) => boolean }> = {
  "celulares-ate-1000": { title: "Melhores celulares até R$ 1.000", subtitle: "Modelos baratos priorizando custo-benefício.", filter: (phone) => phone.bestPrice <= 1000 },
  "celulares-ate-1500": { title: "Melhores celulares até R$ 1.500", subtitle: "Boas escolhas para quem quer preço baixo sem abrir mão de recursos.", filter: (phone) => phone.bestPrice <= 1500 },
  "celulares-ate-2000": { title: "Melhores celulares até R$ 2.000", subtitle: "Faixa intermediária com equilíbrio entre desempenho, câmera e bateria.", filter: (phone) => phone.bestPrice <= 2000 },
  "celulares-com-nfc": { title: "Melhores celulares com NFC", subtitle: "Modelos para pagamentos por aproximação e conectividade completa.", filter: (phone) => phone.nfc },
  "celulares-5g-baratos": { title: "Celulares 5G baratos", subtitle: "Aparelhos com 5G ordenados por custo-benefício.", filter: (phone) => phone.fiveG },
  "celulares-para-jogos": { title: "Melhores celulares para jogos", subtitle: "Ranking priorizando desempenho, tela e bateria.", filter: (phone) => phone.scorePerformance >= 8 || phone.antutuScore >= 900000 },
  "melhor-camera": { title: "Celulares com melhor câmera", subtitle: "Ranking priorizando nota de câmera e recursos fotográficos.", filter: (phone) => phone.scoreCamera >= 8 }
};

export function generateStaticParams() {
  return Object.keys(configs).map((slug) => ({ slug }));
}

export default async function BestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = configs[slug];
  if (!config) notFound();
  const phones = (await getPhones()).filter(config.filter).sort((a, b) => b.scoreValue - a.scoreValue);
  const byScore = [...phones].sort((a, b) => finalScore(b) - finalScore(a));

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Ranking de compra</p>
            <h1>{config.title}</h1>
            <p className="muted">{config.subtitle}</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <div className="grid">
              {phones.map((phone) => <PhoneCard phone={phone} key={phone.id} />)}
            </div>
            {!phones.length ? <div className="notice">Nenhum celular encontrado para este ranking.</div> : null}
          </div>
        </section>
        <section className="section">
          <div className="shell ranking">
            <RankingList title="Top custo-benefício" phones={phones} mode="value" />
            <RankingList title="Top nota final" phones={byScore} mode="score" />
          </div>
        </section>
      </main>
    </>
  );
}
