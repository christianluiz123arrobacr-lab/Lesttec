import { AdminDashboard } from "@/components/AdminDashboard";
import { Header } from "@/components/Header";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <h1>Painel admin</h1>
            <p className="muted">Area protegida para admins cadastrarem celulares e acompanharem usuarios.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell">
            <AdminDashboard />
          </div>
        </section>
      </main>
    </>
  );
}
