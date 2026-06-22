import { Header } from "@/components/Header";

const stores = ["Amazon", "Mercado Livre", "Magalu", "Casas Bahia", "AliExpress", "Shopee"];

export default function StoresPage() {
  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Cupons e lojas</p>
            <h1>Lojas parceiras e cupons</h1>
            <p className="muted">Central para organizar lojas, cupons, cashback e confiabilidade das ofertas.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell info-grid">
            {stores.map((store) => (
              <div className="info-card" key={store}>
                <span className="store-logo">{store.slice(0, 1)}</span>
                <h3>{store}</h3>
                <p className="muted">Cupons, ofertas e observações de compra serão exibidos aqui.</p>
                <a className="button ghost" href="/ofertas">Ver ofertas</a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
