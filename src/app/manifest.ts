import type { MetadataRoute } from "next";
import { content } from "@/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: content.brand.name,
    short_name: content.brand.name,
    description: content.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a2b1e",
    theme_color: "#0a2b1e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
