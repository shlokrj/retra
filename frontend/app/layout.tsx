import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retra",
  description: "Explainable AI for diabetic retinopathy screening from retinal fundus images.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
