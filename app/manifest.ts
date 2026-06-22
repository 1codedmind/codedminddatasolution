import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coded Mind",
    short_name: "Coded Mind",
    description: "Free developer tools & professional data engineering services",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d97706",
    icons: [
      { src: "/icon.png",       sizes: "any",     type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
