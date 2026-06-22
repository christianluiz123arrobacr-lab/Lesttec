import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PhoneEngagementPanel } from "@/components/PhoneEngagementPanel";
import { PhoneSizeCompare } from "@/components/PhoneSizeCompare";
import { ScoreRows } from "@/components/ScoreRows";
import { getPhoneBySlug, getPhones, getPriceHistoryByPhoneId, getPricesByPhoneId, getReviewsByPhoneId } from "@/lib/phones";
import { finalScore, formatCurrency, formatNumber } from "@/lib/scoring";

function yesNo(value: boolean) {
  return value ? "Sim" : "Nao";
}

function textOrDash(value: string) {
  return value.trim() ? value : "-";
}

function listLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const phone = await getPhoneBySlug(slug);
  if (!phone) return { title: "Celular não encontrado" };
  return {
    title: `${phone.name}: ficha técnica, preço e ofertas`,
    description: phone.shortReview || phone.verdict || `Veja ficha técnica, preço, ofertas e nota do ${phone.name}.`,
    openGraph: { title: phone.name, description: phone.shortReview || phone.verdict, images: phone.imageUrl ? [phone.imageUrl] : [] }
  };
}

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
  const reviews = await getReviewsByPhoneId(phone.id);
  const priceHistory = await getPriceHistoryByPhoneId(phone.id);
  const similar = phones.filter((item) => item.id !== phone.id).slice(0, 2);
  const pros = listLines(phone.pros);
  const cons = listLines(phone.cons);

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero premium-detail-hero">
          <div className="shell detail-grid">
            <div className="product-stage">
              <span className="product-glow" />
              <img className="product-shot" src={phone.imageUrl} alt={phone.name} />
              <div className="hero-score-ring">
                <strong>{finalScore(phone)}</strong>
                <span>nota</span>
              </div>
            </div>
            <div className="detail-copy">
              <p className="eyebrow">{phone.brand}</p>
              <h1>{phone.name}</h1>
              <p>{phone.verdict}</p>
              <div className="hero-badges">
                {phone.fiveG ? <span>5G</span> : null}
                {phone.nfc ? <span>NFC</span> : null}
                {phone.hasOis ? <span>OIS</span> : null}
                {phone.waterResistance ? <span>{phone.waterResistance}</span> : null}
                {phone.wirelessChargingW ? <span>Qi {phone.wirelessChargingW} W</span> : null}
              </div>
              <div className="spec-grid">
                <div className="spec-tile">
                  <strong>{phone.ramGb} GB</strong>
                  RAM {phone.ramType}
                </div>
                <div className="spec-tile">
                  <strong>{phone.storageGb} GB</strong>
                  {phone.storageType || "Armazenamento"}
                </div>
                <div className="spec-tile">
                  <strong>{phone.batteryMah} mAh</strong>
                  Bateria
                </div>
                <div className="spec-tile">
                  <strong>{phone.displayHz} Hz</strong>
                  {phone.screenType || "Tela"}
                </div>
                <div className="spec-tile">
                  <strong>{phone.mainCameraMp} MP</strong>
                  Camera principal
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
            <aside className="buy-box premium-buy-box">
              <span className="deal-label">Melhor oferta encontrada</span>
              <h2>{formatCurrency(phone.bestPrice)}</h2>
              <p className="muted">Preco medio cadastrado: {formatCurrency(phone.price)}</p>
              <div className="buy-box-mini">
                <span>{prices.length} lojas</span>
                <span>{phone.minHistoricalPrice ? `Histórico ${formatCurrency(phone.minHistoricalPrice)}` : "Histórico em breve"}</span>
              </div>
              <a className="button" href={prices[0] ? `/oferta/${prices[0].id}` : phone.affiliateUrl}>
                Ver oferta
              </a>
              <a className="button ghost" href="#engajamento">
                Criar alerta
              </a>
            </aside>
          </div>
        </section>

        <section className="phone-action-section">
          <div className="shell phone-action-bar">
            <a href="#resumo">Resumo</a>
            <a href="#ofertas">Ofertas</a>
            <a href="#ficha">Ficha técnica</a>
            <a href="#historico">Histórico</a>
            <a href="#opinioes">Opiniões</a>
            <a href={`/comparar/${phone.slug}-vs-${similar[0]?.slug || phone.slug}`}>Comparar</a>
            <a href="#engajamento">Quero comprar</a>
          </div>
        </section>

        <section className="section" id="resumo">
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
            <div className="rank-list" id="ofertas">
              <h3>Ofertas cadastradas</h3>
              {prices.length ? (
                prices.map((price) => (
                  <a className="offer-card" href={`/oferta/${price.id}`} key={price.id}>
                    <span className="store-logo">{price.store.slice(0, 1).toUpperCase()}</span>
                    <span>
                      <strong>{price.store}</strong>
                      <small>
                        {price.inStock ? "Em estoque" : "Sem estoque"}
                        {price.coupon ? ` • Cupom ${price.coupon}` : ""}
                        {price.cashback ? ` • Cashback ${price.cashback}` : ""}
                      </small>
                      <small>{price.trustedStore ? "Loja confiável" : "Verifique a loja"} • Atualizado em {price.updatedAt ? new Date(price.updatedAt).toLocaleDateString("pt-BR") : "breve"}</small>
                    </span>
                    <strong className="price">{formatCurrency(price.price)}</strong>
                    {price.coupon ? <span className="coupon-pill">{price.coupon}</span> : null}
                    <span className="button offer-button">Ir para loja</span>
                  </a>
                ))
              ) : (
                <p className="muted">Nenhuma oferta cadastrada ainda.</p>
              )}
              <p className="affiliate-note">Podemos receber comissao pelos links. Isso nao altera o preco para voce.</p>
            </div>
          </div>
        </section>

        {(pros.length || cons.length) ? (
          <section className="section">
            <div className="shell ranking">
              <div className="rank-list">
                <h3>Pontos positivos</h3>
                {pros.length ? (
                  <ul className="clean-list">
                    {pros.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Ainda nao cadastrado.</p>
                )}
              </div>
              <div className="rank-list">
                <h3>Pontos negativos</h3>
                {cons.length ? (
                  <ul className="clean-list">
                    {cons.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Ainda nao cadastrado.</p>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {(phone.shortReview || phone.recommendedFor || phone.notRecommendedFor || phone.alternatives) ? (
          <section className="section">
            <div className="shell ranking">
              <div className="rank-list"><h3>Resumo de compra</h3><p>{phone.shortReview || phone.verdict}</p><p className="muted">Indicado para: {textOrDash(phone.recommendedFor)}</p><p className="muted">Evite se: {textOrDash(phone.notRecommendedFor)}</p></div>
              <div className="rank-list"><h3>Alternativas</h3><p>{textOrDash(phone.alternatives)}</p><p className="muted">Menor preço histórico: {formatCurrency(phone.minHistoricalPrice)}</p></div>
            </div>
          </section>
        ) : null}

        <section className="section" id="historico">
          <div className="shell">
            <PhoneEngagementPanel phone={phone} />
          </div>
        </section>

        <section className="section">
          <div className="shell ranking">
            <div className="rank-list" id="opinioes">
              <h3>Historico de preco</h3>
              {priceHistory.length ? (
                <div className="history-grid">
                  {priceHistory.map((item) => (
                    <a className="history-item" href={item.url || "#"} key={item.id}>
                      <span>{item.store}</span>
                      <strong>{formatCurrency(item.price)}</strong>
                      <small>{item.capturedAt ? new Date(item.capturedAt).toLocaleDateString("pt-BR") : "Data nao cadastrada"}</small>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="muted">Sem historico salvo ainda. Ao registrar capturas em price_history, o grafico evolui aqui.</p>
              )}
            </div>
            <div className="rank-list">
              <h3>Opinioes da comunidade</h3>
              {reviews.length ? reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <strong>{review.rating}/10 • {review.contact || "Usuario"}</strong>
                  <p>{review.comment}</p>
                  <small className="muted">Prós: {textOrDash(review.pros)} • Contras: {textOrDash(review.cons)}</small>
                </article>
              )) : <p className="muted">Seja o primeiro a avaliar esse celular.</p>}
            </div>
          </div>
        </section>

        <section className="section" id="ficha">
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
                  <td>
                    {phone.chipset}
                    {phone.gpu ? ` / GPU ${phone.gpu}` : ""}
                  </td>
                </tr>
                <tr>
                  <th>Tela</th>
                  <td>
                    {phone.screenSizeIn ? `${phone.screenSizeIn} pol., ` : ""}{phone.display}, {phone.displayHz} Hz
                    {phone.screenResolution ? `, ${phone.screenResolution}` : ""}
                    {phone.protection ? `, ${phone.protection}` : ""}{phone.brightnessNits ? `, ${phone.brightnessNits} nits` : ""}
                  </td>
                </tr>
                <tr>
                  <th>Memoria</th>
                  <td>
                    {phone.ramGb} GB {textOrDash(phone.ramType)} / {phone.storageGb} GB {textOrDash(phone.storageType)}
                  </td>
                </tr>
                <tr>
                  <th>Camera principal</th>
                  <td>
                    {phone.mainCameraMp} MP{phone.cameraSensor ? `, ${phone.cameraSensor}` : ""}{phone.hasOis ? ", OIS" : ""}{phone.opticalZoom ? `, zoom ${phone.opticalZoom}` : ""}, video {phone.video}
                  </td>
                </tr>
                <tr>
                  <th>Cameras extras</th>
                  <td>
                    Ultrawide {phone.ultrawideCameraMp || 0} MP, telefoto {phone.telephotoCameraMp || 0} MP, frontal{" "}
                    {phone.selfieCameraMp || 0} MP
                  </td>
                </tr>
                <tr>
                  <th>Bateria e carregamento</th>
                  <td>
                    {phone.batteryMah} mAh / {phone.chargingW} W{phone.wirelessChargingW ? ` / sem fio ${phone.wirelessChargingW} W` : ""}{phone.reverseCharging ? " / reverso" : ""}
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
                <tr>
                  <th>Conectividade</th>
                  <td>
                    5G: {yesNo(phone.fiveG)} / NFC: {yesNo(phone.nfc)} / Wi-Fi: {textOrDash(phone.wifi)} / Bluetooth:{" "}
                    {textOrDash(phone.bluetooth)} / GPS: {textOrDash(phone.gps)}
                  </td>
                </tr>
                <tr>
                  <th>Chips e extras</th>
                  <td>
                    Dual SIM: {yesNo(phone.dualSim)} / eSIM: {yesNo(phone.esim)} / Cartao de memoria:{" "}
                    {yesNo(phone.memoryCard)} / Som stereo: {yesNo(phone.stereoSpeakers)} / P2: {yesNo(phone.audioJack)}
                  </td>
                </tr>
                <tr>
                  <th>USB</th>
                  <td>{textOrDash(phone.usbType)}</td>
                </tr>
                <tr>
                  <th>Updates e biometria</th>
                  <td>{textOrDash(phone.updatePromise)} / {textOrDash(phone.biometricType)}</td>
                </tr>
                <tr>
                  <th>Bandas</th>
                  <td>{textOrDash(phone.networkBands)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
