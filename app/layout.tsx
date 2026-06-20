import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhoneBase - Comparador de celulares",
  description: "Compare celulares, veja pontuacoes, tamanho real, ficha tecnica e ofertas."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
