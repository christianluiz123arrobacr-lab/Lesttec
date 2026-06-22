import { Header } from "@/components/Header";
import { getPhones } from "@/lib/phones";

export default async function FrequenciesPage() {
  const phones = await getPhones();

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Ferramenta</p>
            <h1>Verificador de frequências 4G/5G</h1>
            <p className="muted">Confira bandas cadastradas e compatibilidade antes de comprar celulares importados.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell frequency-tool form-card">
            <div className="form-grid">
              <div className="field">
                <label>Celular</label>
                <select>
                  {phones.map((phone) => <option key={phone.id}>{phone.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>País</label>
                <select defaultValue="Brasil"><option>Brasil</option></select>
              </div>
              <div className="field">
                <label>Operadora</label>
                <select><option>Todas</option><option>Claro</option><option>Vivo</option><option>TIM</option></select>
              </div>
            </div>
            <div className="notice">Nesta primeira versão, a ferramenta usa as bandas cadastradas na ficha técnica. Depois podemos cruzar automaticamente por operadora.</div>
          </div>
        </section>
      </main>
    </>
  );
}
