import { Header } from "@/components/Header";
import { PhoneCard } from "@/components/PhoneCard";
import { RankingList } from "@/components/RankingList";
import { getPhones } from "@/lib/phones";
import { finalScore } from "@/lib/scoring";

export default async function PhonesPage() {
  const phones = await getPhones();
  const byScore = [...phones].sort((a, b) => finalScore(b) - finalScore(a));
  const byValue = [...phones].sort((a, b) => b.scoreValue - a.scoreValue);

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <h1>Celulares</h1>
            <p className="muted">Lista inicial para ranking, busca e comparacao.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <div className="grid">
              {phones.map((phone) => (
                <PhoneCard phone={phone} key={phone.id} />
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="shell ranking">
            <RankingList title="Top desempenho geral" phones={byScore} mode="score" />
            <RankingList title="Top custo-beneficio" phones={byValue} mode="value" />
          </div>
        </section>
      </main>
    </>
  );
}
