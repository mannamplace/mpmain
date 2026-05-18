import rawHtml from "./index.html";

const SITE_URL = "https://mannamplace.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // robots.txt
    if (url.pathname === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    // sitemap.xml
    if (url.pathname === "/sitemap.xml") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/community</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/news</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/market</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/video</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/wiki</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/research</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`;
      return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    }

    return new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
}
