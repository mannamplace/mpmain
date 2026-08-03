// ══════════════════════════════════════
// Mannamplace i18n Core
// i18n.js
//
// 사용법:
// <script type="module">
//   import { initI18n, t, setLocale, getLocale } from './i18n.js';
//   await initI18n();
//   document.getElementById('greeting').textContent = t('nav.login');
// </script>
//
// 설계 메모:
// - 현재 완전히 번역된 언어는 ko/en 뿐입니다. footer.js의 언어 선택창에는
//   ja/zh/es도 표시되지만, 실제 번역 데이터가 채워지기 전까지는 선택 시
//   자동으로 en으로 폴백하고 콘솔에 경고를 남깁니다. 새 언어를 추가하려면
//   SUPPORTED_LOCALES에 추가하고 COMMON에 해당 언어 키를 채우세요.
// - Market/Pay/Video 등 자체 페이지 콘텐츠(상품명, 게시글 본문 등)는
//   이 모듈의 범위가 아닙니다. 이 모듈은 모든 앱이 공유하는 nav/footer
//   "chrome" 문자열과, 페이지가 원하면 가져다 쓸 수 있는 t() 함수를
//   제공합니다. 개별 앱 문자열은 initI18n({ extra: {...} })로 병합하세요.
// ══════════════════════════════════════

export const SUPPORTED_LOCALES = ["ko", "en"]; // 완전 지원. ja/zh/es는 준비 중.
const DEFAULT_LOCALE = "en";
const STORAGE_KEY = "mp_lang";

// 여러 앱(navbar.js, footer.js)이 공통으로 쓰는 문자열.
// 앱별 문자열은 initI18n({ extra })로 병합해서 쓰세요.
const COMMON = {
  ko: {
    "nav.login": "로그인",
    "nav.join": "가입하기",
    "nav.search": "검색",
    "nav.accountSettings": "계정 설정",
    "nav.logout": "로그아웃",
    "nav.notifications": "알림",
    "nav.rank.normal": "일반회원",
    "nav.serviceSwitch": "서비스 이동",
    "footer.tagline": "전 세계가 모이는\n다언어 커뮤니티 플랫폼",
    "footer.servicesHeading": "Services",
    "footer.companyHeading": "Company",
    "footer.supportHeading": "Support",
    "footer.copyright": "전체 권리 보유.",
    "footer.privacy": "개인정보처리방침",
    "footer.terms": "이용약관",
    "footer.cookies": "쿠키 정책",
    "footer.company.about": "회사 소개",
    "footer.company.jobs": "채용",
    "footer.company.ads": "광고 문의",
    "footer.company.partnership": "제휴 문의",
    "footer.company.notice": "공지사항",
    "footer.support.center": "고객센터",
    "footer.support.report": "신고 센터",
    "botnav.home": "홈",
    "botnav.community": "커뮤",
    "botnav.search": "검색",
    "botnav.market": "마켓",
    "botnav.my": "MY",
    "service.community": "커뮤니티",
    "service.news": "TNfocnus 뉴스",
    "service.cistan": "Cistan",
    "service.market": "마켓",
    "service.video": "동영상",
    "service.sound": "뮤직 Sound",
    "service.toon": "웹툰 Toon",
    "service.games": "게임",
    "badge.new": "NEW",
    "badge.comingSoon": "준비중",
  },
  en: {
    "nav.login": "Log in",
    "nav.join": "Sign up",
    "nav.search": "Search",
    "nav.accountSettings": "Account settings",
    "nav.logout": "Log out",
    "nav.notifications": "Notifications",
    "nav.rank.normal": "Member",
    "nav.serviceSwitch": "Switch service",
    "footer.tagline": "A multilingual community platform\nwhere the world connects.",
    "footer.servicesHeading": "Services",
    "footer.companyHeading": "Company",
    "footer.supportHeading": "Support",
    "footer.copyright": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookie Policy",
    "footer.company.about": "About",
    "footer.company.jobs": "Careers",
    "footer.company.ads": "Advertise",
    "footer.company.partnership": "Partnerships",
    "footer.company.notice": "Notices",
    "footer.support.center": "Support Center",
    "footer.support.report": "Report Center",
    "botnav.home": "Home",
    "botnav.community": "Community",
    "botnav.search": "Search",
    "botnav.market": "Market",
    "botnav.my": "My",
    "service.community": "Community",
    "service.news": "TNfocnus News",
    "service.cistan": "Cistan",
    "service.market": "Market",
    "service.video": "Video",
    "service.sound": "Sound (Music)",
    "service.toon": "Toon (Webtoons)",
    "service.games": "Games",
    "badge.new": "NEW",
    "badge.comingSoon": "Coming soon",
  },
};

