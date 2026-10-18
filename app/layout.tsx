import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "UNAJ Bienestar 360° · Propuesta académica",
  description:
    "Prototipo académico de gestión del bienestar universitario. Datos ficticios.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
