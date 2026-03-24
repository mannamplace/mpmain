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

// 서비스 링크 목록
const SERVICES = [
  { name: '커뮤니티', url: 'https://community.mannamplace.com' },
  { name: 'TNfocnus 뉴스', url: 'https://tnfocnus.mannamplace.com' },
  { name: 'Cistan', url: 'https://cistan.mannamplace.com', badge: 'NEW' },
  { name: '동영상', url: 'https://video.mannamplace.com', badge: '준비중' },
  { name: '뮤직 Sound', url: 'https://sound.mannamplace.com', badge: '준비중' },
  { name: '웹툰 Toon', url: 'https://toon.mannamplace.com', badge: '준비중' },
  { name: '마켓', url: 'https://market.mannamplace.com', badge: '준비중' },
  { name: '게임', url: 'https://games.mannamplace.com', badge: '준비중' },
];

const COMPANY = [
  { name: '회사 소개', url: 'https://mannamplace.com/about' },
  { name: '채용', url: 'https://mannamplace.com/jobs' },
  { name: '광고 문의', url: 'https://mannamplace.com/ads' },
  { name: '제휴 문의', url: 'mailto:hello@mannamplace.com' },
  { name: '공지사항', url: 'https://mannamplace.com/notice' },
];

const SUPPORT = [
  { name: '고객센터', url: 'mailto:support@mannamplace.com' },
  { name: '신고 센터', url: 'https://mannamplace.com/report' },
  { name: '개인정보 처리방침', url: 'https://mannamplace.com/privacy' },
  { name: '이용약관', url: 'https://mannamplace.com/terms' },
  { name: '쿠키 정책', url: 'https://mannamplace.com/cookies' },
];

// ── 메인 초기화 함수 ──
export function initFooter(options = {}) {
  const {
    botNavItems = null, // 모바일 탭바 아이템 커스텀
  } = options;

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
              전 세계가 모이는<br>
              다언어 커뮤니티 플랫폼
            </div>
            <div class="mp-footer__social">
              <a class="mp-footer__social-btn" href="mailto:hello@mannamplace.com" title="이메일">✉️</a>
              <a class="mp-footer__social-btn" href="https://community.mannamplace.com" title="커뮤니티">💬</a>
              <a class="mp-footer__social-btn" href="https://tnfocnus.mannamplace.com" title="뉴스">📰</a>
            </div>
          </div>

          <!-- 서비스 -->
          <div class="mp-footer__col">
            <div class="mp-footer__col-title">Services</div>
            <ul class="mp-footer__links">
              ${SERVICES.map(s => `
                <li>
                  <a class="mp-footer__link" href="${s.url}">
                    ${s.name}
                    ${s.badge ? `<span class="mp-footer__link--badge">${s.badge}</span>` : ''}
                  </a>
                </li>`).join('')}
            </ul>
          </div>

          <!-- 회사 -->
          <div class="mp-footer__col">
            <div class="mp-footer__col-title">Company</div>
            <ul class="mp-footer__links">
              ${COMPANY.map(c => `
                <li><a class="mp-footer__link" href="${c.url}">${c.name}</a></li>
              `).join('')}
            </ul>
          </div>

          <!-- 지원 -->
          <div class="mp-footer__col">
            <div class="mp-footer__col-title">Support</div>
            <ul class="mp-footer__links">
              ${SUPPORT.map(s => `
                <li><a class="mp-footer__link" href="${s.url}">${s.name}</a></li>
              `).join('')}
            </ul>
          </div>

        </div>

        <!-- 하단 바 -->
        <div class="mp-footer__bottom">
          <div class="mp-footer__copyright">
            © ${new Date().getFullYear()} <span>Mannamplace</span>. All rights reserved.
          </div>
          <div class="mp-footer__policies">
            <a class="mp-footer__policy" href="https://mannamplace.com/privacy">개인정보처리방침</a>
            <a class="mp-footer__policy" href="https://mannamplace.com/terms">이용약관</a>
          </div>
          <div class="mp-footer__lang">
            <span style="font-size:10px;color:var(--mp-text3)">🌐</span>
            <select class="mp-footer__lang-select" onchange="changeLang(this.value)">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
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
      { ico: '🏠', lbl: '홈',    url: 'https://mannamplace.com' },
      { ico: '💬', lbl: '커뮤',  url: 'https://community.mannamplace.com' },
      { ico: '🔍', lbl: '검색',  action: 'search' },
      { ico: '🛒', lbl: '마켓',  url: 'https://market.mannamplace.com' },
      { ico: '👤', lbl: 'MY',    action: 'profile' },
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
window.changeLang = function(lang) {
  localStorage.setItem('mp_lang', lang);
  // Google Translate 연동 시 여기에 추가
};
