import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { PhoneSizeCompare } from "@/components/PhoneSizeCompare";
import { ScoreRows } from "@/components/ScoreRows";
import { getPhoneBySlug, getPhones, getPricesByPhoneId } from "@/lib/phones";
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
  const similar = phones.filter((item) => item.id !== phone.id).slice(0, 2);
  const pros = listLines(phone.pros);
  const cons = listLines(phone.cons);

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
            <aside className="buy-box">
              <span className="muted">Melhor preco</span>
              <h2>{formatCurrency(phone.bestPrice)}</h2>
              <p className="muted">Preco medio cadastrado: {formatCurrency(phone.price)}</p>
              <a className="button" href={prices[0] ? `/oferta/${prices[0].id}` : phone.affiliateUrl}>
                Ver oferta
              </a>
            </aside>
          </div>
        </section>

        <section className="phone-action-section">
          <div className="shell phone-action-bar">
            <a href="#resumo">Resumo</a>
            <a href="#ofertas">Ofertas</a>
            <a href="#ficha">Ficha técnica</a>
            <a href="/comparar">Comparar</a>
            <button type="button">Quero comprar</button>
            <button type="button">Tenho esse</button>
            <button type="button">Alerta de preço</button>
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
                    </span>
                    <strong className="price">{formatCurrency(price.price)}</strong>
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

        <section className="section">
          <div className="shell price-alert-card">
            <div>
              <span className="badge">Alerta de preço</span>
              <h2>Quer pagar menos no {phone.name}?</h2>
              <p className="muted">Cadastre um preço alvo e use esta área como base para um alerta por e-mail ou WhatsApp quando a oferta baixar.</p>
            </div>
            <form className="price-alert-form">
              <input placeholder="Preço desejado" type="number" />
              <input placeholder="Seu e-mail ou WhatsApp" />
              <button className="button" type="button">Criar alerta</button>
            </form>
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
