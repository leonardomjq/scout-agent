import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoutagent.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/feed", "/alpha/", "/settings", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
