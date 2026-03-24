// ══════════════════════════════════════
// Mannamplace Navbar Component
// navbar.js
//
// 사용법:
// <script type="module">
//   import { initNavbar } from './navbar.js';
//   initNavbar({ variant: 'default' | 'portal' });
// </script>
// ══════════════════════════════════════

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const MP_CONFIG = {
  apiKey: "AIzaSyBBH5u-gGHmNK_SDjfSXI2mX-vYt8OJAtg",
  authDomain: "mannamplaceofficial.firebaseapp.com",
  projectId: "mannamplaceofficial",
  storageBucket: "mannamplaceofficial.firebasestorage.app",
  messagingSenderId: "877722323071",
  appId: "1:877722323071:web:fc82c7a5144a92e8e8574a"
};

// 서브사이트 목록
const SUBSITES = [
  { name: '커뮤니티', url: 'https://community.mannamplace.com', icon: '💬' },
  { name: 'TNfocnus 뉴스', url: 'https://tnfocnus.mannamplace.com', icon: '📰' },
  { name: 'Cistan', url: 'https://cistan.mannamplace.com', icon: '🌟' },
  { name: '마켓', url: 'https://market.mannamplace.com', icon: '🛒' },
  { name: '동영상', url: 'https://video.mannamplace.com', icon: '🎬' },
  { name: '뮤직', url: 'https://sound.mannamplace.com', icon: '🎵' },
];

// 현재 서비스명 감지
function detectService() {
  const host = location.hostname;
  if (host.includes('community')) return 'community';
  if (host.includes('tnfocnus')) return 'news';
  if (host.includes('cistan')) return 'cistan';
  if (host.includes('account')) return 'account';
  return 'portal';
}