let currentLocale = DEFAULT_LOCALE;
let dictionary = COMMON;
const listeners = new Set();

function normalize(lang) {
  if (!lang) return null;
  const short = lang.toLowerCase().split("-")[0];
  return SUPPORTED_LOCALES.includes(short) ? short : null;
}

// 우선순위: 명시적 override > 저장된 사용자 설정 > 브라우저 언어 > 기본값(en)
function detectLocale({ override = null } = {}) {
  if (override) {
    const norm = normalize(override);
    if (norm) return norm;
    console.warn(`[i18n] "${override}" not fully supported yet, falling back to ${DEFAULT_LOCALE}`);
    return DEFAULT_LOCALE;
  }
  try {
    const stored = normalize(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch {
    /* localStorage unavailable (privacy mode etc.) — ignore */
  }
  const nav = normalize(navigator.language);
  if (nav) return nav;
  return DEFAULT_LOCALE;
}

function applyDocumentLang(locale) {
  document.documentElement.lang = locale;
}

export function t(key, fallback = key) {
  return dictionary[currentLocale]?.[key] ?? dictionary[DEFAULT_LOCALE]?.[key] ?? fallback;
}

export function getLocale() {
  return currentLocale;
}

export function onLocaleChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// persist:true (기본) — 이 브라우저에 앞으로도 적용. 로그인 상태라면
// Firestore users/{uid}.locale에도 best-effort로 반영해 기기 간 일관성 확보.
export async function setLocale(lang, { persist = true } = {}) {
  const norm = normalize(lang) || DEFAULT_LOCALE;
  currentLocale = norm;
  applyDocumentLang(norm);
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, norm);
    } catch {
      /* ignore */
    }
    await persistToProfileIfLoggedIn(norm);
  }
  listeners.forEach((cb) => cb(norm));
  return norm;
}

// navbar.js가 로그인 시 window.mpUser / window.mpProfile을 채워두므로
// 그 값이 있을 때만 시도. 실패해도 UX를 막지 않도록 조용히 무시.
async function persistToProfileIfLoggedIn(locale) {
  if (!window.mpUser) return;
  try {
    const [{ getApps }, { getFirestore, doc, setDoc }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"),
    ]);
    const apps = getApps();
    if (!apps.length) return;
    const db = getFirestore(apps[0]);
    await setDoc(doc(db, "users", window.mpUser.uid), { locale }, { merge: true });
  } catch (e) {
    console.warn("[i18n] could not persist locale to profile:", e?.message || e);
  }
}

/**
 * initI18n({ extra }) — extra: { ko: {...}, en: {...} } app-specific strings merged
 * on top of COMMON. Call once per page, before rendering nav/footer.
 */
export async function initI18n(options = {}) {
  const { extra = null, override = null } = options;

  dictionary = extra
    ? {
        ko: { ...COMMON.ko, ...(extra.ko || {}) },
        en: { ...COMMON.en, ...(extra.en || {}) },
      }
    : COMMON;

  // 로그인 사용자의 저장된 선호 언어가 있으면 우선 적용 (navbar.js가
  // 먼저 초기화되어 window.mpProfile을 채운 경우에만 유효 — 순서에 유의).
  const profileLocale = window.mpProfile?.locale ? normalize(window.mpProfile.locale) : null;

  const locale = profileLocale || detectLocale({ override });
  currentLocale = locale;
  applyDocumentLang(locale);
  return locale;
}
