
// FEUDAL GRAND STRATEGY - Full Game Prototype
// Covers: Loading → Login → Main Menu → New Game (Map) → Game
// Features: Feudal titles, succession, marriage, cabinet, laws, culture, religion, tech, war, traits, bastards

import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const ERAS = [
  { id: "medieval", label: "중세", range: "476 – 1453", color: "#8B4513" },
  { id: "early_modern", label: "근세", range: "1453 – 1900", color: "#4A7C59" },
  { id: "modern", label: "현대", range: "1900 – 2020", color: "#2E4057" },
];

const FEUDAL_RANKS = [
  { id: "emperor", label: "황제", latin: "Imperator", tier: 5 },
  { id: "king", label: "왕", latin: "Rex", tier: 4 },
  { id: "duke", label: "공작", latin: "Dux", tier: 3 },
  { id: "count", label: "백작", latin: "Comes", tier: 2 },
  { id: "viscount", label: "자작", latin: "Vicecomes", tier: 1.5 },
  { id: "baron", label: "남작", latin: "Baro", tier: 1 },
];

const SUCCESSION_LAWS = [
  { id: "salic", label: "살리카 법", desc: "남성 직계만 상속" },
  { id: "male_preference", label: "아들 우선", desc: "아들 우선, 없으면 딸" },
  { id: "absolute_cognatic", label: "절대적 맏이", desc: "성별 무관 장자 상속" },
  { id: "partition", label: "분할 상속", desc: "모든 자식에게 분할" },
  { id: "vassal_election", label: "봉신 간 선거", desc: "봉신들이 후계자 선출" },
  { id: "family_election", label: "가문 내 선거", desc: "가문 내에서 선출" },
  { id: "designated", label: "왕의 지명", desc: "군주가 직접 지명 (고왕권)" },
];

const RELIGIONS = [
  { id: "catholic", label: "가톨릭", color: "#FFD700", icon: "✝" },
  { id: "orthodox", label: "정교회", color: "#4169E1", icon: "☦" },
  { id: "islam_sunni", label: "수니 이슬람", color: "#00C800", icon: "☪" },
  { id: "islam_shia", label: "시아 이슬람", color: "#009000", icon: "☪" },
  { id: "pagan", label: "이교도", color: "#8B4513", icon: "⚡" },
  { id: "jewish", label: "유대교", color: "#0038B8", icon: "✡" },
];

const CULTURES = [
  { id: "frankish", label: "프랑크", group: "서유럽" },
  { id: "norman", label: "노르만", group: "서유럽" },
  { id: "german", label: "게르만", group: "중부유럽" },
  { id: "byzantine", label: "비잔틴", group: "동유럽" },
  { id: "slavic", label: "슬라브", group: "동유럽" },
  { id: "norse", label: "노르세", group: "북유럽" },
  { id: "arab", label: "아랍", group: "중동" },
  { id: "persian", label: "페르시아", group: "중동" },
];

const TECH_CATEGORIES = [
  { id: "military", label: "군사", icon: "⚔" },
  { id: "economy", label: "경제", icon: "💰" },
  { id: "religion", label: "종교", icon: "⛪" },
  { id: "culture", label: "문화", icon: "🎭" },
  { id: "printing", label: "출판", icon: "📜" },
  { id: "music", label: "음악", icon: "🎵" },
];

const MILITARY_UNITS = [
  { id: "cavalry", label: "기병", icon: "🐴", attack: 8, defense: 5, cost: 80 },
  { id: "infantry", label: "보병", icon: "🗡", attack: 5, defense: 7, cost: 40 },
  { id: "spearman", label: "창병", icon: "🔱", attack: 6, defense: 8, cost: 50 },
  { id: "archer", label: "궁병", icon: "🏹", attack: 7, defense: 3, cost: 45 },
  { id: "siege", label: "공성대", icon: "⚙", attack: 10, defense: 2, cost: 120 },
];

const CABINET_ROLES = [
  { id: "chancellor", label: "재상", icon: "📋", stat: "intelligence" },
  { id: "marshal", label: "대장군", icon: "⚔", stat: "martial" },
  { id: "treasurer", label: "재정관", icon: "💰", stat: "stewardship" },
  { id: "spymaster", label: "국가정보관", icon: "🔍", stat: "intrigue" },
];

