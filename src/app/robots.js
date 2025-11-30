export default function robots() {
  const baseUrl = "https://drsatishdhage.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api", "/admin", "/dashboard", "/server"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
