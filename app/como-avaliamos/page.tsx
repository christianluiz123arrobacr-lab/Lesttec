import { Header } from "@/components/Header";

const criteria = [
  ["Desempenho", "Processador, GPU, RAM, armazenamento, benchmarks e estabilidade."],
  ["Câmera", "Sensor principal, OIS, ultrawide, vídeo, selfie e consistência."],
  ["Bateria", "Capacidade, eficiência, carregamento, sem fio e uso real estimado."],
  ["Tela", "Tipo de painel, brilho, resolução, Hz, proteção e qualidade percebida."],
  ["Construção", "Peso, resistência, materiais, IP, biometria e acabamento."],
  ["Valor", "Preço atual, menor preço, concorrentes e custo-benefício geral."]
];

export default function HowWeRatePage() {
  return (
    <>
      <Header />
      <main>
        <section className="detail-hero">
          <div className="shell">
            <p className="eyebrow">Transparência</p>
            <h1>Como avaliamos celulares</h1>
            <p className="muted">Nossa nota combina ficha técnica, preço, recursos importantes e contexto de compra no Brasil.</p>
          </div>
        </section>
        <section className="section">
          <div className="shell info-grid">
            {criteria.map(([title, text]) => (
              <div className="info-card" key={title}>
                <span className="badge">Nota</span>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
