import { Header } from "@/components/Header";
import { getPhones, getPricesByPhoneId } from "@/lib/phones";
import { formatCurrency } from "@/lib/scoring";

export default async function OffersPage() {
  const phones = await getPhones();
  const offers = (await Promise.all(
    phones.map(async (phone) => {
      const prices = await getPricesByPhoneId(phone.id);
      return prices.map((price) => ({ phone, price }));
    })
  )).flat().sort((a, b) => a.price.price - b.price.price);

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Ofertas verificadas</p>
            <h1>Ofertas de celulares</h1>
            <p className="muted">Compare lojas, cupons, cashback e menor preço cadastrado para decidir rápido.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell offer-page-grid">
            {offers.map(({ phone, price }) => (
              <a className="deal-card" href={`/oferta/${price.id}`} key={price.id}>
                <img src={phone.imageUrl} alt={phone.name} />
                <div>
                  <span className="badge">{price.store}</span>
                  <h3>{phone.name}</h3>
                  <p className="muted">{price.inStock ? "Em estoque" : "Sem estoque"}{price.coupon ? ` • Cupom ${price.coupon}` : ""}{price.cashback ? ` • Cashback ${price.cashback}` : ""}</p>
                </div>
                <strong>{formatCurrency(price.price)}</strong>
                <span className="button offer-button">Ver oferta</span>
              </a>
            ))}
            {!offers.length ? <div className="notice">Nenhuma oferta cadastrada ainda.</div> : null}
          </div>
        </section>
      </main>
    </>
  );
}