const BASTARD_RECOGNITION = [
  { id: "pregnancy", label: "임신 사실을 안 시점" },
  { id: "birth", label: "출생 시점" },
  { id: "anytime", label: "생전 어느 때나" },
  { id: "deathbed", label: "죽기 직전" },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generatePerson(overrides = {}) {
  const innateInt = rand(3, 12); // 선천적 지력
  const learnedInt = rand(0, 8); // 후천적 지력
  return {
    id: Math.random().toString(36).slice(2),
    name: overrides.name || randItem(["알렉산더", "이사벨라", "하인리히", "마그누스", "엘레오노르", "고트프리트", "아그네스", "볼데마르"]),
    dynasty: overrides.dynasty || randItem(["카페", "호엔슈타우펜", "플란타게넷", "아르파드", "피아스트"]),
    age: overrides.age ?? rand(16, 60),
    sex: overrides.sex ?? (Math.random() > 0.5 ? "male" : "female"),
    innateIntelligence: innateInt,
    learnedIntelligence: learnedInt,
    intelligence: innateInt + learnedInt,
    martial: rand(2, 15),
    stewardship: rand(2, 15),
    intrigue: rand(2, 15),
    diplomacy: rand(2, 15),
    traits: [],
    spouse: null,
    betrothed: null,
    children: [],
    bastards: [],
    isBastard: false,
    isLegitimized: false,
    rank: overrides.rank || "count",
    ...overrides,
  };
}

function generateRealm(nation) {
  const ruler = generatePerson({ name: nation.ruler, rank: nation.rank, age: rand(18, 55) });
  return {
    ...nation,
    ruler,
    treasury: rand(200, 800),
    manpower: rand(500, 3000),
    tech: { military: 1, economy: 1, religion: 1, culture: 1, printing: 0, music: 0 },
    laws: {
      centralization: 1,
      vassalDiplomacy: true,
      vassalWar: true,
      nobleTax: 0.1,
      merchantTax: 0.15,
      churchTax: 0.05,
    },
    succession: randItem(SUCCESSION_LAWS).id,
    cabinet: { chancellor: null, marshal: null, treasurer: null, spymaster: null },
    army: [],
    relations: [],
  };
}

// ─── MAP NATIONS ─────────────────────────────────────────────────────────────

const MAP_NATIONS = [
  { id: "france", label: "프랑스 왕국", ruler: "카페의 루이", rank: "king", religion: "catholic", culture: "frankish", x: 230, y: 200, color: "#4169E1", size: 28 },
  { id: "hre", label: "신성 로마 제국", ruler: "호엔슈타우펜의 프리드리히", rank: "emperor", religion: "catholic", culture: "german", x: 340, y: 170, color: "#B22222", size: 32 },
  { id: "england", label: "잉글랜드 왕국", ruler: "플란타게넷의 헨리", rank: "king", religion: "catholic", culture: "norman", x: 190, y: 150, color: "#006400", size: 24 },
  { id: "byzantine", label: "비잔틴 제국", ruler: "콤네노스의 알렉시오스", rank: "emperor", religion: "orthodox", culture: "byzantine", x: 500, y: 240, color: "#8B008B", size: 30 },
  { id: "poland", label: "폴란드 왕국", ruler: "피아스트의 볼레스와프", rank: "king", religion: "catholic", culture: "slavic", x: 420, y: 150, color: "#FF4500", size: 24 },
  { id: "hungary", label: "헝가리 왕국", ruler: "아르파드의 벨러", rank: "king", religion: "catholic", culture: "slavic", x: 440, y: 200, color: "#228B22", size: 22 },
  { id: "castile", label: "카스티야 왕국", ruler: "트라스타마라의 알폰소", rank: "king", religion: "catholic", culture: "frankish", x: 170, y: 260, color: "#FFD700", size: 22 },
  { id: "aragon", label: "아라곤 왕국", ruler: "바르셀로나의 하이메", rank: "king", religion: "catholic", culture: "frankish", x: 220, y: 255, color: "#FF6347", size: 20 },
  { id: "denmark", label: "덴마크 왕국", ruler: "에스트리센의 크누드", rank: "king", religion: "catholic", culture: "norse", x: 330, y: 110, color: "#DC143C", size: 20 },
  { id: "novgorod", label: "노브고로드 공화국", ruler: "야로슬라프", rank: "duke", religion: "orthodox", culture: "slavic", x: 520, y: 110, color: "#4682B4", size: 20 },
  { id: "abbasid", label: "아바스 칼리파국", ruler: "알-만수르", rank: "emperor", religion: "islam_sunni", culture: "arab", x: 600, y: 290, color: "#2F4F4F", size: 28 },
  { id: "seljuk", label: "셀주크 술탄국", ruler: "알프 아르슬란", rank: "king", religion: "islam_sunni", culture: "persian", x: 590, y: 240, color: "#8B6914", size: 26 },
  { id: "scotland", label: "스코틀랜드 왕국", ruler: "맥베스의 다비드", rank: "king", religion: "catholic", culture: "norse", x: 190, y: 120, color: "#4B0082", size: 18 },
  { id: "venice", label: "베네치아 공화국", ruler: "단돌로 도제", rank: "duke", religion: "catholic", culture: "frankish", x: 360, y: 225, color: "#8B0000", size: 15 },
  { id: "norway", label: "노르웨이 왕국", ruler: "올라프 왕", rank: "king", religion: "catholic", culture: "norse", x: 300, y: 90, color: "#1C6B8A", size: 18 },
];

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("세계를 불러오는 중...");

  useEffect(() => {
    const steps = [
      [20, "봉건 제도 초기화..."],
      [40, "지도 렌더링..."],
      [60, "왕조 생성 중..."],
      [80, "역사적 사건 배치..."],
      [100, "완료"],
    ];
    let i = 0;
    const iv = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i][0]);
        setStatusText(steps[i][1]);
        i++;
      } else {
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 450);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse at center, #1a0a00 0%, #0a0400 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel', serif",
      color: "#c9a84c",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
      @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
      @keyframes glow { 0%,100%{text-shadow:0 0 20px #c9a84c44} 50%{text-shadow:0 0 60px #c9a84caa, 0 0 100px #c9a84c44} }
      `}</style>
      <div style={{ fontSize: 14, letterSpacing: 6, color: "#8B6914", marginBottom: 16 }}>FEUDAL CHRONICLES</div>
      <div style={{ fontSize: 52, fontWeight: 900, animation: "glow 3s ease-in-out infinite", letterSpacing: 3, textAlign: "center", lineHeight: 1.1 }}>
        봉건<br/>연대기
      </div>
      <div style={{ marginTop: 60, width: 320, height: 2, background: "#2a1a00", borderRadius: 2, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #8B4513, #c9a84c)",
          transition: "width 0.4s ease",
          boxShadow: "0 0 12px #c9a84c",
        }} />
      </div>
      <div style={{ marginTop: 16, fontSize: 12, letterSpacing: 3, color: "#8B6914", animation: "pulse 1.5s infinite" }}>{statusText}</div>
      <div style={{ position: "absolute", bottom: 30, fontSize: 10, letterSpacing: 2, color: "#4a3000" }}>
        476 AD — 2020 AD | 모든 시대를 아우르는 역사 전략
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    if (!user.trim()) return setErr("사용자명을 입력하세요");
    onLogin(user.trim());
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse at 30% 50%, #1a0800 0%, #050200 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Crimson Text', serif",
      color: "#c9a84c",
    }}>
      <style>{`
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 20px #8B451320} 50%{box-shadow:0 0 40px #8B451360} }
        .login-input { background:#0d0600; border:1px solid #3a2000; color:#c9a84c; padding:12px 16px; width:100%; font-family:'Crimson Text',serif; font-size:18px; outline:none; border-radius:2px; box-sizing:border-box; transition:border-color .3s; }
        .login-input:focus { border-color:#c9a84c; }
        .login-btn { background:linear-gradient(135deg,#8B4513,#5a2a00); border:1px solid #c9a84c44; color:#c9a84c; padding:14px; width:100%; font-family:'Cinzel',serif; font-size:14px; letter-spacing:3px; cursor:pointer; border-radius:2px; transition:all .3s; }
        .login-btn:hover { background:linear-gradient(135deg,#a0521a,#6a3200); box-shadow:0 0 20px #c9a84c33; }
      `}</style>
      <div style={{
        width: 380, padding: "50px 40px",
        border: "1px solid #3a2000",
        background: "linear-gradient(135deg, #0f0600 0%, #180a00 100%)",
        animation: "borderGlow 4s ease-in-out infinite",
        borderRadius: 4,
      }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: 5, color: "#8B6914", marginBottom: 8 }}>FEUDAL CHRONICLES</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 700, marginBottom: 40 }}>군주 인증</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#8B6914", marginBottom: 8 }}>군주명</div>
          <input className="login-input" value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} placeholder="귀하의 이름을 입력하시오" />
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#8B6914", marginBottom: 8 }}>비밀번호</div>
          <input className="login-input" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} placeholder="••••••••" />
        </div>
        {err && <div style={{ color: "#FF6347", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{err}</div>}
        <button className="login-btn" onClick={handle}>왕국에 입장</button>
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#5a4020" }}>왕좌는 그대를 기다리고 있다...</div>
      </div>
    </div>
  );
}

function MainMenuScreen({ username, saves, onNewGame, onContinue }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse at 20% 80%, #1a0800 0%, #050200 60%, #000 100%)",
      fontFamily: "'Crimson Text', serif",
      color: "#c9a84c",
      display: "flex",
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }
        .menu-btn { background:transparent; border:none; border-left:2px solid #8B451340; color:#a08040; padding:14px 24px; font-family:'Cinzel',serif; font-size:13px; letter-spacing:3px; cursor:pointer; text-align:left; transition:all .3s; width:100%; }
        .menu-btn:hover { border-left-color:#c9a84c; color:#c9a84c; background:#c9a84c08; padding-left:34px; }
        .menu-btn.primary { color:#c9a84c; font-weight:700; }
      `}</style>
      {/* Left panel */}
      <div style={{ width: 380, padding: "60px 50px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid #2a1400" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 6, color: "#5a4020", marginBottom: 12 }}>FEUDAL CHRONICLES</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>봉건<br/>연대기</div>
        <div style={{ fontSize: 16, color: "#8B6914", fontStyle: "italic", marginBottom: 60 }}>476 — 2020</div>
        <div style={{ fontSize: 13, color: "#5a4020", marginBottom: 8 }}>군주: {username}</div>
        <div style={{ height: 1, background: "#2a1400", marginBottom: 32 }} />
        <button className="menu-btn primary" onClick={onNewGame}>⚔  새로운 왕국 시작</button>
        {saves.length > 0 && (
          <>
            <div style={{ padding: "12px 24px", fontSize: 11, letterSpacing: 2, color: "#4a3000" }}>저장된 게임</div>
            {saves.map((s, i) => (
              <button key={i} className="menu-btn" onClick={() => onContinue(s)}>
                ▷  {s.name} ({s.era}) — {s.date}
              </button>
            ))}
          </>
        )}
        <button className="menu-btn" style={{ marginTop: 40, color: "#4a3000" }}>✦  설정</button>
        <button className="menu-btn" style={{ color: "#4a3000" }}>✦  게임 종료</button>
      </div>

      {/* Right - decorative */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 60% 40%, #8B451308 0%, transparent 70%)" }} />
        <div style={{ textAlign: "center", opacity: 0.15 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 120, fontWeight: 900, color: "#c9a84c", lineHeight: 1 }}>✝</div>
          <div style={{ fontSize: 14, letterSpacing: 6, marginTop: 20 }}>MEDIEVAL · EARLY MODERN · MODERN</div>
        </div>
        <div style={{ position: "absolute", bottom: 30, right: 30, fontSize: 11, color: "#3a2000", textAlign: "right" }}>
          <div>봉건제 · 세습 · 결혼동맹</div>
          <div>내각 · 법률 · 전쟁 · 종교</div>
        </div>
      </div>
    </div>
  );
}

function MapDot({ nation, onClick, isSelected }) {
  const rel = RELIGIONS.find(r => r.id === nation.religion);
  return (
    <g onClick={() => onClick(nation)} style={{ cursor: "pointer" }}>
      <circle
        cx={nation.x} cy={nation.y} r={nation.size / 2 + (isSelected ? 4 : 0)}
        fill={nation.color}
        fillOpacity={isSelected ? 0.9 : 0.6}
        stroke={isSelected ? "#c9a84c" : "#00000066"}
        strokeWidth={isSelected ? 2 : 1}
      />
      <text x={nation.x} y={nation.y + 4} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="bold" fontFamily="Cinzel, serif">
        {rel?.icon || ""}
      </text>
      <text x={nation.x} y={nation.y + nation.size / 2 + 14} textAnchor="middle" fontSize={9} fill="#c9a84c" fontFamily="Crimson Text, serif">
        {nation.label}
      </text>
    </g>
  );
}

function NewGameScreen({ onStart, onBack }) {
  const [selectedEra, setSelectedEra] = useState(null);
  const [selectedNation, setSelectedNation] = useState(null);
  const [hoveredNation, setHoveredNation] = useState(null);

  const display = hoveredNation || selectedNation;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#050200",
      fontFamily: "'Crimson Text', serif",
      color: "#c9a84c",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        .era-btn { background:transparent; border:1px solid #3a2000; color:#8B6914; padding:10px 24px; font-family:'Cinzel',serif; font-size:11px; letter-spacing:3px; cursor:pointer; transition:all .3s; border-radius:2px; }
        .era-btn:hover,.era-btn.active { background:#8B4513; border-color:#c9a84c; color:#c9a84c; }
        .start-btn { background:linear-gradient(135deg,#8B4513,#5a2a00); border:1px solid #c9a84c; color:#c9a84c; padding:14px 40px; font-family:'Cinzel',serif; font-size:13px; letter-spacing:3px; cursor:pointer; border-radius:2px; transition:all .3s; }
        .start-btn:hover { background:linear-gradient(135deg,#a05015,#6a3200); box-shadow:0 0 20px #c9a84c44; }
        .start-btn:disabled { opacity:.3; cursor:not-allowed; }
      `}</style>
      {/* Top bar */}
      <div style={{ padding: "20px 40px", borderBottom: "1px solid #2a1400", display: "flex", alignItems: "center", gap: 24 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#8B6914", cursor: "pointer", fontSize: 18 }}>←</button>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 700 }}>새 게임 — 시대 & 국가 선택</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 12 }}>
          {ERAS.map(e => (
            <button key={e.id} className={`era-btn ${selectedEra?.id === e.id ? "active" : ""}`}
              onClick={() => setSelectedEra(e)}>
              {e.label} <span style={{ opacity: 0.6, fontSize: 9 }}>{e.range}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Map */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <svg width="100%" height="100%" viewBox="100 60 600 320" preserveAspectRatio="xMidYMid meet"
            style={{ background: "linear-gradient(180deg, #0a1520 0%, #0d1a10 100%)" }}>
            {/* Simple "sea" */}
            <rect x={100} y={60} width={600} height={320} fill="#0a1525" />
            {/* Rough "land" shape */}
            <path d="M140,100 Q180,80 230,90 Q280,100 340,85 Q420,75 500,90 Q560,100 620,85 L640,280 Q580,300 500,290 Q440,280 380,295 Q300,310 230,300 Q170,290 140,270 Z"
              fill="#1a1408" stroke="#2a2010" strokeWidth={1} />
            {/* Mediterranean */}
            <ellipse cx={380} cy={270} rx={80} ry={25} fill="#0a1525" opacity={0.8} />

            {MAP_NATIONS.map(n => (
              <MapDot key={n.id} nation={n}
                onClick={setSelectedNation}
                isSelected={selectedNation?.id === n.id}
              />
            ))}
          </svg>
        </div>

        {/* Sidebar */}
        <div style={{ width: 300, borderLeft: "1px solid #2a1400", padding: 24, overflowY: "auto", background: "#0a0500" }}>
          {display ? (
            <>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{display.label}</div>
              <div style={{ fontSize: 13, color: "#8B6914", marginBottom: 20, fontStyle: "italic" }}>
                {FEUDAL_RANKS.find(r => r.id === display.rank)?.label || display.rank}
              </div>
              <InfoRow label="군주" value={display.ruler} />
              <InfoRow label="종교" value={RELIGIONS.find(r => r.id === display.religion)?.label} />
              <InfoRow label="문화권" value={CULTURES.find(c => c.id === display.culture)?.label} />
              <div style={{ marginTop: 24 }}>
                <button className="start-btn" disabled={!selectedEra || !selectedNation}
                  onClick={() => onStart({ nation: selectedNation, era: selectedEra })}>
                  {selectedEra ? `${selectedEra.label} 시대로 시작` : "시대를 선택하세요"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: "#4a3000", fontSize: 14, fontStyle: "italic", marginTop: 40, textAlign: "center" }}>
              지도에서 국가를 클릭하여<br />정보를 확인하세요
            </div>
          )}
          <div style={{ marginTop: 30, padding: "16px 0", borderTop: "1px solid #2a1400" }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#4a3000", marginBottom: 12 }}>전체 국가 목록</div>
            {MAP_NATIONS.map(n => (
              <div key={n.id}
                onClick={() => setSelectedNation(n)}
                style={{
                  padding: "8px 12px", cursor: "pointer", borderRadius: 2, marginBottom: 2,
                  background: selectedNation?.id === n.id ? "#1a0c00" : "transparent",
                  color: selectedNation?.id === n.id ? "#c9a84c" : "#6a5030",
                  fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                  transition: "all .2s",
                }}
                onMouseEnter={() => setHoveredNation(n)}
                onMouseLeave={() => setHoveredNation(null)}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, flexShrink: 0 }} />
                {n.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a0c00", fontSize: 14 }}>
      <span style={{ color: "#6a5030" }}>{label}</span>
      <span style={{ color: "#c9a84c" }}>{value}</span>
    </div>
  );
}

// ─── GAME SCREEN ──────────────────────────────────────────────────────────────

const PANELS = ["개요", "왕조", "내각", "법률", "군사", "기술", "외교"];

function GameScreen({ config, onBack }) {
  const [realm, setRealm] = useState(() => generateRealm(config.nation));
  const [date, setDate] = useState(() => {
    if (config.era.id === "medieval") return { year: 867, month: 1 };
    if (config.era.id === "early_modern") return { year: 1492, month: 1 };
    return { year: 1914, month: 1 };
  });
  const [speed, setSpeed] = useState(0);
  const [activePanel, setActivePanel] = useState("개요");
  const [log, setLog] = useState(["왕국이 시작되었습니다.", "그대의 지배가 시작됩니다..."]);
  const [showSuccession, setShowSuccession] = useState(false);
  const [showMarriage, setShowMarriage] = useState(false);
  const [showBastard, setShowBastard] = useState(false);
  const [heirs, setHeirs] = useState([generatePerson({ name: "왕세자", age: 12, sex: "male" })]);
  const [wars, setWars] = useState([]);
  const [notification, setNotification] = useState(null);

  const addLog = (msg) => setLog(prev => [`${date.year}년 ${date.month}월: ${msg}`, ...prev.slice(0, 29)]);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Tick
  useEffect(() => {
    if (speed === 0) return;
    const delay = [null, 1500, 800, 300, 100][speed];
    const iv = setInterval(() => {
      setDate(d => {
        const nm = d.month + 1;
        if (nm > 12) {
          const ny = d.year + 1;
          // Random events
          if (Math.random() < 0.15) {
            const events = [
              "풍년이 들었습니다. 재정이 증가합니다.",
              "역병이 돌고 있습니다.",
              "봉신이 불만을 품고 있습니다.",
              "이웃 왕국에서 사신이 도착했습니다.",
              "학자가 새로운 기술을 제안합니다.",
            ];
            addLog(randItem(events));
          }
          setRealm(r => ({ ...r, treasury: r.treasury + rand(20, 80) }));
          return { year: ny, month: 1 };
        }
        return { ...d, month: nm };
      });
    }, delay);
    return () => clearInterval(iv);
  }, [speed]);

  const ruler = realm.ruler;
  const rel = RELIGIONS.find(r => r.id === config.nation.religion);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#050200",
      fontFamily: "'Crimson Text', serif",
      color: "#c9a84c",
      display: "flex", flexDirection: "column",
      fontSize: 14,
    }}>
      <style>{`
        @keyframes notif { 0%{transform:translateX(120%)} 10%{transform:translateX(0)} 90%{transform:translateX(0)} 100%{transform:translateX(120%)} }
        .panel-tab { background:none; border:none; border-bottom:2px solid transparent; color:#6a5030; padding:10px 16px; font-family:'Cinzel',serif; font-size:11px; letter-spacing:2px; cursor:pointer; transition:all .2s; }
        .panel-tab:hover { color:#a08040; }
        .panel-tab.active { border-bottom-color:#c9a84c; color:#c9a84c; }
        .action-btn { background:#1a0c00; border:1px solid #3a2000; color:#a08040; padding:8px 16px; font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; cursor:pointer; border-radius:2px; transition:all .2s; }
        .action-btn:hover { border-color:#c9a84c; color:#c9a84c; background:#2a1400; }
        .speed-btn { background:none; border:1px solid #3a2000; color:#6a5030; width:32px; height:28px; cursor:pointer; border-radius:2px; font-size:14px; transition:all .2s; }
        .speed-btn.active { background:#8B4513; border-color:#c9a84c; color:#c9a84c; }
        .modal-overlay { position:fixed; inset:0; background:#00000088; display:flex; align-items:center; justify-content:center; z-index:100; }
        .modal-box { background:#0f0700; border:1px solid #3a2000; padding:32px; min-width:400px; max-width:560px; border-radius:4px; }
        .modal-title { font-family:'Cinzel',serif; font-size:20px; font-weight:700; margin-bottom:24px; }
        .select-input { background:#0a0400; border:1px solid #3a2000; color:#c9a84c; padding:10px 12px; width:100%; font-family:'Crimson Text',serif; font-size:15px; outline:none; border-radius:2px; box-sizing:border-box; }
        .select-input:focus { border-color:#c9a84c; }
        .confirm-btn { background:linear-gradient(135deg,#8B4513,#5a2a00); border:1px solid #c9a84c44; color:#c9a84c; padding:12px 32px; font-family:'Cinzel',serif; font-size:12px; letter-spacing:2px; cursor:pointer; border-radius:2px; }
        .stat-bar { height:4px; background:#1a1000; border-radius:2px; margin-top:4px; }
        .stat-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,#8B4513,#c9a84c); }
      `}</style>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 70, right: 20, zIndex: 200,
          background: "#1a0c00", border: "1px solid #c9a84c", padding: "12px 20px",
          fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: 1, color: "#c9a84c",
          borderRadius: 2, animation: "notif 3s ease forwards",
        }}>{notification}</div>
      )}

      {/* Top Bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, padding: "10px 20px",
        borderBottom: "1px solid #2a1400", background: "#080400",
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#8B6914", cursor: "pointer", fontSize: 16 }}>←</button>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700 }}>{realm.label}</div>
        <div style={{ fontSize: 12, color: "#8B6914" }}>|</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "#8B6914" }}>{config.era.label} 시대</div>

        <div style={{ flex: 1 }} />

        {/* Resources */}
        <Stat icon="📅" label={`${date.year}년 ${date.month}월`} />
        <Stat icon="💰" label={`${realm.treasury.toFixed(0)} 금`} />
        <Stat icon="⚔" label={`${realm.manpower} 병력`} />
        <Stat icon={rel?.icon || "✝"} label={RELIGIONS.find(r => r.id === config.nation.religion)?.label} />

        {/* Speed */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button className={`speed-btn ${speed === 0 ? "active" : ""}`} onClick={() => setSpeed(0)}>⏸</button>
          {[1,2,3,4].map(s => (
            <button key={s} className={`speed-btn ${speed === s ? "active" : ""}`} onClick={() => setSpeed(s)}>{"▶".repeat(s)}</button>
          ))}
        </div>
      </div>

      {/* Panel Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #2a1400", background: "#060300", paddingLeft: 20 }}>
        {PANELS.map(p => (
          <button key={p} className={`panel-tab ${activePanel === p ? "active" : ""}`} onClick={() => setActivePanel(p)}>{p}</button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Panel Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activePanel === "개요" && <OverviewPanel realm={realm} ruler={ruler} heirs={heirs} config={config} date={date} log={log} />}
          {activePanel === "왕조" && <DynastyPanel realm={realm} heirs={heirs} setShowSuccession={setShowSuccession} setShowMarriage={setShowMarriage} setShowBastard={setShowBastard} />}
          {activePanel === "내각" && <CabinetPanel realm={realm} setRealm={setRealm} addLog={addLog} notify={notify} />}
          {activePanel === "법률" && <LawsPanel realm={realm} setRealm={setRealm} addLog={addLog} notify={notify} />}
          {activePanel === "군사" && <MilitaryPanel realm={realm} setRealm={setRealm} wars={wars} setWars={setWars} addLog={addLog} notify={notify} />}
          {activePanel === "기술" && <TechPanel realm={realm} setRealm={setRealm} addLog={addLog} notify={notify} />}
          {activePanel === "외교" && <DiplomacyPanel realm={realm} config={config} addLog={addLog} notify={notify} />}
        </div>

        {/* Right sidebar - log */}
        <div style={{ width: 240, borderLeft: "1px solid #1a0c00", overflowY: "auto", background: "#060300", padding: 16 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: 3, color: "#4a3000", marginBottom: 12 }}>연대기</div>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 11, color: i === 0 ? "#a08040" : "#4a3000", marginBottom: 8, lineHeight: 1.4, borderBottom: "1px solid #0f0600", paddingBottom: 6 }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showSuccession && <SuccessionModal realm={realm} setRealm={setRealm} onClose={() => setShowSuccession(false)} addLog={addLog} notify={notify} />}
      {showMarriage && <MarriageModal heirs={heirs} setHeirs={setHeirs} onClose={() => setShowMarriage(false)} addLog={addLog} notify={notify} />}
      {showBastard && <BastardModal ruler={ruler} onClose={() => setShowBastard(false)} addLog={addLog} notify={notify} />}
    </div>
  );
}

function Stat({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#a08040" }}>
      <span>{icon}</span>
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11 }}>{label}</span>
    </div>
  );
}

// ─── PANELS ──────────────────────────────────────────────────────────────────

function OverviewPanel({ realm, ruler, heirs, config, date, log }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Ruler card */}
      <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
        <SectionTitle>군주 정보</SectionTitle>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 60, height: 60, background: "#1a0c00", border: "1px solid #3a2000", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            {ruler.sex === "male" ? "♔" : "♛"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16 }}>{ruler.name}</div>
            <div style={{ color: "#8B6914", fontSize: 13, marginBottom: 10 }}>
              {FEUDAL_RANKS.find(r => r.id === ruler.rank)?.label} · {ruler.dynasty} 가문 · {ruler.age}세
            </div>
            <StatBar label="지력" value={ruler.intelligence} max={20} sub={`(선천 ${ruler.innateIntelligence} + 후천 ${ruler.learnedIntelligence})`} />
            <StatBar label="무력" value={ruler.martial} max={20} />
            <StatBar label="행정" value={ruler.stewardship} max={20} />
            <StatBar label="음모" value={ruler.intrigue} max={20} />
            <StatBar label="외교" value={ruler.diplomacy} max={20} />
          </div>
        </div>
      </div>

      {/* Realm stats */}
      <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
        <SectionTitle>왕국 현황</SectionTitle>
        <InfoRow label="시대" value={config.era.label} />
        <InfoRow label="현재 날짜" value={`${date.year}년 ${date.month}월`} />
        <InfoRow label="국고" value={`${realm.treasury.toFixed(0)} 금화`} />
        <InfoRow label="병력" value={`${realm.manpower} 명`} />
        <InfoRow label="세습법" value={SUCCESSION_LAWS.find(s => s.id === realm.succession)?.label} />
        <InfoRow label="중앙집권도" value={`${realm.laws.centralization * 10}/10`} />
      </div>

      {/* Heir */}
      <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
        <SectionTitle>후계자</SectionTitle>
        {heirs.length > 0 ? heirs.map((h, i) => (
          <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: "#1a0c00", border: "1px solid #3a2000", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14 }}>{h.name}</div>
              <div style={{ color: "#6a5030", fontSize: 12 }}>{h.age}세 · 지력 {h.intelligence} · 무력 {h.martial}</div>
              {h.age < 13 && <div style={{ color: "#FF6347", fontSize: 11 }}>미성년 (성년 기준: 13세)</div>}
            </div>
          </div>
        )) : <div style={{ color: "#4a3000" }}>후계자 없음 — 승계 위기!</div>}
      </div>

      {/* Quick events */}
      <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
        <SectionTitle>최근 사건</SectionTitle>
        {log.slice(0, 5).map((l, i) => (
          <div key={i} style={{ fontSize: 12, color: "#6a5030", marginBottom: 8, lineHeight: 1.5 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function DynastyPanel({ realm, heirs, setShowSuccession, setShowMarriage, setShowBastard }) {
  const candidates = [
    generatePerson({ name: "카롤링거의 에우도", age: 22 }),
    generatePerson({ name: "오토의 아그네스", age: 19, sex: "female" }),
    generatePerson({ name: "아르파드의 게저", age: 25 }),
  ];

  return (
    <div>
      <SectionTitle>왕조 & 세습</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, marginBottom: 16, color: "#8B6914" }}>세습 제도</div>
          <div style={{ color: "#c9a84c", fontSize: 15, marginBottom: 8 }}>{SUCCESSION_LAWS.find(s => s.id === realm.succession)?.label}</div>
          <div style={{ color: "#6a5030", fontSize: 13, marginBottom: 16 }}>{SUCCESSION_LAWS.find(s => s.id === realm.succession)?.desc}</div>
          <button className="action-btn" onClick={() => setShowSuccession(true)}>세습법 변경</button>
        </div>
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, marginBottom: 16, color: "#8B6914" }}>결혼 & 약혼</div>
          <div style={{ fontSize: 13, color: "#6a5030", marginBottom: 12 }}>성년 기준: 13세 (약혼 → 결혼 가능)</div>
          <div style={{ fontSize: 13, color: "#6a5030", marginBottom: 16 }}>
            군주 배우자: {realm.ruler.spouse ? realm.ruler.spouse : "미혼"}
          </div>
          <button className="action-btn" onClick={() => setShowMarriage(true)}>결혼동맹 추진</button>
        </div>
      </div>

      <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#8B6914" }}>후계자 목록</div>
          <button className="action-btn" onClick={() => setShowBastard(true)}>사생아 인정</button>
        </div>
        {heirs.map((h, i) => (
          <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a0c00" }}>
            <div>
              <span style={{ color: "#4a3000", marginRight: 8 }}>{i + 1}위</span>
              <span style={{ fontFamily: "'Cinzel',serif" }}>{h.name}</span>
              {h.isBastard && <span style={{ color: "#FF6347", fontSize: 11, marginLeft: 8 }}>[사생아]</span>}
              {h.age < 13 && <span style={{ color: "#FF8C00", fontSize: 11, marginLeft: 8 }}>[미성년]</span>}
            </div>
            <div style={{ fontSize: 12, color: "#6a5030" }}>
              {h.age}세 · 지{h.intelligence} 무{h.martial} 행{h.stewardship}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CabinetPanel({ realm, setRealm, addLog, notify }) {
  const candidates = Array.from({ length: 6 }, () => generatePerson({ age: rand(25, 55) }));

  const appoint = (role, person) => {
    setRealm(r => ({ ...r, cabinet: { ...r.cabinet, [role]: person } }));
    addLog(`${person.name}이(가) ${CABINET_ROLES.find(c => c.id === role)?.label}에 임명되었습니다.`);
    notify(`${person.name} → ${CABINET_ROLES.find(c => c.id === role)?.label}`);
  };

  return (
    <div>
      <SectionTitle>내각 구성</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {CABINET_ROLES.map(role => {
          const current = realm.cabinet[role.id];
          return (
            <div key={role.id} style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{role.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13 }}>{role.label}</div>
                  <div style={{ fontSize: 11, color: "#4a3000" }}>{role.stat}</div>
                </div>
              </div>
              {current ? (
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, marginBottom: 4 }}>{current.name}</div>
                  <div style={{ fontSize: 12, color: "#6a5030" }}>{current.age}세 · 해당 능력치: {current[role.stat]}</div>
                  <button className="action-btn" style={{ marginTop: 10 }} onClick={() => {
                    setRealm(r => ({ ...r, cabinet: { ...r.cabinet, [role.id]: null } }));
                    addLog(`${current.name}이(가) ${role.label}에서 해임되었습니다.`);
                  }}>해임</button>
                </div>
              ) : (
                <div>
                  <div style={{ color: "#4a3000", fontSize: 13, marginBottom: 10 }}>공석</div>
                  <select className="select-input" onChange={e => {
                    const p = candidates.find(c => c.id === e.target.value);
                    if (p) appoint(role.id, p);
                  }} defaultValue="">
                    <option value="" disabled>후보자 선택...</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (능력: {c[role.stat]})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LawsPanel({ realm, setRealm, addLog, notify }) {
  const updateLaw = (key, val) => {
    setRealm(r => ({ ...r, laws: { ...r.laws, [key]: val } }));
    addLog(`법률이 변경되었습니다: ${key}`);
    notify("법률 변경 완료");
  };

  return (
    <div>
      <SectionTitle>법률 & 세제</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Centralization */}
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#8B6914", marginBottom: 16 }}>중앙집권화</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span>집권도</span><span style={{ color: "#c9a84c" }}>{realm.laws.centralization}/10</span>
            </div>
            <input type="range" min={0} max={10} value={realm.laws.centralization}
              onChange={e => updateLaw("centralization", Number(e.target.value))}
              style={{ width: "100%", accentColor: "#8B4513" }} />
          </div>
          <LawToggle label="봉신 독자외교 허용" value={realm.laws.vassalDiplomacy} onChange={v => updateLaw("vassalDiplomacy", v)} />
          <LawToggle label="봉신 독자전쟁 허용" value={realm.laws.vassalWar} onChange={v => updateLaw("vassalWar", v)} />
          <div style={{ fontSize: 12, color: "#4a3000", marginTop: 10 }}>
            * 집권도 7 이상에서 봉신 독자행동 금지 가능
          </div>
        </div>

        {/* Taxes */}
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#8B6914", marginBottom: 16 }}>세금 정책</div>
          {[
            { key: "nobleTax", label: "귀족 세율", desc: "공후백자남 등급별 부과" },
            { key: "merchantTax", label: "상인 세율", desc: "상업 세금" },
            { key: "churchTax", label: "종교 세율", desc: "교회/성직자 세금" },
          ].map(t => (
            <div key={t.key} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span>{t.label}</span>
                <span style={{ color: "#c9a84c" }}>{(realm.laws[t.key] * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min={0} max={0.5} step={0.01} value={realm.laws[t.key]}
                onChange={e => updateLaw(t.key, Number(e.target.value))}
                style={{ width: "100%", accentColor: "#8B4513" }} />
              <div style={{ fontSize: 11, color: "#4a3000" }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Rank-based taxes */}
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2, gridColumn: "1/-1" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#8B6914", marginBottom: 16 }}>봉건 작위별 세율</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {["공작 (Duke)", "백작 (Count)", "자작 (Viscount)", "남작 (Baron)", "기사"].map((r, i) => (
              <div key={r} style={{ background: "#0f0700", border: "1px solid #2a1400", padding: 12, borderRadius: 2, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#8B6914", marginBottom: 6 }}>{r}</div>
                <div style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif" }}>{(5 + i * 2)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LawToggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: 13 }}>
      <span style={{ color: "#a08040" }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        background: value ? "#8B4513" : "#1a0c00",
        border: `1px solid ${value ? "#c9a84c" : "#3a2000"}`,
        color: value ? "#c9a84c" : "#4a3000",
        padding: "4px 12px", cursor: "pointer", borderRadius: 2, fontSize: 11, fontFamily: "'Cinzel',serif",
      }}>{value ? "허용" : "금지"}</button>
    </div>
  );
}

function MilitaryPanel({ realm, setRealm, wars, setWars, addLog, notify }) {
  const [army, setArmy] = useState({ cavalry: 0, infantry: 0, spearman: 0, archer: 0, siege: 0 });

  const recruit = (unitId, count) => {
    const unit = MILITARY_UNITS.find(u => u.id === unitId);
    const cost = unit.cost * count;
    if (realm.treasury < cost) return notify("재정이 부족합니다!");
    setArmy(a => ({ ...a, [unitId]: (a[unitId] || 0) + count }));
    setRealm(r => ({ ...r, treasury: r.treasury - cost, manpower: r.manpower + count * 10 }));
    addLog(`${unit.label} ${count}부대 징집 완료`);
    notify(`${unit.label} 징집 완료`);
  };

  const declareWar = () => {
    const targets = MAP_NATIONS.filter(n => n.id !== realm.id);
    const target = randItem(targets);
    setWars(w => [...w, { id: Math.random().toString(36).slice(2), against: target.label, progress: 0, siege: 0 }]);
    addLog(`${target.label}에 선전포고!`);
    notify(`⚔ 전쟁 선포: ${target.label}`);
  };

  return (
    <div>
      <SectionTitle>군사</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Recruitment */}
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#8B6914", marginBottom: 16 }}>병력 징집</div>
          {MILITARY_UNITS.map(u => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "8px 0", borderBottom: "1px solid #1a0c00" }}>
              <div>
                <span style={{ marginRight: 8 }}>{u.icon}</span>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 13 }}>{u.label}</span>
                <div style={{ fontSize: 11, color: "#4a3000" }}>공격 {u.attack} · 방어 {u.defense} · 비용 {u.cost}💰</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#8B6914", fontSize: 12 }}>({army[u.id] || 0})</span>
                <button className="action-btn" onClick={() => recruit(u.id, 1)}>+1</button>
                <button className="action-btn" onClick={() => recruit(u.id, 5)}>+5</button>
              </div>
            </div>
          ))}
        </div>

        {/* Wars */}
        <div style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#8B6914" }}>전쟁</div>
            <button className="action-btn" onClick={declareWar}>선전포고</button>
          </div>
          {wars.length === 0 ? (
            <div style={{ color: "#4a3000", fontSize: 13 }}>현재 진행 중인 전쟁 없음</div>
          ) : wars.map(w => (
            <div key={w.id} style={{ marginBottom: 12, padding: 12, background: "#0f0700", borderRadius: 2, border: "1px solid #2a1400" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, marginBottom: 6 }}>vs {w.against}</div>
              <div style={{ fontSize: 12, color: "#6a5030" }}>전황: {w.progress}%</div>
              <div className="stat-bar" style={{ marginTop: 6 }}>
                <div className="stat-fill" style={{ width: `${w.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechPanel({ realm, setRealm, addLog, notify }) {
  const research = (techId) => {
    const cost = 100 + realm.tech[techId] * 50;
    if (realm.treasury < cost) return notify("재정이 부족합니다!");
    setRealm(r => ({
      ...r,
      treasury: r.treasury - cost,
      tech: { ...r.tech, [techId]: r.tech[techId] + 1 }
    }));
    const t = TECH_CATEGORIES.find(t => t.id === techId);
    addLog(`${t.label} 기술이 레벨 ${realm.tech[techId] + 1}로 향상되었습니다.`);
    notify(`${t.icon} ${t.label} 기술 향상!`);
  };

  return (
    <div>
      <SectionTitle>기술 연구</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {TECH_CATEGORIES.map(t => {
          const level = realm.tech[t.id] || 0;
          const cost = 100 + level * 50;
          return (
            <div key={t.id} style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 20, borderRadius: 2 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, marginBottom: 4 }}>{t.label}</div>
              <div style={{ color: "#8B6914", fontSize: 12, marginBottom: 12 }}>레벨 {level} / 10</div>
              <div className="stat-bar" style={{ marginBottom: 12 }}>
                <div className="stat-fill" style={{ width: `${level * 10}%` }} />
              </div>
              <div style={{ fontSize: 12, color: "#4a3000", marginBottom: 10 }}>연구 비용: {cost} 💰</div>
              <button className="action-btn" onClick={() => research(t.id)}>연구 ({cost}💰)</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiplomacyPanel({ realm, config, addLog, notify }) {
  const others = MAP_NATIONS.filter(n => n.id !== config.nation.id);

  return (
    <div>
      <SectionTitle>외교</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {others.map(n => {
          const rel = RELIGIONS.find(r => r.id === n.religion);
          const relation = rand(-80, 80);
          return (
            <div key={n.id} style={{ background: "#0a0500", border: "1px solid #2a1400", padding: 16, borderRadius: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: n.color }} />
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12 }}>{n.label}</div>
              </div>
              <div style={{ fontSize: 11, color: "#6a5030", marginBottom: 4 }}>{rel?.icon} {RELIGIONS.find(r => r.id === n.religion)?.label}</div>
              <div style={{ fontSize: 11, color: relation > 0 ? "#4CAF50" : "#FF6347", marginBottom: 10 }}>
                관계도: {relation > 0 ? "+" : ""}{relation}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button className="action-btn" style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => { addLog(`${n.label}에 외교 사절을 보냈습니다.`); notify("사절 파견"); }}>사절</button>
                <button className="action-btn" style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => { addLog(`${n.label}와 동맹 협상을 시작했습니다.`); notify("동맹 협상 시작"); }}>동맹</button>
                <button className="action-btn" style={{ fontSize: 10, padding: "4px 8px", color: "#FF6347", borderColor: "#FF634740" }} onClick={() => { addLog(`${n.label}에 선전포고!`); notify(`⚔ ${n.label}에 선전포고!`); }}>선전포고</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────

function SuccessionModal({ realm, setRealm, onClose, addLog, notify }) {
  const [selected, setSelected] = useState(realm.succession);
  const isHighAuthority = realm.laws.centralization >= 7;

  const apply = () => {
    if (selected === "designated" && !isHighAuthority) return notify("왕권 강화 필요 (집권도 7 이상)");
    setRealm(r => ({ ...r, succession: selected }));
    addLog(`세습법이 "${SUCCESSION_LAWS.find(s => s.id === selected)?.label}"로 변경되었습니다.`);
    notify("세습법 변경 완료");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">세습 제도 변경</div>
        {SUCCESSION_LAWS.map(s => (
          <div key={s.id} onClick={() => (s.id !== "designated" || isHighAuthority) && setSelected(s.id)}
            style={{
              padding: "12px 16px", marginBottom: 8, borderRadius: 2,
              background: selected === s.id ? "#1a0c00" : "#0a0500",
              border: `1px solid ${selected === s.id ? "#c9a84c" : "#2a1400"}`,
              cursor: (s.id === "designated" && !isHighAuthority) ? "not-allowed" : "pointer",
              opacity: (s.id === "designated" && !isHighAuthority) ? 0.4 : 1,
            }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: "#6a5030" }}>{s.desc}
              {s.id === "designated" && <span style={{ color: "#FF6347", marginLeft: 8 }}>(왕권 강화 필요)</span>}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="confirm-btn" onClick={apply}>적용</button>
          <button className="action-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

function MarriageModal({ heirs, setHeirs, onClose, addLog, notify }) {
  const [targetName, setTargetName] = useState("");
  const [targetAge, setTargetAge] = useState(20);
  const [betrothed, setBetrothed] = useState(false);

  const propose = () => {
    if (!targetName) return notify("이름을 입력하세요");
    if (targetAge < 13 && !betrothed) return notify("13세 미만은 약혼만 가능합니다");
    addLog(`${targetName}${betrothed ? "와 약혼" : "와 결혼동맹"} 체결`);
    notify(betrothed ? `📜 약혼: ${targetName}` : `💍 결혼동맹: ${targetName}`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">결혼동맹 / 약혼</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#8B6914", marginBottom: 6 }}>상대방 이름</div>
          <input className="select-input" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="예: 카롤링거의 이사벨" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#8B6914", marginBottom: 6 }}>나이: {targetAge}세
            {targetAge < 13 && <span style={{ color: "#FF6347", marginLeft: 8 }}>(미성년 — 약혼만 가능)</span>}
          </div>
          <input type="range" min={5} max={60} value={targetAge} onChange={e => setTargetAge(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#8B4513" }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <LawToggle label="약혼으로 시작 (성년 후 결혼)" value={betrothed} onChange={setBetrothed} />
          <div style={{ fontSize: 12, color: "#4a3000" }}>성년 기준 13세. 미성년자는 약혼 후 성년이 되면 결혼으로 승급 가능.</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="confirm-btn" onClick={propose}>{betrothed ? "약혼 제안" : "결혼 제안"}</button>
          <button className="action-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

function BastardModal({ ruler, onClose, addLog, notify }) {
  const [timing, setTiming] = useState("birth");
  const [childName, setChildName] = useState("아무개");

  const recognize = () => {
    addLog(`${ruler.name}이(가) 사생아 ${childName}을(를) 인정하였습니다. (인정 시점: ${BASTARD_RECOGNITION.find(b => b.id === timing)?.label})`);
    notify(`📜 사생아 인정: ${childName}`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">사생아 인정</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#8B6914", marginBottom: 6 }}>사생아 이름</div>
          <input className="select-input" value={childName} onChange={e => setChildName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#8B6914", marginBottom: 10 }}>인정 시점</div>
          {BASTARD_RECOGNITION.map(b => (
            <div key={b.id} onClick={() => setTiming(b.id)}
              style={{
                padding: "10px 14px", marginBottom: 6, borderRadius: 2, cursor: "pointer",
                background: timing === b.id ? "#1a0c00" : "#0a0500",
                border: `1px solid ${timing === b.id ? "#c9a84c" : "#2a1400"}`,
                fontSize: 13, color: timing === b.id ? "#c9a84c" : "#6a5030",
              }}>{b.label}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="confirm-btn" onClick={recognize}>인정</button>
          <button className="action-btn" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, marginBottom: 20, paddingBottom: 10, borderBottom: "1px solid #2a1400", color: "#c9a84c", letterSpacing: 2 }}>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 20, sub }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span style={{ color: "#6a5030" }}>{label} {sub && <span style={{ color: "#4a3000", fontSize: 10 }}>{sub}</span>}</span>
        <span style={{ color: "#c9a84c" }}>{value}</span>
      </div>
      <div className="stat-bar">
        <div className="stat-fill" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [username, setUsername] = useState("");
  const [gameConfig, setGameConfig] = useState(null);

  const saves = []; // In real app: load from localStorage/Firebase

  return (
    <>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#050200} ::-webkit-scrollbar-thumb{background:#3a2000;border-radius:3px}`}</style>
      {screen === "loading" && <LoadingScreen onDone={() => setScreen("login")} />}
      {screen === "login" && <LoginScreen onLogin={u => { setUsername(u); setScreen("main"); }} />}
      {screen === "main" && <MainMenuScreen username={username} saves={saves} onNewGame={() => setScreen("newgame")} onContinue={s => setGameConfig(s)} />}
      {screen === "newgame" && <NewGameScreen onStart={cfg => { setGameConfig(cfg); setScreen("game"); }} onBack={() => setScreen("main")} />}
      {screen === "game" && gameConfig && <GameScreen config={gameConfig} onBack={() => setScreen("main")} />}
    </>
  );
}
