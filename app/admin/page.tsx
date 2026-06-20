import { AdminPhoneForm } from "@/components/AdminPhoneForm";
import { Header } from "@/components/Header";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <h1>Painel admin</h1>
            <p className="muted">Base para cadastrar celulares sem mexer no codigo.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell admin-layout">
            <AdminPhoneForm />
            <aside className="notice">
              <h3>Importante</h3>
              <p>
                O formulario ja esta ligado a uma Server Action. Para salvar de verdade, configure o Supabase e rode o schema.
              </p>
              <p>
                Sem `.env.local`, o site continua funcionando com dados mockados para voce validar layout e fluxo.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
