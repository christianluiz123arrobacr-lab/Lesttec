import { Header } from "@/components/Header";
import { getPhones, getPricesByPhoneId } from "@/lib/phones";
import { formatCurrency } from "@/lib/scoring";

type StoreSummary = { name: string; offers: number; minPrice: number; coupons: Set<string>; trusted: number };

export default async function StoresPage() {
  const phones = await getPhones();
  const storeMap = new Map<string, StoreSummary>();

  for (const phone of phones) {
    const prices = await getPricesByPhoneId(phone.id);
    for (const price of prices) {
      const current = storeMap.get(price.store) ?? { name: price.store, offers: 0, minPrice: Number.POSITIVE_INFINITY, coupons: new Set<string>(), trusted: 0 };
      current.offers += 1;
      current.minPrice = Math.min(current.minPrice, price.price);
      if (price.coupon) current.coupons.add(price.coupon);
      if (price.trustedStore) current.trusted += 1;
      storeMap.set(price.store, current);
    }
  }

  const stores = [...storeMap.values()].sort((a, b) => b.offers - a.offers);

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Cupons e lojas</p>
            <h1>Lojas parceiras e cupons</h1>
            <p className="muted">Central com lojas reais vindas das ofertas cadastradas, cupons, menor preço e sinal de confiabilidade.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell info-grid store-grid">
            {stores.length ? stores.map((store) => (
              <div className="info-card" key={store.name}>
                <span className="store-logo">{store.name.slice(0, 1)}</span>
                <h3>{store.name}</h3>
                <p className="muted">{store.offers} ofertas • menor preço {formatCurrency(store.minPrice)} • {store.trusted} confiáveis</p>
                <p>{store.coupons.size ? `Cupons: ${[...store.coupons].join(", ")}` : "Sem cupom ativo cadastrado."}</p>
                <a className="button ghost" href="/ofertas">Ver ofertas</a>
              </div>
            )) : <p className="muted">Cadastre ofertas para montar esta vitrine automaticamente.</p>}
          </div>
        </section>
      </main>
    </>
  );
}
