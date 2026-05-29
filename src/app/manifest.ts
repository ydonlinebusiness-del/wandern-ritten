import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wandern am Ritten",
    short_name: "Ritten",
    description: "Wanderkarte, Touren, Statistiken & Planung für den Ritten",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2f6f4f",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
