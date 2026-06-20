import { ComparisonClient } from "@/components/ComparisonClient";
import { Header } from "@/components/Header";
import { getPhones } from "@/lib/phones";

export default async function ComparePage() {
  const phones = await getPhones();

  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <h1>Comparar celulares</h1>
            <p className="muted">Escolha ate 4 modelos para comparar ficha tecnica, nota e tamanho.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <ComparisonClient phones={phones} />
          </div>
        </section>
      </main>
    </>
  );
}
