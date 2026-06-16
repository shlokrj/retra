import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
    <html lang="en">
      <body>
        <header className="border-b border-slate-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Retra
            </Link>
            <div className="flex gap-6 text-sm text-slate-300">
              <Link href="/analyze" className="hover:text-white">
                Analyze
              </Link>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </div>
          </nav>
        </header>
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </body>
    </html>
  );
}
