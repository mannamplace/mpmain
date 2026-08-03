// ══════════════════════════════════════
// Mannamplace Footer Component
// footer.js
//
// 사용법:
// <script type="module">
//   import { initFooter } from './footer.js';
//   initFooter();
// </script>
// <div id="mp-footer"></div>
// <nav id="mp-bot-nav"></nav>  ← 모바일 탭바 (선택)
// ══════════════════════════════════════

import { initI18n, t, getLocale, setLocale, SUPPORTED_LOCALES } from "./i18n.js";

// 서비스 링크 목록 (name은 i18n 키 — 렌더 시 t()로 치환)
const SERVICES = [
  { key: 'service.community', url: 'https://community.mannamplace.com' },
  { key: 'service.news', url: 'https://tnfocnus.mannamplace.com' },
  { key: 'service.cistan', url: 'https://cistan.mannamplace.com', badgeKey: 'badge.new' },
  { key: 'service.video', url: 'https://video.mannamplace.com', badgeKey: 'badge.comingSoon' },
  { key: 'service.sound', url: 'https://sound.mannamplace.com', badgeKey: 'badge.comingSoon' },
  { key: 'service.toon', url: 'https://toon.mannamplace.com', badgeKey: 'badge.comingSoon' },
  { key: 'service.market', url: 'https://market.mannamplace.com', badgeKey: 'badge.comingSoon' },
  { key: 'service.games', url: 'https://games.mannamplace.com', badgeKey: 'badge.comingSoon' },
];

const COMPANY = [
  { key: 'footer.company.about', url: 'https://mannamplace.com/about' },
  { key: 'footer.company.jobs', url: 'https://mannamplace.com/jobs' },
  { key: 'footer.company.ads', url: 'https://mannamplace.com/ads' },
  { key: 'footer.company.partnership', url: 'mailto:hello@mannamplace.com' },
  { key: 'footer.company.notice', url: 'https://mannamplace.com/notice' },
];

const SUPPORT = [
  { key: 'footer.support.center', url: 'mailto:support@mannamplace.com' },
  { key: 'footer.support.report', url: 'https://mannamplace.com/report' },
  { key: 'footer.privacy', url: 'https://mannamplace.com/privacy' },
  { key: 'footer.terms', url: 'https://mannamplace.com/terms' },
  { key: 'footer.cookies', url: 'https://mannamplace.com/cookies' },
];

