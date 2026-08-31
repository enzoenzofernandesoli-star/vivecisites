import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Viveci — Veja o seu site antes de pagar",
  description: "Sites para empresas locais. Eu monto o modelo do seu negócio, mostro funcionando e só depois conversamos sobre valor.",
  metadataBase: new URL("https://vvcdigital.studio"),
  openGraph: { title: "Viveci — VVC Digital Studio", description: "O seu site pronto antes de você pagar.", type: "website", locale: "pt_BR" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#0D1B2A", colorScheme: "dark light", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${cinzel.variable} ${manrope.variable}`}>{children}</body></html>;
}
