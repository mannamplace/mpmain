import rawHtml from "./index.html";
import cookieConsentJs from "./assets/cookie-consent.js";
import cookieConsentCss from "./assets/cookie-consent.css";
import { PRIVACY_POLICY, TERMS_OF_SERVICE, COOKIE_POLICY } from "./legal-content.js";

const SITE_URL = "https://mannamplace.com";

// Same Firebase project navbar.js already initializes client-side (see package/navbar.js).
// Reused here so legal-doc overrides live in the same Firestore the rest of the site uses.
const FIREBASE_PROJECT_ID = "mannamplaceofficial";

const LEGAL_DOCS = {
  privacy: { path: "/privacy", data: PRIVACY_POLICY },
  terms: { path: "/terms", data: TERMS_OF_SERVICE },
  cookies: { path: "/cookies", data: COOKIE_POLICY },
};

// Admin-panel work item will let ops write overrides here without a redeploy.
// Until that exists, this always falls back to the bundled copy in legal-content.js.
async function getLegalDoc(docType, lang) {
  const bundled = LEGAL_DOCS[docType].data[lang] || LEGAL_DOCS[docType].data.en;
  try {
    const fbUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/legal_documents/${docType}_${lang}`;
    const res = await fetch(fbUrl);
    if (!res.ok) return bundled; // no override doc yet — expected until admin panel ships
    const doc = await res.json();
    const f = doc.fields;
    if (!f?.title?.stringValue || !f?.sectionsJson?.stringValue) return bundled;
    return {
      title: f.title.stringValue,
      updated: f.updated?.stringValue || bundled.updated,
      sections: JSON.parse(f.sectionsJson.stringValue),
    };
  } catch (e) {
    console.error("legal doc fetch failed, using bundled default:", e);
    return bundled;
  }
}

function detectLang(request, url) {
  const qLang = url.searchParams.get("lang");
  if (qLang) return qLang.startsWith("ko") ? "ko" : "en";
  const accept = request.headers.get("accept-language") || "";
  return accept.toLowerCase().includes("ko") ? "ko" : "en";
}

function renderLegalPage({ title, updated, sections }, lang, docType) {
  const altLang = lang === "ko" ? "en" : "ko";
  const switchLabel = altLang === "ko" ? "한국어로 보기" : "View in English";
  const manageLabel = lang === "ko" ? "쿠키 설정 관리" : "Manage cookie settings";
  const manageButtonHtml =
    docType === "cookies"
      ? `<button id="mp-manage-cookies" class="switch" style="border:1px solid var(--border2);background:transparent;color:var(--text2);border-radius:6px;padding:8px 14px;font-size:13px;cursor:pointer;margin-top:8px">${manageLabel}</button>`
      : "";
  const sectionsHtml = sections
    .map(
      (s) => `
      <section class="legal-section">
        <h2>${s.h}</h2>
        <p>${s.p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>
      </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Mannamplace</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/cookie-consent.css">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  :root{--org:#B84A00;--org3:#FF6B1A;--bg:#1A0A00;--card:#1E0D03;--border:#3D1F08;--border2:#5C3010;
    --text:#F5E6D8;--text2:#C4956A;--text3:#7A4A28;--white:#FFF8F2;
    --mp-org:#B84A00;--mp-org2:#D45500;--mp-org3:#FF6B1A;--mp-org-dark:#8C3700;
    --mp-bg:#1A0A00;--mp-card:#1E0D03;--mp-border:#3D1F08;--mp-border2:#5C3010;
    --mp-text:#F5E6D8;--mp-text2:#C4956A;--mp-text3:#7A4A28;--mp-white:#FFF8F2;
    --mp-space-1:4px;--mp-space-2:8px;--mp-space-3:12px;--mp-space-4:16px;--mp-space-5:20px;--mp-space-6:24px;
    --mp-radius-sm:4px;--mp-radius-md:6px;--mp-radius-lg:10px;--mp-radius-xl:16px;--mp-radius-full:9999px;
    --mp-text-xs:10px;--mp-text-sm:12px;--mp-text-md:14px;--mp-text-lg:16px;--mp-text-xl:20px;
    --mp-transition:.15s ease;--mp-shadow-lg:0 8px 32px rgba(0,0,0,0.6);--mp-z-modal:500;--mp-font-main:'Noto Sans KR',sans-serif;}
  body{background:var(--bg);color:var(--text);font-family:'Noto Sans KR',sans-serif;line-height:1.7}
  .wrap{max-width:760px;margin:0 auto;padding:48px 20px 96px}
  .topline{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  a.home{color:var(--org3);text-decoration:none;font-size:13px}
  a.home:hover{text-decoration:underline}
  a.switch{color:var(--text2);text-decoration:none;font-size:13px;border:1px solid var(--border2);border-radius:6px;padding:4px 10px}
  a.switch:hover{border-color:var(--org);color:var(--org3)}
  h1{font-size:26px;color:var(--white);margin:20px 0 4px}
  .updated{font-size:12px;color:var(--text3);margin-bottom:32px}
  .legal-section{margin-bottom:28px}
  .legal-section h2{font-size:15px;color:var(--org3);margin-bottom:8px}
  .legal-section p{font-size:14px;color:var(--text2);white-space:pre-line}
</style>
</head>
<body>
  <div class="wrap">
    <div class="topline">
      <a class="home" href="/">← Mannamplace</a>
      <a class="switch" href="?lang=${altLang}">${switchLabel}</a>
    </div>
    <h1>${title}</h1>
    <div class="updated">${lang === "ko" ? "최종 개정" : "Last updated"}: ${updated}</div>
    ${sectionsHtml}
    ${manageButtonHtml}
  </div>
  <script type="module">
    import { initCookieConsent, openCookieSettings } from '/assets/cookie-consent.js';
    initCookieConsent({ lang: '${lang}' });
    const manageBtn = document.getElementById('mp-manage-cookies');
    if (manageBtn) manageBtn.addEventListener('click', () => openCookieSettings({ lang: '${lang}' }));
  </script>
</body>
</html>`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Shared cookie-consent assets (kept in apps/mp/assets, mirrored from package/ —
    // see the roadmap note about wiring a real shared-asset pipeline across all apps).
    if (url.pathname === "/assets/cookie-consent.js") {
      return new Response(cookieConsentJs, { headers: { "Content-Type": "application/javascript;charset=UTF-8" } });
    }
    if (url.pathname === "/assets/cookie-consent.css") {
      return new Response(cookieConsentCss, { headers: { "Content-Type": "text/css;charset=UTF-8" } });
    }

    // Legal pages: /privacy, /terms, /cookies — linked from package/footer.js already.
    const legalMatch = Object.entries(LEGAL_DOCS).find(([, cfg]) => cfg.path === url.pathname);
    if (legalMatch) {
      const [docType] = legalMatch;
      const lang = detectLang(request, url);
      const doc = await getLegalDoc(docType, lang);
      return new Response(renderLegalPage(doc, lang, docType), {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
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
