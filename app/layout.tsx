import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Michroma } from "next/font/google";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import { ScrollTriggerProbe } from "@/providers/ScrollTriggerProbe";
import "./globals.css";

// Fonte de display das seções (--font-sans em globals.css).
// Via next/font/google: self-hosted e servida como woff2.
const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
});

const bricolage = localFont({
  src: [
    { path: "./fonts/BricolageGrotesque-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/BricolageGrotesque-Bold.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-cinzel",
  display: "swap",
});

const instrument = localFont({
  src: [
    { path: "./fonts/InstrumentSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/InstrumentSans-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/InstrumentSans-BoldItalic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viveci — Veja o seu site antes de pagar",
  description: "Sites para que empresas sejam encontradas, transmitam confiança e transformem visitas em clientes. Veja um modelo antes de decidir.",
  metadataBase: new URL("https://vvcdigital.studio"),
  openGraph: { title: "Viveci — VVC Digital Studio", description: "Presença digital e soluções para o seu negócio, com um modelo do site antes de você decidir.", type: "website", locale: "pt_BR" },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: "#020D1B", colorScheme: "dark light", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${bricolage.variable} ${instrument.variable} ${michroma.variable}`}>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
      <ScrollTriggerProbe />
    </body></html>;
}
