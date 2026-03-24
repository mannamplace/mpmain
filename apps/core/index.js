import rawHtml from "./index.html";

const SITE_URL = "https://community.mannamplace.com";
const FIREBASE_PROJECT_ID = "mannamplace-community"; // Firebase 프로젝트 ID로 교체

export default {
  async fetch(request, env, ctx) {
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
  <url><loc>${SITE_URL}/hot</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/global</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
</urlset>`;
      return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    }

    // OG태그 동적 처리 (게시글 공유 미리보기)
    const ua = request.headers.get("user-agent") || "";
    const isCrawler = /facebookexternalhit|Twitterbot|kakaotalk|Line|linkedinbot|Slackbot|Discordbot|TelegramBot/i.test(ua);
    const postId = url.searchParams.get("id") || url.pathname.split("/").filter(Boolean)[1];

    if (isCrawler && postId) {
      try {
        const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/posts/${postId}`;
        const res = await fetch(fbUrl);
        let title = "Mannamplace 커뮤니티";
        let desc = "전 세계가 모이는 다언어 커뮤니티 플랫폼";
        let img = `${SITE_URL}/og-default.png`;

        if (res.ok) {
          const data = await res.json();
          const f = data.fields || {};
          title = f.title?.stringValue || title;
          desc = (f.content?.stringValue || desc).replace(/<[^>]*>/g, "").substring(0, 150);
          img = f.img?.stringValue || img;
        }

        return new HTMLRewriter()
          .on('meta[property="og:title"]', { element(el) { el.setAttribute("content", title); } })
          .on('meta[property="og:description"]', { element(el) { el.setAttribute("content", desc); } })
          .on('meta[property="og:image"]', { element(el) { el.setAttribute("content", img); } })
          .on('meta[property="og:url"]', { element(el) { el.setAttribute("content", url.href); } })
          .on("title", { element(el) { el.setInnerContent(`${title} — Mannamplace 커뮤니티`); } })
          .transform(new Response(rawHtml, { headers: { "Content-Type": "text/html;charset=UTF-8" } }));
      } catch (e) {
        console.error(e);
      }
    }

    // 일반 요청 → index.html 서빙
    return new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
