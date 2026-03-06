import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jarvis V2",
  description: "Voice-first personal/professional assistant foundation",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}