// 쿠키 공유
function setAuthCookie(token) {
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `mp_token=${token}; domain=.mannamplace.com; path=/; secure; expires=${exp}`;
}
function clearAuthCookie() {
  document.cookie = 'mp_token=; domain=.mannamplace.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

// ── 메인 초기화 함수 ──
export async function initNavbar(options = {}) {
  const {
    variant = 'default',       // 'default' | 'portal'
    searchPlaceholder = '검색', // 검색창 placeholder
    onSearch = null,            // 검색 콜백 (keyword) => {}
    onLogin = null,             // 로그인 성공 콜백 (user, profile) => {}
    onLogout = null,            // 로그아웃 콜백
    showSearchTabs = false,     // 포털용 검색 탭 표시
    searchTabs = [],            // 검색 탭 목록
  } = options;

  // Firebase 초기화 (중복 방지)
  const app = getApps().length ? getApps()[0] : initializeApp(MP_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 네비바 DOM 주입
  const navbar = document.getElementById('mp-navbar');
  if (!navbar) return console.warn('[Navbar] #mp-navbar 요소가 없습니다.');

  navbar.className = `mp-navbar${variant === 'portal' ? ' mp-navbar--portal' : ''}`;

  navbar.innerHTML = `
    <a class="mp-navbar__logo" href="https://mannamplace.com">
      Mannam<em>place</em>
      <span class="mp-navbar__logo-sub">${detectService()}</span>
    </a>
    <div class="mp-navbar__search${variant === 'portal' ? ' mp-navbar__search--portal' : ''}">
      <span class="mp-navbar__search-ico">⌕</span>
      <input class="mp-navbar__search-inp" id="mp-search-inp" type="text"
        placeholder="${searchPlaceholder}"
        onkeydown="if(event.key==='Enter') window._mpNavSearch && window._mpNavSearch(this.value)">
      ${variant === 'portal' ? `<button class="mp-navbar__search-btn" onclick="window._mpNavSearch && window._mpNavSearch(document.getElementById('mp-search-inp').value)">검색</button>` : ''}
    </div>

    <!-- 비로그인 -->
    <div class="mp-navbar__right" id="mp-auth-area">
      <button class="mp-navbar__btn" onclick="window._mpOpenAuthModal && window._mpOpenAuthModal('login')">로그인</button>
      <button class="mp-navbar__btn mp-navbar__btn--primary" onclick="window._mpOpenAuthModal && window._mpOpenAuthModal('join')">가입하기</button>
    </div>

    <!-- 로그인 후 -->
    <div class="mp-navbar__right" id="mp-user-area" style="display:none">
      <div class="mp-navbar__notif" id="mp-notif-btn" onclick="window._mpToggleNotif && window._mpToggleNotif()">
        🔔<div class="mp-navbar__notif-badge" id="mp-notif-badge">0</div>
      </div>
      <div class="mp-navbar__dropdown-wrap">
        <div class="mp-navbar__profile" id="mp-profile-btn" onclick="window._mpTogglePD && window._mpTogglePD()">?</div>
        <div class="mp-navbar__dropdown" id="mp-dropdown">
          <div class="mp-navbar__dropdown-head">
            <div class="mp-navbar__dropdown-id" id="mp-dd-id">@-</div>
            <div class="mp-navbar__dropdown-name" id="mp-dd-name">-</div>
            <div class="mp-navbar__dropdown-badge" id="mp-dd-badge">일반회원</div>
          </div>
          <div class="mp-navbar__dropdown-menu">
            <div class="mp-navbar__dropdown-divider"></div>
            <div style="font-size:9px;color:var(--mp-text3);padding:4px 14px;font-family:var(--mp-font-mono);letter-spacing:1px">서비스 이동</div>
            ${SUBSITES.map(s => `<a class="mp-navbar__dropdown-item" href="${s.url}">${s.icon} ${s.name}</a>`).join('')}
            <div class="mp-navbar__dropdown-divider"></div>
            <a class="mp-navbar__dropdown-item" href="https://account.mannamplace.com">⚙️ 계정 설정</a>
            <a class="mp-navbar__dropdown-item mp-navbar__dropdown-item--danger" href="#" id="mp-logout-btn">로그아웃</a>
          </div>
        </div>
      </div>
    </div>`;

  // 검색 탭 (포털용)
  if (showSearchTabs && searchTabs.length) {
    const tabsEl = document.createElement('div');
    tabsEl.className = 'mp-search-tabs';
    tabsEl.innerHTML = searchTabs.map((t, i) =>
      `<button class="mp-search-tab ${i === 0 ? 'on' : ''}"
        onclick="document.querySelectorAll('.mp-search-tab').forEach(x=>x.classList.remove('on'));this.classList.add('on');window._mpSetSearchTab&&window._mpSetSearchTab('${t.value}')"
      >${t.label}</button>`
    ).join('');
    navbar.insertAdjacentElement('afterend', tabsEl);
  }

  // 검색 콜백 등록
  if (onSearch) {
    window._mpNavSearch = onSearch;
  }

  // 드롭다운 토글
  window._mpTogglePD = (forceClose = false) => {
    const dd = document.getElementById('mp-dropdown');
    if (!dd) return;
    if (forceClose) dd.classList.remove('open');
    else dd.classList.toggle('open');
  };

  // 드롭다운 외부 클릭 닫기
  document.addEventListener('click', e => {
    const btn = document.getElementById('mp-profile-btn');
    const dd = document.getElementById('mp-dropdown');
    if (btn && dd && !btn.contains(e.target) && !dd.contains(e.target)) {
      dd.classList.remove('open');
    }
  });

  // 로그아웃
  document.getElementById('mp-logout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    clearAuthCookie();
    await signOut(auth);
    window._mpTogglePD(true);
    if (onLogout) onLogout();
  });

  // Auth 상태 감지
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const token = await fbUser.getIdToken();
      setAuthCookie(token);

      const snap = await getDoc(doc(db, "users", fbUser.uid));
      const profile = snap.exists() ? snap.data() : {};
      const nick = profile?.profiles?.community?.nick || fbUser.email?.split('@')[0] || 'user';
      const rank = profile?.profiles?.news?.rank || '일반회원';
      const mpId = profile?.mpId || fbUser.uid.substring(0, 8);

      // UI 업데이트
      document.getElementById('mp-auth-area').style.display = 'none';
      document.getElementById('mp-user-area').style.display = 'flex';
      document.getElementById('mp-profile-btn').textContent = nick.charAt(0).toUpperCase();
      document.getElementById('mp-dd-id').textContent = '@' + mpId;
      document.getElementById('mp-dd-name').textContent = nick;
      document.getElementById('mp-dd-badge').textContent = rank;

      // 콜백
      if (onLogin) onLogin(fbUser, profile);

      // window에 현재 유저 노출 (각 사이트에서 참조용)
      window.mpUser = fbUser;
      window.mpProfile = profile;
    } else {
      clearAuthCookie();
      document.getElementById('mp-auth-area').style.display = 'flex';
      document.getElementById('mp-user-area').style.display = 'none';
      window.mpUser = null;
      window.mpProfile = null;
    }
  });
}

// ── 토스트 유틸 (전역 노출) ──
export function showToast(msg, type = '') {
  let t = document.getElementById('mp-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'mp-toast';
    t.className = 'mp-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `mp-toast show${type ? ' ' + type : ''}`;
  clearTimeout(window._mpToastTimer);
  window._mpToastTimer = setTimeout(() => { t.className = 'mp-toast'; }, 3000);
}
window.mpShowToast = showToast;
