import rawHtml from "./index.html";

const FIREBASE_PROJECT_ID = "tnnews-502d4";
const FIREBASE_API_KEY = "AIzaSyAzi4dSgnidJPVado54jTDH94Fyw1CVmx4";
const SITE_URL = "https://tnfocnus.mannamplace.com";
const DEFAULT_ARTICLE_THUMB = "https://i.ibb.co/mrhDt2F2/tnfocnus-default-thumb.jpg";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // workers.dev 리다이렉트
    if (url.hostname.includes("workers.dev")) {
      return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 301);
    }

    // robots.txt
    if (url.pathname === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n\n# RSS 피드\n# ${SITE_URL}/rss.xml`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    // sitemap.xml — Firebase에서 승인된 기사 동적 생성
    if (url.pathname === "/sitemap.xml") {
      const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/articles?key=${FIREBASE_API_KEY}&pageSize=300`;
      const res = await fetch(fbUrl);
      let urls = [`<url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`];
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          data.documents.forEach(d => {
            const f = d.fields;
            if (!f.approved?.booleanValue) return;
            const cat = f.cat?.arrayValue?.values?.[0]?.stringValue || "news";
            const num = f.globalNum?.integerValue ?? f.globalNum?.stringValue;
            if (!num) return;
            const lastmod = f.timestamp?.timestampValue?.substring(0, 10) || new Date().toISOString().substring(0, 10);
            urls.push(`<url><loc>${SITE_URL}/${encodeURIComponent(cat)}/${num}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
          });
        }
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
      return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    }

    // rss.xml — 최신 승인 기사 30개
    if (url.pathname === "/rss.xml") {
      const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/articles?key=${FIREBASE_API_KEY}&pageSize=100`;
      const res = await fetch(fbUrl);
      let items = [];
      if (res.ok) {
        const data = await res.json();
        if (data.documents) {
          const approved = data.documents
            .filter(d => d.fields?.approved?.booleanValue)
            .sort((a, b) => {
              const ta = a.fields?.timestamp?.timestampValue || "";
              const tb = b.fields?.timestamp?.timestampValue || "";
              return tb.localeCompare(ta);
            })
            .slice(0, 30);

          items = approved.map(d => {
            const f = d.fields;
            const title = (f.title?.stringValue || "기사").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const desc = (f.desc?.stringValue || f.content?.stringValue || "").replace(/<[^>]*>/g, "").substring(0, 200).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const cat = f.cat?.arrayValue?.values?.[0]?.stringValue || "news";
            const num = f.globalNum?.integerValue ?? f.globalNum?.stringValue;
            const link = `${SITE_URL}/${encodeURIComponent(cat)}/${num}`;
            const pubDate = f.timestamp?.timestampValue ? new Date(f.timestamp.timestampValue).toUTCString() : new Date().toUTCString();
            const img = f.img?.stringValue?.trim() || DEFAULT_ARTICLE_THUMB;
            return `  <item>
    <title>${title}</title>
    <link>${link}</link>
    <description>${desc}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="true">${link}</guid>
    <enclosure url="${img}" type="image/jpeg" length="0"/>
  </item>`;
          });
        }
      }
      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TNfocnus - 글로벌 뉴스</title>
    <link>${SITE_URL}</link>
    <description>전 세계 주요 뉴스를 한눈에</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;
      return new Response(rss, { headers: { "Content-Type": "application/rss+xml; charset=UTF-8" } });
    }

    // OG 태그 동적 처리
    const pathParts = url.pathname.split("/").filter(p => p);
    const articleNum = pathParts[1] || url.searchParams.get("num");

    const getBaseResponse = () => new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });

    if (!articleNum) return getBaseResponse();

    try {
      const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/articles?key=${FIREBASE_API_KEY}&pageSize=300`;
      const response = await fetch(fbUrl);

      let title = "T.N. News";
      let description = "News to all";
      let imageUrl = DEFAULT_ARTICLE_THUMB;
      let articleUrl = url.href;

      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          const doc = data.documents.find(d => {
            const gn = d.fields.globalNum;
            if (!gn) return false;
            const val = gn.integerValue ?? gn.stringValue;
            return String(val) === String(articleNum);
          });
          if (doc) {
            const f = doc.fields;
            title = f.title?.stringValue || title;
            const rawContent = f.content?.stringValue || "";
            description = (f.desc?.stringValue || rawContent.substring(0, 150)).replace(/<[^>]*>/g, "").trim();
            const imgField = f.img?.stringValue?.trim();
            imageUrl = imgField || DEFAULT_ARTICLE_THUMB;
          }
        }
      }

      const escapedTitle = title.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedDesc = description.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      return new HTMLRewriter()
        .on("title", { element(el) { el.setInnerContent(`${title} - T.N. News`); } })
        .on('meta[property="og:title"]', { element(el) { el.setAttribute("content", escapedTitle); } })
        .on('meta[property="og:description"]', { element(el) { el.setAttribute("content", escapedDesc); } })
        .on('meta[property="og:image"]', { element(el) { el.setAttribute("content", imageUrl); } })
        .on('meta[property="og:url"]', { element(el) { el.setAttribute("content", articleUrl); } })
        .on('meta[property="og:type"]', { element(el) { el.setAttribute("content", "article"); } })
        .on('meta[name="twitter:title"]', { element(el) { el.setAttribute("content", escapedTitle); } })
        .on('meta[name="twitter:description"]', { element(el) { el.setAttribute("content", escapedDesc); } })
        .on('meta[name="twitter:image"]', { element(el) { el.setAttribute("content", imageUrl); } })
        .transform(getBaseResponse());
    } catch (e) {
      console.error("Worker error:", e);
      return getBaseResponse();
    }
  }
};
