// ══════════════════════════════════════════
// Mannamplace Mail Client
// 사용법: 각 사이트 HTML에 이 파일 내용을 포함하거나
//         <script src="https://mannamplace.com/mail.js"> 로 로드
// ══════════════════════════════════════════

const MAIL_WORKER_URL = "https://mail.mannamplace.com";

const MannamMail = {

  // ── 공통 발송 함수 ──
  async send(type, to, data = {}) {
    try {
      const res = await fetch(MAIL_WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, to, data })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "발송 실패");
      return { success: true, id: result.id };
    } catch (e) {
      console.error("[MannamMail] 발송 실패:", e.message);
      return { success: false, error: e.message };
    }
  },

  // ── 가입 인증 메일 ──
  // 사용: MannamMail.sendVerify("user@email.com", "닉네임", "https://...")
  async sendVerify(email, nick, verifyUrl) {
    return this.send("verify", email, { nick, verifyUrl });
  },

  // ── 비밀번호 재설정 메일 ──
  async sendReset(email, nick, resetUrl) {
    return this.send("reset", email, { nick, resetUrl });
  },

  // ── 댓글 알림 ──
  async sendCommentNotif(email, nick, commenterNick, postTitle, postUrl) {
    return this.send("comment", email, { nick, commenterNick, postTitle, postUrl });
  },

  // ── 등급 승급 알림 ──
  async sendRankUp(email, nick, rank, service) {
    return this.send("rank_up", email, { nick, rank, service });
  },
};

// ══════════════════════════════════════════
// Firebase Auth와 연동 — 가입 시 자동 인증 메일 발송
// ══════════════════════════════════════════

// 사용 예시 (포털/커뮤니티/Cistan 가입 함수에 추가):
//
// async function doJoin() {
//   ...
//   const cred = await createUserWithEmailAndPassword(auth, email, pw);
//
//   // Firebase 이메일 인증 링크 생성
//   const { sendEmailVerification } = await import("firebase/auth");
//   await sendEmailVerification(cred.user, {
//     url: "https://mannamplace.com?verified=true"
//   });
//
//   // 또는 Resend로 커스텀 인증 메일 발송
//   await MannamMail.sendVerify(email, nick, `https://mannamplace.com/verify?uid=${cred.user.uid}`);
//   ...
// }

export default MannamMail;
