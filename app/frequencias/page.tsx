import { Header } from "@/components/Header";
import { getPhones } from "@/lib/phones";

const brasilBands = ["B3", "B7", "B28", "n78"];

function scoreBands(value: string) {
  const normalized = value.toUpperCase();
  const matched = brasilBands.filter((band) => normalized.includes(band.toUpperCase()));
  return { matched, missing: brasilBands.filter((band) => !matched.includes(band)) };
}

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
              <div className="field"><label>País</label><select defaultValue="Brasil"><option>Brasil</option></select></div>
              <div className="field"><label>Operadora</label><select><option>Todas</option><option>Claro</option><option>Vivo</option><option>TIM</option></select></div>
              <div className="field"><label>Bandas essenciais</label><input readOnly value={brasilBands.join(", ")} /></div>
            </div>
            <div className="frequency-results">
              {phones.map((phone) => {
                const result = scoreBands(phone.networkBands);
                return (
                  <article className="frequency-card" key={phone.id}>
                    <strong>{phone.name}</strong>
                    <p className="muted">{phone.networkBands || "Bandas ainda nao cadastradas"}</p>
                    <span className={result.matched.length >= 3 ? "success-text" : "warning-text"}>
                      {result.matched.length ? `Compatível com ${result.matched.join(", ")}` : "Cadastre as bandas para calcular compatibilidade"}
                    </span>
                    {result.missing.length ? <small>Faltando: {result.missing.join(", ")}</small> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
