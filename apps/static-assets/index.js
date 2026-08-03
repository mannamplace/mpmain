// ══════════════════════════════════════
// Mannamplace Static Shared-Asset Host
// apps/static-assets/index.js
//
// Serves everything in package/ (the shared design system + components)
// at a single host — static.mannamplace.com — so every app references
// ONE canonical copy instead of duplicating files per-app.
//
// This is the missing piece behind the "shared/js/navbar.js" style
// references already sitting (broken) in market/pay/video's HTML.
// Those apps assumed something like this worker existed; it didn't.
// ══════════════════════════════════════

// NOTE: the files under ./src are a build-time mirror of package/ (see the
// "sync assets" step in .github/workflows/deploy.yml). package/ stays the
// single source of truth for editing; this directory exists only because
// Wrangler's bundler resolves Text-import rules relative to this project's
// own directory, not across ../../ boundaries.
import navbarJs from "./src/navbar.js";
import footerJs from "./src/footer.js";
import i18nJs from "./src/i18n.js";
import cookieConsentJs from "./src/cookie-consent.js";
import navbarCss from "./src/navbar.css";
import footerCss from "./src/footer.css";
import globalCss from "./src/global.css";
import tokensCss from "./src/tokens.css";
import compatTokensCss from "./src/compat-tokens.css";
import cookieConsentCss from "./src/cookie-consent.css";

const JS_ASSETS = {
  "/js/navbar.js": navbarJs,
  "/js/footer.js": footerJs,
  "/js/i18n.js": i18nJs,
  "/js/cookie-consent.js": cookieConsentJs,
};

const CSS_ASSETS = {
  "/css/navbar.css": navbarCss,
  "/css/footer.css": footerCss,
  "/css/global.css": globalCss,
  "/css/tokens.css": tokensCss,
  "/css/compat-tokens.css": compatTokensCss,
  "/css/cookie-consent.css": cookieConsentCss,
};

// Cross-origin fetches from every *.mannamplace.com subdomain need this,
// since each app is a separate origin (its own Worker/subdomain).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (JS_ASSETS[url.pathname] !== undefined) {
      return new Response(JS_ASSETS[url.pathname], {
        headers: {
          "Content-Type": "application/javascript;charset=UTF-8",
          "Cache-Control": "public, max-age=300", // short cache while this is actively changing
          ...CORS_HEADERS,
        },
      });
    }

    if (CSS_ASSETS[url.pathname] !== undefined) {
      return new Response(CSS_ASSETS[url.pathname], {
        headers: {
          "Content-Type": "text/css;charset=UTF-8",
          "Cache-Control": "public, max-age=300",
          ...CORS_HEADERS,
        },
      });
    }

    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  },
};
