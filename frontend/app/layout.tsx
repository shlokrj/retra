import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Retra",
  description:
    "Explainable AI for diabetic retinopathy screening from retinal fundus images.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/85 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
            <Link
              href="/"
              aria-label="Retra home"
              className="flex items-center gap-2 text-lg font-bold text-slate-950 transition hover:text-sky-700"
            >
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-lg bg-sky-100 text-sm text-sky-700 shadow-sm shadow-sky-100"
              >
                R
              </span>
              <span>Retra</span>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Link
                href="/analyze"
                className="rounded-lg px-3 py-2 transition hover:bg-sky-50 hover:text-sky-700"
              >
                Analyze
              </Link>
              <Link
                href="/about"
                className="rounded-lg px-3 py-2 transition hover:bg-sky-50 hover:text-sky-700"
              >
                About
              </Link>
            </div>
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-12">
          {children}
        </div>
      </body>
    </html>
  );
}
