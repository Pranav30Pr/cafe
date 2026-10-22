import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://meevagreens.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/order/takeaway"],
        disallow: ["/admin", "/kitchen", "/receipt", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
