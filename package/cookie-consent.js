// ══════════════════════════════════════
// Mannamplace Cookie Consent Component
// cookie-consent.js
//
// 사용법:
// <link rel="stylesheet" href="/shared/css/cookie-consent.css">
// <script type="module">
//   import { initCookieConsent } from './cookie-consent.js';
//   initCookieConsent();
// </script>
//
// GDPR / 개인정보보호법(PIPA) 대응:
// - 필수(essential) 쿠키는 항상 허용, 그 외 카테고리는 명시적 동의 전까지 차단
// - 동의 기록을 로컬(localStorage)과 Firestore(감사 로그용)에 모두 저장
// - "설정 변경" 진입점을 항상 노출 (footer의 "쿠키 정책" 링크에서 재호출 가능)
// ══════════════════════════════════════

const STORAGE_KEY = "mp_cookie_consent";
const CONSENT_VERSION = 1; // 정책 문구가 실질적으로 바뀌면 올려서 재동의를 유도

const CATEGORIES = [
  {
    id: "essential",
    locked: true, // 항상 on, 토글 불가
    label: { ko: "필수", en: "Essential" },
    desc: {
      ko: "로그인 유지, 보안, 기본 기능 제공에 필요합니다. 비활성화할 수 없습니다.",
      en: "Required for login, security, and core functionality. Cannot be disabled.",
    },
  },
  {
    id: "analytics",
    locked: false,
    label: { ko: "분석", en: "Analytics" },
    desc: {
      ko: "서비스 이용 통계를 수집해 기능 개선에 활용합니다.",
      en: "Helps us understand usage so we can improve the service.",
    },
  },
  {
    id: "marketing",
    locked: false,
    label: { ko: "마케팅", en: "Marketing" },
    desc: {
      ko: "관심사 기반 추천 및 광고 성과 측정에 사용됩니다.",
      en: "Used for interest-based recommendations and ad measurement.",
    },
  },
];

const STRINGS = {
  ko: {
    title: "쿠키 사용에 대한 안내",
    body: "Mannamplace는 서비스 제공과 개선을 위해 쿠키를 사용합니다. 필수 쿠키 외에는 동의하신 항목만 사용됩니다.",
    acceptAll: "모두 동의",
    rejectAll: "필수만 허용",
    manage: "설정 관리",
    save: "선택 항목 저장",
    back: "뒤로",
    policyLink: "쿠키 정책 자세히 보기",
  },
  en: {
    title: "Cookie preferences",
    body: "Mannamplace uses cookies to provide and improve the service. Only categories you consent to (beyond essential) will be used.",
    acceptAll: "Accept all",
    rejectAll: "Essential only",
    manage: "Manage preferences",
    save: "Save selection",
    back: "Back",
    policyLink: "Read the full cookie policy",
  },
};

