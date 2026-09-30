import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lumid Evo",
    short_name: "Evo",
    description: "Understand what keeps you stuck and turn it into one small step.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f2",
    theme_color: "#f6f8f2",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
