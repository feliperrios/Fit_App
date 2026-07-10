import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "FitApp", description: "Controle sua dieta e seus treinos" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css"/></head>
      <body><div className="w-full max-w-app mx-auto min-h-screen bg-bg">{children}</div></body>
    </html>
  );
}
