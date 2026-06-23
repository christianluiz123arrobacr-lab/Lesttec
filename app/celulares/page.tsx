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
  const minBattery = Number(params.minBattery ?? 0);
  const minHz = Number(params.minHz ?? 0);
  const sort = params.sort ?? "score";
  const only5g = params.fiveG === "on";
  const onlyNfc = params.nfc === "on";
  const onlyOis = params.ois === "on";
  const quickFilters = [
    { label: "Até R$ 1.500", href: "/celulares?maxPrice=1500" },
    { label: "Até R$ 2.000", href: "/celulares?maxPrice=2000" },
    { label: "Com NFC", href: "/celulares?nfc=on" },
    { label: "5G", href: "/celulares?fiveG=on" },
    { label: "8 GB RAM+", href: "/celulares?minRam=8" },
    { label: "120 Hz+", href: "/celulares?minHz=120" },
    { label: "OIS", href: "/celulares?ois=on" }
  ];

  const filtered = phones.filter((phone) => {
    const matchesQuery = !q || `${phone.name} ${phone.brand} ${phone.chipset}`.toLowerCase().includes(q);
    const matchesBrand = !brand || phone.brand === brand;
    const matchesPrice = !maxPrice || phone.bestPrice <= maxPrice;
    const matchesRam = !minRam || phone.ramGb >= minRam;
    const matchesBattery = !minBattery || phone.batteryMah >= minBattery;
    const matchesHz = !minHz || phone.displayHz >= minHz;
    return matchesQuery && matchesBrand && matchesPrice && matchesRam && matchesBattery && matchesHz && (!only5g || phone.fiveG) && (!onlyNfc || phone.nfc) && (!onlyOis || phone.hasOis);
  });

  const byScore = [...filtered].sort((a, b) => finalScore(b) - finalScore(a));
  const byValue = [...filtered].sort((a, b) => b.scoreValue - a.scoreValue);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price") return a.bestPrice - b.bestPrice;
    if (sort === "battery") return b.batteryMah - a.batteryMah;
    if (sort === "camera") return b.scoreCamera - a.scoreCamera;
    if (sort === "performance") return b.scorePerformance - a.scorePerformance;
    if (sort === "value") return b.scoreValue - a.scoreValue;
    return finalScore(b) - finalScore(a);
  });

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
            <div className="quick-filter-row">
              {quickFilters.map((filter) => (
                <a className="quick-filter" href={filter.href} key={filter.href}>
                  {filter.label}
                </a>
              ))}
            </div>
            <div className="catalog-layout">
              <form className="catalog-filters">
                <div>
                  <span className="eyebrow">Filtros</span>
                  <h3>Refine sua busca</h3>
                </div>
                <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar Galaxy, iPhone, chipset..." />
                <select name="brand" defaultValue={brand}>
                  <option value="">Todas as marcas</option>
                  {brands.map((item) => <option key={item}>{item}</option>)}
                </select>
                <input name="maxPrice" type="number" defaultValue={params.maxPrice ?? ""} placeholder="Preço máximo" />
                <input name="minRam" type="number" defaultValue={params.minRam ?? ""} placeholder="RAM mínima" />
                <input name="minBattery" type="number" defaultValue={params.minBattery ?? ""} placeholder="Bateria mínima mAh" />
                <input name="minHz" type="number" defaultValue={params.minHz ?? ""} placeholder="Tela mínima Hz" />
                <select name="sort" defaultValue={sort}>
                  <option value="score">Ordenar: maior nota</option>
                  <option value="price">Menor preço</option>
                  <option value="value">Custo-benefício</option>
                  <option value="camera">Melhor câmera</option>
                  <option value="battery">Maior bateria</option>
                  <option value="performance">Mais desempenho</option>
                </select>
                <div className="checkbox-grid compact">
                  <label><input name="fiveG" type="checkbox" defaultChecked={only5g} /> 5G</label>
                  <label><input name="nfc" type="checkbox" defaultChecked={onlyNfc} /> NFC</label>
                  <label><input name="ois" type="checkbox" defaultChecked={onlyOis} /> OIS</label>
                </div>
                <button className="button" type="submit">Aplicar filtros</button>
              </form>

              <div className="catalog-results">
                <div className="catalog-toolbar">
                  <div>
                    <strong>{sorted.length} celulares encontrados</strong>
                    <p className="muted">Ordenados por {sort === "price" ? "menor preço" : sort === "value" ? "custo-benefício" : sort === "camera" ? "câmera" : sort === "battery" ? "bateria" : sort === "performance" ? "desempenho" : "maior nota"}.</p>
                  </div>
                  <a className="button ghost" href="/comparar">Comparar modelos</a>
                </div>
                <div className="grid catalog-grid">
                  {sorted.map((phone) => <PhoneCard phone={phone} key={phone.id} />)}
                </div>
              </div>
            </div>
            <div className="catalog-mobile-actions">
              <a className="button ghost" href="#top">Filtros</a>
              <a className="button" href="/comparar">Comparar</a>
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
