import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Wandern am Ritten",
  description:
    "Wanderkarte des Rittner Gebiets: gelaufene Touren, Statistiken, Fotos und Tourenplanung.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Ritten", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2f6f4f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <div className="flex min-h-[100dvh] flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
