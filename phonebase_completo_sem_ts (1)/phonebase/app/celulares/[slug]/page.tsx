import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PhoneSizeCompare } from "@/components/PhoneSizeCompare";
import { ScoreRows } from "@/components/ScoreRows";
import { getPhoneBySlug, getPhones, getPricesByPhoneId } from "@/lib/phones";
import { finalScore, formatCurrency, formatNumber } from "@/lib/scoring";

export async function generateStaticParams() {
  const phones = await getPhones();
  return phones.map((phone) => ({ slug: phone.slug }));
}

export default async function PhoneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phone = await getPhoneBySlug(slug);
  if (!phone) notFound();

  const phones = await getPhones();
  const prices = await getPricesByPhoneId(phone.id);
  const similar = phones.filter((item) => item.id !== phone.id).slice(0, 2);

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell detail-grid">
            <img className="product-shot" src={phone.imageUrl} alt={phone.name} />
            <div>
              <p className="eyebrow">{phone.brand}</p>
              <h1>{phone.name}</h1>
              <p>{phone.verdict}</p>
              <div className="spec-grid">
                <div className="spec-tile">
                  <strong>{phone.ramGb} GB</strong>
                  RAM
                </div>
                <div className="spec-tile">
                  <strong>{phone.storageGb} GB</strong>
                  Armazenamento
                </div>
                <div className="spec-tile">
                  <strong>{phone.batteryMah} mAh</strong>
                  Bateria
                </div>
                <div className="spec-tile">
                  <strong>{phone.displayHz} Hz</strong>
                  Tela
                </div>
                <div className="spec-tile">
                  <strong>{formatNumber(phone.antutuScore)}</strong>
                  AnTuTu {phone.antutuVersion}
                </div>
                <div className="spec-tile">
                  <strong>{finalScore(phone)}</strong>
                  Nota final
                </div>
              </div>
            </div>
            <aside className="buy-box">
              <span className="muted">Melhor preco</span>
              <h2>{formatCurrency(phone.bestPrice)}</h2>
              <p className="muted">Preco medio cadastrado: {formatCurrency(phone.price)}</p>
              <a className="button" href={phone.affiliateUrl}>
                Ver oferta
              </a>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="shell ranking">
            <div className="rank-list">
              <h3>Pontuacao</h3>
              <ScoreRows
                items={[
                  { label: "Desempenho", value: phone.scorePerformance },
                  { label: "Camera", value: phone.scoreCamera },
                  { label: "Bateria", value: phone.scoreBattery },
                  { label: "Tela", value: phone.scoreDisplay },
                  { label: "Construcao", value: phone.scoreBuild },
                  { label: "Valor", value: phone.scoreValue }
                ]}
              />
            </div>
            <div className="rank-list">
              <h3>Ofertas cadastradas</h3>
              {prices.map((price) => (
                <a className="rank-item" href={price.url} key={price.id}>
                  <strong>{price.store}</strong>
                  <span />
                  <span className="muted">Atualizado em {price.updatedAt}</span>
                  <strong className="price">{formatCurrency(price.price)}</strong>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="section-header">
              <div>
                <h2>Tamanho visual</h2>
                <p className="section-subtitle">Comparacao proporcional usando altura e largura em milimetros.</p>
              </div>
              <Link className="button ghost" href="/comparar">
                Comparar mais
              </Link>
            </div>
            <PhoneSizeCompare phones={[phone, ...similar]} />
          </div>
        </section>

        <section className="section">
          <div className="shell table-card">
            <table className="data-table">
              <tbody>
                <tr>
                  <th>Sistema operacional</th>
                  <td>{phone.os}</td>
                </tr>
                <tr>
                  <th>Processador</th>
                  <td>{phone.chipset}</td>
                </tr>
                <tr>
                  <th>Tela</th>
                  <td>
                    {phone.display}, {phone.displayHz} Hz
                  </td>
                </tr>
                <tr>
                  <th>Camera principal</th>
                  <td>
                    {phone.mainCameraMp} MP, video {phone.video}
                  </td>
                </tr>
                <tr>
                  <th>Dimensoes</th>
                  <td>
                    {phone.heightMm} x {phone.widthMm} x {phone.thicknessMm} mm
                  </td>
                </tr>
                <tr>
                  <th>Peso</th>
                  <td>{phone.weightG} g</td>
                </tr>
                <tr>
                  <th>Resistencia</th>
                  <td>{phone.waterResistance}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