function detectLang() {
  const stored = localStorage.getItem("mp_lang");
  if (stored) return stored.startsWith("ko") ? "ko" : "en";
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("ko") ? "ko" : "en";
}

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null; // 정책 버전 변경 시 재동의 요구
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(categories) {
  const record = {
    version: CONSENT_VERSION,
    categories,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  document.dispatchEvent(new CustomEvent("mp:cookie-consent", { detail: record }));
  logConsentToFirestore(record);
  return record;
}

// 감사 추적용 로그. 실패해도 UX를 막지 않도록 조용히 무시.
async function logConsentToFirestore(record) {
  try {
    const mod = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js");
    const appMod = await import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js");
    const apps = appMod.getApps();
    if (!apps.length) return; // navbar.js가 먼저 초기화하지 않았으면 조용히 스킵
    const db = mod.getFirestore(apps[0]);
    const anonId = localStorage.getItem("mp_anon_id") || crypto.randomUUID();
    localStorage.setItem("mp_anon_id", anonId);
    await mod.setDoc(mod.doc(db, "cookie_consent_logs", `${anonId}_${Date.now()}`), {
      anonId,
      categories: record.categories,
      version: record.version,
      timestamp: record.timestamp,
      path: location.pathname,
    });
  } catch (e) {
    // 네트워크/권한 문제는 배너 동작을 막으면 안 되므로 콘솔 경고만
    console.warn("cookie consent log skipped:", e?.message || e);
  }
}

export function getConsent() {
  const record = readConsent();
  if (!record) return null;
  return record.categories;
}

export function hasConsent(categoryId) {
  const cats = getConsent();
  if (!cats) return categoryId === "essential"; // 아직 결정 전이면 필수만 true
  return !!cats[categoryId];
}

export function initCookieConsent(options = {}) {
  const { lang = detectLang(), onChange = null } = options;
  const t = STRINGS[lang] || STRINGS.en;

  if (onChange) {
    document.addEventListener("mp:cookie-consent", (e) => onChange(e.detail.categories));
  }

  const existing = readConsent();
  if (existing) {
    if (onChange) onChange(existing.categories);
    return; // 이미 동의 기록이 있으면 배너를 다시 띄우지 않음
  }

  renderBanner(t, lang);
}

// footer의 "쿠키 정책" 링크 등에서 언제든 설정 화면을 다시 열 수 있도록 별도 export
export function openCookieSettings(options = {}) {
  const { lang = detectLang() } = options;
  const t = STRINGS[lang] || STRINGS.en;
  renderPanel(t, lang, { standalone: true });
}

function renderBanner(t, lang) {
  const root = document.createElement("div");
  root.className = "mp-cookie-banner";
  root.innerHTML = `
    <div class="mp-cookie-banner__inner">
      <div class="mp-cookie-banner__text">
        <strong>${t.title}</strong>
        <p>${t.body} <a href="/cookies" class="mp-cookie-banner__link">${t.policyLink}</a></p>
      </div>
      <div class="mp-cookie-banner__actions">
        <button class="mp-cookie-btn mp-cookie-btn--ghost" data-action="manage">${t.manage}</button>
        <button class="mp-cookie-btn mp-cookie-btn--ghost" data-action="reject">${t.rejectAll}</button>
        <button class="mp-cookie-btn mp-cookie-btn--primary" data-action="accept">${t.acceptAll}</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  root.querySelector('[data-action="accept"]').addEventListener("click", () => {
    const all = Object.fromEntries(CATEGORIES.map((c) => [c.id, true]));
    writeConsent(all);
    root.remove();
  });

  root.querySelector('[data-action="reject"]').addEventListener("click", () => {
    const onlyEssential = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.locked]));
    writeConsent(onlyEssential);
    root.remove();
  });

  root.querySelector('[data-action="manage"]').addEventListener("click", () => {
    root.remove();
    renderPanel(t, lang);
  });
}

function renderPanel(t, lang, { standalone = false } = {}) {
  const existing = readConsent();
  const current =
    existing?.categories || Object.fromEntries(CATEGORIES.map((c) => [c.id, c.locked]));

  const overlay = document.createElement("div");
  overlay.className = "mp-cookie-overlay";
  overlay.innerHTML = `
    <div class="mp-cookie-panel">
      <div class="mp-cookie-panel__header">
        <strong>${t.title}</strong>
      </div>
      <div class="mp-cookie-panel__list">
        ${CATEGORIES.map(
          (c) => `
          <div class="mp-cookie-row">
            <div class="mp-cookie-row__head">
              <span>${c.label[lang] || c.label.en}</span>
              <label class="mp-cookie-toggle">
                <input type="checkbox" data-cat="${c.id}" ${current[c.id] ? "checked" : ""} ${
                  c.locked ? "disabled checked" : ""
                }>
                <span class="mp-cookie-toggle__slider"></span>
              </label>
            </div>
            <p class="mp-cookie-row__desc">${c.desc[lang] || c.desc.en}</p>
          </div>`
        ).join("")}
      </div>
      <div class="mp-cookie-panel__actions">
        ${standalone ? "" : `<button class="mp-cookie-btn mp-cookie-btn--ghost" data-action="back">${t.back}</button>`}
        <button class="mp-cookie-btn mp-cookie-btn--primary" data-action="save">${t.save}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('[data-action="save"]').addEventListener("click", () => {
    const categories = {};
    overlay.querySelectorAll("input[data-cat]").forEach((input) => {
      categories[input.dataset.cat] = input.checked;
    });
    writeConsent(categories);
    overlay.remove();
  });

  const backBtn = overlay.querySelector('[data-action="back"]');
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      overlay.remove();
      renderBanner(t, lang);
    });
  }
}
