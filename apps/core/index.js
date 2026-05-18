import rawHtml from "./index.html";

const SITE_URL = "https://community.mannamplace.com";
const FIREBASE_PROJECT_ID = "mannamplace-community";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // robots.txt
    if (url.pathname === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n\n# RSS 피드\n# ${SITE_URL}/rss.xml`,
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

    // rss.xml — 최신 게시글 30개
    if (url.pathname === "/rss.xml") {
      const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/posts?pageSize=50&orderBy=timestamp%20desc`;
      const res = await fetch(fbUrl);
      let items = [];
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          items = data.documents.slice(0, 30).map(d => {
            const f = d.fields;
            const id = d.name.split("/").pop();
            const title = (f.title?.stringValue || "게시글").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const desc = (f.content?.stringValue || "").replace(/<[^>]*>/g, "").substring(0, 200).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const link = `${SITE_URL}/?id=${id}`;
            const pubDate = f.timestamp?.timestampValue ? new Date(f.timestamp.timestampValue).toUTCString() : new Date().toUTCString();
            return `  <item>
    <title>${title}</title>
    <link>${link}</link>
    <description>${desc}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${link}</guid>
  </item>`;
          });
        }
      }
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mannamplace 커뮤니티</title>
    <link>${SITE_URL}</link>
    <description>전 세계가 모이는 다언어 커뮤니티 플랫폼</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;
      return new Response(rss, { headers: { "Content-Type": "application/rss+xml; charset=UTF-8" } });
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

    return new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
