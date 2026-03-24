import rawHtml from "./index.html";

const FIREBASE_PROJECT_ID = "tnnews-502d4";
const FIREBASE_API_KEY = "AIzaSyAzi4dSgnidJPVado54jTDH94Fyw1CVmx4";
const SITE_URL = "https://tnfocnus.mannamplace.com";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ✅ 리다이렉트 — workers.dev로 오면 새 도메인으로 이동
    if (url.hostname.includes("workers.dev")) {
      return Response.redirect(
        `${SITE_URL}${url.pathname}${url.search}`,
        301
      );
    }

    // robots.txt
    if (url.pathname === "/robots.txt") {
      return new Response(
        `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    // sitemap.xml
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
            const cat = f.cat?.arrayValue?.values?.[0]?.stringValue || 'news';
            const num = f.globalNum?.integerValue ?? f.globalNum?.stringValue;
            if (!num) return;
            const lastmod = f.timestamp?.timestampValue?.substring(0, 10) || new Date().toISOString().substring(0, 10);
            urls.push(`<url><loc>${SITE_URL}/${encodeURIComponent(cat)}/${num}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
          });
        }
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
      return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    }

    const pathParts = url.pathname.split('/').filter(p => p);
    const articleNum = pathParts[1] || url.searchParams.get('num');

    const getBaseResponse = () => new Response(rawHtml, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });

    if (!articleNum) return getBaseResponse();

    try {
      const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/articles?key=${FIREBASE_API_KEY}&pageSize=300`;
      const response = await fetch(fbUrl);

      let title = "T.N. News";
      let description = "모두를 위한 뉴스";
      let imageUrl = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800";
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
            const rawContent = f.content?.stringValue || '';
            description = (f.desc?.stringValue || rawContent.substring(0, 150)).replace(/<[^>]*>/g, '').trim();
            imageUrl = f.img?.stringValue || imageUrl;
          }
        }
      }

      const escapedTitle = title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const escapedDesc = description.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return new HTMLRewriter()
        .on("title", { element(el) { el.setInnerContent(`${title} - T.N. News`); } })
        .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', escapedTitle); } })
        .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', escapedDesc); } })
        .on('meta[property="og:image"]', { element(el) { el.setAttribute('content', imageUrl); } })
        .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', articleUrl); } })
        .on('meta[property="og:type"]', { element(el) { el.setAttribute('content', 'article'); } })
        .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', escapedTitle); } })
        .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', escapedDesc); } })
        .on('meta[name="twitter:image"]', { element(el) { el.setAttribute('content', imageUrl); } })
        .transform(getBaseResponse());
    } catch (e) {
      console.error('Worker error:', e);
      return getBaseResponse();
    }
  }
};
