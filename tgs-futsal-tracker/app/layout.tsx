import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const score = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-score",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Abdur Rahim Memorial Futsal 2026",
  description:
    "Live scores, fixtures, standings and player stats for the TGS Gregorian Abdur Rahim Memorial Futsal Tournament 2026.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/groups", label: "Groups" },
  { href: "/teams", label: "Player List" },
  { href: "/standings", label: "Standings" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/players", label: "Player Stats" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${score.variable} ${body.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <header className="bg-pitch text-bone">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="font-display text-lg tracking-tight leading-tight">
              Abdur Rahim Memorial Futsal
              <span className="block text-xs font-sans font-normal text-turf">
                The Gregorian Society · 2026
              </span>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-amber transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-[#DAD6C8] mt-12">
          <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between gap-2 text-sm text-[#5B6B62]">
            <p>In memory of Abdur Rahim · Dbox Sports Complex, Oct 2 2026</p>
            <Link href="/admin" className="hover:text-ink">
              Match control
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
