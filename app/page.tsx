import Link from "next/link";
import { Header } from "@/components/Header";
import { AdminOnlyLink } from "@/components/AdminOnlyLink";
import { PhoneCard } from "@/components/PhoneCard";
import { RankingList } from "@/components/RankingList";
import { ScoreRows } from "@/components/ScoreRows";
import { getPhones } from "@/lib/phones";
import { finalScore } from "@/lib/scoring";

export default async function HomePage() {
  const phones = await getPhones();
  const byScore = [...phones].sort((a, b) => finalScore(b) - finalScore(a));
  const byValue = [...phones].sort((a, b) => b.scoreValue - a.scoreValue);
  const byPrice = [...phones].sort((a, b) => a.bestPrice - b.bestPrice);
  const featured = byValue[0];

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div>
              <div className="eyebrow">Comparador brasileiro de celulares</div>
              <h1>Descubra qual celular realmente vale comprar.</h1>
              <p>
                Ficha tecnica, precos, AnTuTu, tamanho visual e uma nota propria para parar de escolher celular no escuro.
              </p>
              <div className="hero-actions">
                <Link className="button secondary" href="/comparar">
                  Comparar celulares
                </Link>
                <Link className="button" href="/celulares">
                  Ver rankings
                </Link>
              </div>
            </div>
            <div className="hero-card">
              <h2>{featured.name}</h2>
              <p className="muted">Nota Vale a Pena: {finalScore(featured)}</p>
              <ScoreRows
                items={[
                  { label: "Desempenho", value: featured.scorePerformance },
                  { label: "Camera", value: featured.scoreCamera },
                  { label: "Bateria", value: featured.scoreBattery },
                  { label: "Tela", value: featured.scoreDisplay },
                  { label: "Valor", value: featured.scoreValue }
                ]}
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="section-header">
              <div>
                <h2>Melhores escolhas agora</h2>
                <p className="section-subtitle">Base inicial com dados mockados, pronta para receber Supabase.</p>
              </div>
              <AdminOnlyLink className="button ghost" href="/admin" label="Cadastrar celular" />
            </div>
            <div className="grid">
              {byValue.map((phone) => (
                <PhoneCard phone={phone} key={phone.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell ranking">
            <RankingList title="Melhor Nota Vale a Pena" phones={byValue} mode="value" />
            <RankingList title="Menor preco cadastrado" phones={byPrice} mode="price" />
          </div>
        </section>

        <section className="section">
          <div className="shell ranking">
            <RankingList title="Maior nota final" phones={byScore} mode="score" />
            <div className="rank-list">
              <h3>O que ja existe na base</h3>
              <p className="muted">
                Cadastro admin, comparador, ficha tecnica, ofertas, pontuacao por categoria e tamanho visual proporcional.
              </p>
              <Link className="button" href="/comparar">
                Testar comparador
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
