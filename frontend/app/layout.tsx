import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:py-12">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
