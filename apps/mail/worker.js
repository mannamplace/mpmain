// ══════════════════════════════════════════
// Mannamplace Mail Worker
// 경로: mail.mannamplace.com
// 역할: Resend API를 통한 이메일 발송
// ══════════════════════════════════════════

const RESEND_API_KEY = "re_j9wBBJxS_Kzianq59kEb4kyNhjdopHgjG"; // Resend에서 발급받은 API Key로 교체
const FROM_EMAIL = "noreply@mannamplace.com";
const FROM_NAME = "Mannamplace";
const SITE_URL = "https://mannamplace.com";

// 허용된 오리진 (CORS)
const ALLOWED_ORIGINS = [
  "https://mannamplace.com",
  "https://core.mannamplace.com",
  "https://cistan.mannamplace.com",
  "https://tnfocnus.mannamplace.com",
  "https://account.mannamplace.com",
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    // CORS 헤더
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // POST만 허용
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    try {
      const body = await request.json();
      const { type, to, data } = body;

      if (!type || !to) {
        return new Response(JSON.stringify({ error: "type, to 필드가 필요합니다" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 이메일 타입별 처리
      let emailPayload;

      switch (type) {

        // ── 가입 인증 메일 ──
        case "verify":
          emailPayload = {
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: "Mannamplace 이메일 인증",
            html: templateVerify(data?.nick || "회원", data?.verifyUrl || SITE_URL)
          };
          break;

        // ── 비밀번호 재설정 ──
        case "reset":
          emailPayload = {
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: "Mannamplace 비밀번호 재설정",
            html: templateReset(data?.nick || "회원", data?.resetUrl || SITE_URL)
          };
          break;

        // ── 댓글 알림 ──
        case "comment":
          emailPayload = {
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: `${data?.commenterNick || "누군가"}님이 댓글을 달았습니다`,
            html: templateComment(data?.nick, data?.commenterNick, data?.postTitle, data?.postUrl)
          };
          break;

        // ── 운영진 승급 알림 ──
        case "rank_up":
          emailPayload = {
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: "Mannamplace 등급 승급 안내",
            html: templateRankUp(data?.nick, data?.rank, data?.service)
          };
          break;

        // ── 공지 메일 (운영진 전용) ──
        case "announcement":
          // 운영진 토큰 검증 (간단한 시크릿 키 방식)
          const authHeader = request.headers.get("Authorization");
          if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
            return new Response(JSON.stringify({ error: "권한 없음" }), {
              status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
          emailPayload = {
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: data?.subject || "Mannamplace 공지",
            html: templateAnnouncement(data?.title, data?.content)
          };
          break;

        default:
          return new Response(JSON.stringify({ error: "알 수 없는 이메일 타입" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
      }

      // Resend API 호출
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });

      const result = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: "메일 발송 실패", detail: result }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

// ══════════════════════════════════════════
// 이메일 템플릿
// ══════════════════════════════════════════

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0F0A06; font-family: 'Noto Sans KR', -apple-system, sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
  .card { background: #1E0D03; border: 1px solid #3D1F08; border-radius: 12px; overflow: hidden; }
  .card-head { background: #3D1A00; padding: 24px 28px; border-bottom: 1px solid #5C3010; }
  .logo { font-size: 22px; font-weight: 900; color: #FFF8F2; letter-spacing: 1px; }
  .logo em { color: #FF6B1A; font-style: normal; }
  .card-body { padding: 28px; }
  .greeting { font-size: 16px; font-weight: 700; color: #F5E6D8; margin-bottom: 12px; }
  .desc { font-size: 14px; color: #C4956A; line-height: 1.7; margin-bottom: 24px; }
  .btn { display: inline-block; background: #B84A00; color: #fff; text-decoration: none; padding: 13px 32px; border-radius: 6px; font-size: 14px; font-weight: 700; }
  .btn:hover { background: #D45500; }
  .note { font-size: 11px; color: #7A4A28; margin-top: 20px; line-height: 1.6; }
  .divider { height: 1px; background: #3D1F08; margin: 20px 0; }
  .card-foot { padding: 16px 28px; background: #160C04; font-size: 11px; color: #7A4A28; text-align: center; line-height: 1.6; }
  a { color: #FF6B1A; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="card-head">
      <div class="logo">Mannam<em>place</em></div>
    </div>
    <div class="card-body">
      ${content}
    </div>
    <div class="card-foot">
      이 메일은 Mannamplace에서 자동 발송된 메일입니다.<br>
      문의: <a href="mailto:support@mannamplace.com">support@mannamplace.com</a><br>
      <a href="${SITE_URL}">mannamplace.com</a>
    </div>
  </div>
</div>
</body>
</html>`;
}

// 가입 인증
function templateVerify(nick, verifyUrl) {
  return baseTemplate(`
    <div class="greeting">안녕하세요, ${nick}님! 👋</div>
    <div class="desc">
      Mannamplace에 가입해주셔서 감사합니다.<br>
      아래 버튼을 클릭해 이메일 인증을 완료해주세요.<br>
      (링크는 24시간 후 만료됩니다)
    </div>
    <a href="${verifyUrl}" class="btn">이메일 인증하기</a>
    <div class="divider"></div>
    <div class="note">
      버튼이 작동하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요:<br>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
  `);
}

// 비밀번호 재설정
function templateReset(nick, resetUrl) {
  return baseTemplate(`
    <div class="greeting">비밀번호 재설정 요청</div>
    <div class="desc">
      ${nick}님의 Mannamplace 계정 비밀번호 재설정을 요청하셨습니다.<br>
      아래 버튼을 클릭해 새 비밀번호를 설정해주세요.<br>
      (링크는 1시간 후 만료됩니다)
    </div>
    <a href="${resetUrl}" class="btn">비밀번호 재설정</a>
    <div class="divider"></div>
    <div class="note">
      본인이 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.<br>
      계정 보안이 걱정되시면 <a href="mailto:support@mannamplace.com">support@mannamplace.com</a>으로 문의해주세요.
    </div>
  `);
}

// 댓글 알림
function templateComment(nick, commenterNick, postTitle, postUrl) {
  return baseTemplate(`
    <div class="greeting">💬 새 댓글이 달렸습니다</div>
    <div class="desc">
      ${nick}님의 게시글 <strong style="color:#F5E6D8">"${postTitle || '게시글'}"</strong>에<br>
      <strong style="color:#FF6B1A">${commenterNick || '누군가'}</strong>님이 댓글을 달았습니다.
    </div>
    <a href="${postUrl || SITE_URL}" class="btn">댓글 확인하기</a>
  `);
}

// 등급 승급
function templateRankUp(nick, rank, service) {
  return baseTemplate(`
    <div class="greeting">🎉 축하합니다, ${nick}님!</div>
    <div class="desc">
      <strong style="color:#FF6B1A">${service || 'Mannamplace'}</strong>에서<br>
      회원님의 등급이 <strong style="color:#F5E6D8">${rank}</strong>으로 승급되었습니다.<br><br>
      새로운 등급으로 더 많은 기능을 이용하실 수 있습니다.
    </div>
    <a href="${SITE_URL}" class="btn">서비스 이용하기</a>
  `);
}

// 공지 메일
function templateAnnouncement(title, content) {
  return baseTemplate(`
    <div class="greeting">📢 ${title || 'Mannamplace 공지'}</div>
    <div class="desc">${content || ''}</div>
    <a href="${SITE_URL}" class="btn">자세히 보기</a>
  `);
}
