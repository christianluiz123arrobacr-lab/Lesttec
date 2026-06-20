import { AccountClient } from "@/components/AccountClient";
import { Header } from "@/components/Header";

export default function AccountPage() {
  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <h1>Conta</h1>
            <p className="muted">Entre, crie sua conta e salve suas preferencias para receber ofertas melhores.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <AccountClient />
          </div>
        </section>
      </main>
    </>
  );
}
