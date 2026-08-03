import rawHtml from "./index.html";

const SITE_URL = "https://pay.mannamplace.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt") {
      return new Response(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};
