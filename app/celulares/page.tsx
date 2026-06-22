import { Header } from "@/components/Header";
import { PhoneCard } from "@/components/PhoneCard";
import { RankingList } from "@/components/RankingList";
import { getPhones } from "@/lib/phones";
import { finalScore } from "@/lib/scoring";

export default async function PhonesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const phones = await getPhones();
  const brands = [...new Set(phones.map((phone) => phone.brand).filter(Boolean))].sort();
  const q = (params.q ?? "").toLowerCase();
  const brand = params.brand ?? "";
  const maxPrice = Number(params.maxPrice ?? 0);
  const minRam = Number(params.minRam ?? 0);
  const only5g = params.fiveG === "on";
  const onlyNfc = params.nfc === "on";

  const filtered = phones.filter((phone) => {
    const matchesQuery = !q || `${phone.name} ${phone.brand} ${phone.chipset}`.toLowerCase().includes(q);
    const matchesBrand = !brand || phone.brand === brand;
    const matchesPrice = !maxPrice || phone.bestPrice <= maxPrice;
    const matchesRam = !minRam || phone.ramGb >= minRam;
    return matchesQuery && matchesBrand && matchesPrice && matchesRam && (!only5g || phone.fiveG) && (!onlyNfc || phone.nfc);
  });

  const byScore = [...filtered].sort((a, b) => finalScore(b) - finalScore(a));
  const byValue = [...filtered].sort((a, b) => b.scoreValue - a.scoreValue);

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <h1>Celulares</h1>
            <p className="muted">Lista com busca, filtros, rankings e foco em decisão de compra.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <form className="filter-card">
              <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar Galaxy, iPhone, chipset..." />
              <select name="brand" defaultValue={brand}>
                <option value="">Todas as marcas</option>
                {brands.map((item) => <option key={item}>{item}</option>)}
              </select>
              <input name="maxPrice" type="number" defaultValue={params.maxPrice ?? ""} placeholder="Preço máximo" />
              <input name="minRam" type="number" defaultValue={params.minRam ?? ""} placeholder="RAM mínima" />
              <label><input name="fiveG" type="checkbox" defaultChecked={only5g} /> 5G</label>
              <label><input name="nfc" type="checkbox" defaultChecked={onlyNfc} /> NFC</label>
              <button className="button" type="submit">Filtrar</button>
            </form>
            <p className="muted">{filtered.length} celulares encontrados.</p>
            <div className="grid">
              {filtered.map((phone) => <PhoneCard phone={phone} key={phone.id} />)}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="shell ranking">
            <RankingList title="Top desempenho geral" phones={byScore} mode="score" />
            <RankingList title="Top custo-benefício" phones={byValue} mode="value" />
          </div>
        </section>
      </main>
    </>
  );
}