// ── 메인 초기화 함수 ──
export async function initFooter(options = {}) {
  const {
    botNavItems = null, // 모바일 탭바 아이템 커스텀
    i18nExtra = null,   // 앱별 추가 번역
  } = options;

  await initI18n({ extra: i18nExtra });
  const locale = getLocale();

  // 푸터 렌더
  const footer = document.getElementById('mp-footer');
  if (footer) {
    footer.className = 'mp-footer';
    footer.innerHTML = `
      <div class="mp-footer__inner">

        <!-- 상단 그리드 -->
        <div class="mp-footer__grid">

          <!-- 브랜드 -->
          <div class="mp-footer__brand">
            <a class="mp-footer__logo" href="https://mannamplace.com">
              Mannam<em>place</em>
            </a>
            <div class="mp-footer__tagline">
              ${t('footer.tagline').split('\n').join('<br>')}
            </div>
            <div class="mp-footer__social">
              <a class="mp-footer__social-btn" href="mailto:hello@mannamplace.com" title="Email">✉️</a>
              <a class="mp-footer__social-btn" href="https://community.mannamplace.com" title="${t('service.community')}">💬</a>
              <a class="mp-footer__social-btn" href="https://tnfocnus.mannamplace.com" title="${t('service.news')}">📰</a>
            </div>
          </div>

          <!-- 서비스 -->
          <div class="mp-footer__col">
            <div class="mp-footer__col-title">${t('footer.servicesHeading')}</div>
            <ul class="mp-footer__links">
              ${SERVICES.map(s => `
                <li>
                  <a class="mp-footer__link" href="${s.url}">
                    ${t(s.key)}
                    ${s.badgeKey ? `<span class="mp-footer__link--badge">${t(s.badgeKey)}</span>` : ''}
                  </a>
                </li>`).join('')}
            </ul>
          </div>

          <!-- 회사 -->
          <div class="mp-footer__col">
            <div class="mp-footer__col-title">${t('footer.companyHeading')}</div>
            <ul class="mp-footer__links">
              ${COMPANY.map(c => `
                <li><a class="mp-footer__link" href="${c.url}">${t(c.key)}</a></li>
              `).join('')}
            </ul>
          </div>

          <!-- 지원 -->
          <div class="mp-footer__col">
            <div class="mp-footer__col-title">${t('footer.supportHeading')}</div>
            <ul class="mp-footer__links">
              ${SUPPORT.map(s => `
                <li><a class="mp-footer__link" href="${s.url}">${t(s.key)}</a></li>
              `).join('')}
            </ul>
          </div>

        </div>

        <!-- 하단 바 -->
        <div class="mp-footer__bottom">
          <div class="mp-footer__copyright">
            © ${new Date().getFullYear()} <span>Mannamplace</span>. ${t('footer.copyright')}
          </div>
          <div class="mp-footer__policies">
            <a class="mp-footer__policy" href="https://mannamplace.com/privacy">${t('footer.privacy')}</a>
            <a class="mp-footer__policy" href="https://mannamplace.com/terms">${t('footer.terms')}</a>
          </div>
          <div class="mp-footer__lang">
            <span style="font-size:10px;color:var(--mp-text3)">🌐</span>
            <select class="mp-footer__lang-select" id="mp-lang-select" onchange="window.changeLang(this.value)">
              <option value="ko" ${locale === 'ko' ? 'selected' : ''}>한국어</option>
              <option value="en" ${locale === 'en' ? 'selected' : ''}>English</option>
              <option value="ja">日本語 (${t('badge.comingSoon')})</option>
              <option value="zh">中文 (${t('badge.comingSoon')})</option>
              <option value="es">Español (${t('badge.comingSoon')})</option>
            </select>
          </div>
        </div>

      </div>`;
  }

  // 모바일 탭바 렌더
  const botNav = document.getElementById('mp-bot-nav');
  if (botNav) {
    botNav.className = 'mp-bot-nav';
    const items = botNavItems || [
      { ico: '🏠', lbl: t('botnav.home'),      url: 'https://mannamplace.com' },
      { ico: '💬', lbl: t('botnav.community'), url: 'https://community.mannamplace.com' },
      { ico: '🔍', lbl: t('botnav.search'),    action: 'search' },
      { ico: '🛒', lbl: t('botnav.market'),    url: 'https://market.mannamplace.com' },
      { ico: '👤', lbl: t('botnav.my'),        action: 'profile' },
    ];

    botNav.innerHTML = items.map((item, i) => `
      <div class="mp-bot-nav__item ${i === 0 ? 'on' : ''}"
        onclick="${item.url ? `location.href='${item.url}'` : `window._mpBotNavAction && window._mpBotNavAction('${item.action}')`};
                 document.querySelectorAll('.mp-bot-nav__item').forEach(x=>x.classList.remove('on'));
                 this.classList.add('on')">
        <div class="mp-bot-nav__ico">${item.ico}</div>
        <div class="mp-bot-nav__lbl">${item.lbl}</div>
      </div>`).join('');
  }
}

// ── 언어 변경 (전역) ──
// 셀렉트에서 선택 시 실제로 로케일을 반영: localStorage 저장 + (로그인 시) 프로필에 반영 후
// 페이지를 새로고침해 nav/footer/페이지 전체를 새 언어로 다시 렌더링.
// SPA 방식의 무새로고침 전환은 각 앱이 자체 콘텐츠까지 i18n화된 뒤 고려할 후속 작업.
window.changeLang = async function (lang) {
  if (!SUPPORTED_LOCALES.includes(lang)) {
    console.warn(`[footer] "${lang}" isn't fully translated yet — staying on current language.`);
    const select = document.getElementById('mp-lang-select');
    if (select) select.value = getLocale();
    return;
  }
  await setLocale(lang);
  location.reload();
};
