import type { MetadataRoute } from "next";

/* Manifest PWA (criterio 36): instalable con el prompt nativo del navegador. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hábitos",
    short_name: "Hábitos",
    description: "Registra y da seguimiento a tus hábitos diarios y semanales.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf9",
    theme_color: "#0e8c72",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
