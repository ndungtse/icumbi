import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "icumbi — places to stay in Rwanda",
  description: "Find a place to stay in Rwanda and see what is within walking distance of it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
              icumbi
            </Link>
            <Link href="/#areas" className="text-sm font-medium text-ink hover:text-primary">
              Browse areas
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-surface px-4 py-6 text-center text-sm text-muted">
          Places © OpenStreetMap contributors via Geoapify · Map © OpenFreeMap, OpenMapTiles · Photos from Wikimedia Commons
        </footer>
      </body>
    </html>
  );
}
