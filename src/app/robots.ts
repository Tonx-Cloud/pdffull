import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.pdf-full.com").trim();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/converter", "/historico", "/conta"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
