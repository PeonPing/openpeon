import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AudioProvider } from "@/components/ui/AudioPlayer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OpenPeon — An Open Standard for Coding Event Sounds",
    template: "%s — OpenPeon",
  },
  description:
    "CESP (Coding Event Sound Pack Specification) is an open standard for coding event sounds. Browse sound packs for Claude Code, Cursor, Codex, and any agentic IDE. Open standard, community-driven.",
  metadataBase: new URL("https://openpeon.com"),
  openGraph: {
    type: "website",
    siteName: "OpenPeon",
    title: "OpenPeon — An Open Standard for Coding Event Sounds",
    description:
      "Browse sound packs for agentic IDEs. CESP is an open standard any coding tool can adopt.",
  },
  other: {
    "llms.txt": "/llms.txt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <AudioProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AudioProvider>
      </body>
    </html>
  );
}
