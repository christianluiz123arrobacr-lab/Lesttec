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
  const premiumPicks = [
    { label: "Até R$ 1.500", href: "/celulares?maxPrice=1500" },
    { label: "Até R$ 2.000", href: "/celulares?maxPrice=2000" },
    { label: "Com NFC", href: "/celulares?nfc=on" },
    { label: "5G", href: "/celulares?fiveG=on" }
  ];
  const portalLinks = [
    { title: "Ofertas do dia", text: "Compare lojas, cupom e cashback.", href: "/ofertas" },
    { title: "Rankings por orçamento", text: "Até R$ 1000, R$ 1500 e R$ 2000.", href: "/melhores/celulares-ate-1500" },
    { title: "Verificar frequências", text: "Bandas 4G/5G para importados.", href: "/frequencias" },
    { title: "Como avaliamos", text: "Entenda a nota de compra.", href: "/como-avaliamos" }
  ];

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
              <div className="hero-proof">
                <span>Rankings por custo-beneficio</span>
                <span>Ofertas com menor preco</span>
                <span>Ficha tecnica completa</span>
              </div>
              <div className="hero-actions">
                <Link className="button secondary" href="/comparar">
                  Comparar celulares
                </Link>
                <Link className="button" href="/celulares">
                  Ver rankings
                </Link>
              </div>
            </div>
            <div className="hero-product">
              <div className="hero-phone-stage">
                <img src={featured.imageUrl} alt={featured.name} />
                <span className="hero-floating-badge">Melhor escolha agora</span>
              </div>
              <div className="hero-card">
                <div className="hero-card-top">
                  <span className="badge score-badge">Nota {finalScore(featured)}</span>
                  <span className="badge">Atualizado</span>
                </div>
                <h2>{featured.name}</h2>
                <p className="muted">Boa compra quando aparece perto de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(featured.bestPrice)}.</p>
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

        <section className="section editorial-strip">
          <div className="shell">
            <div className="section-header">
              <div>
                <h2>Escolha pelo seu objetivo</h2>
                <p className="section-subtitle">Atalhos rapidos para transformar a home em uma vitrine editorial.</p>
              </div>
            </div>
            <div className="quick-grid">
              {premiumPicks.map((pick) => (
                <Link className="quick-card" href={pick.href} key={pick.href}>
                  <span>{pick.label}</span>
                  <strong>Ver melhores modelos</strong>
                </Link>
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

        <section className="section editorial-strip">
          <div className="shell">
            <div className="section-header">
              <div>
                <h2>Ferramentas de compra</h2>
                <p className="section-subtitle">Recursos inspirados em portais completos para comparar, economizar e escolher melhor.</p>
              </div>
            </div>
            <div className="info-grid">
              {portalLinks.map((item) => (
                <Link className="info-card" href={item.href} key={item.href}>
                  <span className="badge">Novo</span>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.text}</p>
                </Link>
              ))}
            </div>
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
