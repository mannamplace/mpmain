import rawHtml from "./index.html";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\nSitemap: https://mannamplace.com/sitemap.xml",
        { headers: { "Content-Type": "text/plain" }});
    }

    return new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
}
