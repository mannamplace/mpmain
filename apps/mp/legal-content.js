// ══════════════════════════════════════════════════════════
// Mannamplace Legal Document Content
// legal-content.js
//
// IMPORTANT: This is DRAFT boilerplate covering the standard
// disclosure items required by GDPR and Korea's PIPA (개인정보
// 보호법). It has NOT been reviewed by counsel. Do not treat
// this as legal advice — have a licensed attorney (ideally one
// familiar with both regimes) review and adapt before publishing.
//
// Design: each doc is stored here as a versioned default. The
// admin-panel work item lets ops override these per-locale in
// Firestore (`legal_documents/{docType}_{locale}`) without a
// redeploy; the Worker (index.js) checks Firestore first and
// falls back to this bundled copy if no override exists yet.
// ══════════════════════════════════════════════════════════

export const LEGAL_VERSION = "2026-07-09.1";

const COMPANY_NAME = "Mannamplace";
const PRIVACY_OFFICER_CONTACT = "privacy@mannamplace.com"; // PIPA requires a named privacy officer + contact
const DPO_CONTACT = "dpo@mannamplace.com"; // GDPR Art. 37 — set to a real DPO if one is designated

export const PRIVACY_POLICY = {
  ko: {
    title: "개인정보 처리방침",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "1. 수집하는 개인정보 항목 및 수집 방법",
        p: `Mannamplace(이하 "회사")는 회원가입, 서비스 이용 과정에서 아래와 같은 정보를 수집합니다.
- 필수: 이메일, 닉네임, Mannamplace ID, 비밀번호(또는 OAuth 제공자 식별자)
- 서비스 이용 중 자동 수집: 접속 로그, 쿠키, 기기 정보, 서비스 이용 기록
- 서비스별 추가 수집: 메신저(연락처 동기화 시), Move(위치 정보, 이용자 동의 시), Pay(결제 관련 정보)`,
      },
      {
        h: "2. 개인정보의 수집 및 이용 목적",
        p: `회원 관리, 서비스 제공 및 개선, 부정 이용 방지, 고객 문의 대응, 관계 법령에 따른 보관 의무 이행을 위해 이용합니다.`,
      },
      {
        h: "3. 개인정보의 보유 및 이용 기간",
        p: `회원 탈퇴 시 지체 없이 파기하는 것을 원칙으로 하되, 관계 법령(전자상거래법, 통신비밀보호법 등)에서 정한 기간 동안은 예외로 보관합니다. 서비스별 구체적 보유 기간은 각 서비스 이용약관에 명시합니다.`,
      },
      {
        h: "4. 개인정보의 제3자 제공 및 국외 이전",
        p: `회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않는 것을 원칙으로 하며, 법령에 근거가 있거나 이용자가 별도로 동의한 경우에 한해 제공합니다. 클라우드 인프라(Cloudflare) 및 데이터베이스(Google Firestore) 운영 과정에서 개인정보가 국외 서버에 저장·처리될 수 있으며, 이 경우 이전 국가, 이전 항목, 이전 목적을 별도 고지합니다.`,
      },
      {
        h: "5. 정보주체의 권리와 행사 방법",
        p: `이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 계정 설정 페이지 또는 아래 연락처를 통해 요청할 수 있습니다.`,
      },
      {
        h: "6. 쿠키의 설치·운영 및 거부",
        p: `쿠키 사용에 관한 세부 사항은 별도의 쿠키 정책 페이지를 참고하시기 바랍니다.`,
      },
      {
        h: "7. 개인정보 보호책임자",
        p: `개인정보 보호책임자: ${COMPANY_NAME} 개인정보보호팀
연락처: ${PRIVACY_OFFICER_CONTACT}
이용자는 회사의 서비스를 이용하며 발생한 모든 개인정보 관련 문의를 위 연락처로 문의할 수 있습니다.`,
      },
      {
        h: "8. 고지의 의무",
        p: `이 방침은 관련 법령, 정책 또는 서비스 변경에 따라 개정될 수 있으며, 개정 시 시행일자 7일 전(중대한 변경은 30일 전)부터 서비스 내 공지사항을 통해 고지합니다.`,
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "1. Information We Collect",
        p: `${COMPANY_NAME} ("we", "the Company") collects the following categories of information:
- Required at signup: email address, nickname, Mannamplace ID, password (or OAuth provider identifier)
- Collected automatically: access logs, cookies, device information, service usage records
- Additional, service-specific data: Messenger (contacts, if you enable sync), Move (location, with your consent), Pay (payment-related information)`,
      },
      {
        h: "2. Purpose of Collection and Use",
        p: `We use this information to manage accounts, provide and improve the service, prevent fraud and abuse, respond to support requests, and meet retention obligations under applicable law.`,
      },
      {
        h: "3. Retention Period",
        p: `We delete personal data without undue delay after account deletion, except where law requires longer retention (e.g. e-commerce or communications-related recordkeeping requirements). Service-specific retention periods are set out in each service's terms.`,
      },
      {
        h: "4. Third-Party Disclosure and International Transfers",
        p: `We do not share personal data with third parties without consent, except where required by law or separately agreed to. Our infrastructure (Cloudflare) and database (Google Firestore) may store and process data outside your country of residence; where this occurs, we disclose the destination country, the data categories transferred, and the purpose of transfer.`,
      },
      {
        h: "5. Your Rights",
        p: `Subject to applicable law, you may request access to, correction of, deletion of, or a restriction on processing of your personal data, and — where GDPR applies — data portability and objection to processing. Requests can be made from your account settings or via the contact below.`,
      },
      {
        h: "6. Legal Basis for Processing (GDPR, where applicable)",
        p: `Where the GDPR applies, we process personal data on the basis of: performance of a contract (providing the service you signed up for), consent (e.g. optional cookie categories, marketing communications), and legitimate interest (e.g. fraud prevention, service security).`,
      },
      {
        h: "7. Cookies",
        p: `See our separate Cookie Policy for details on cookie categories and how to manage your preferences.`,
      },
      {
        h: "8. Contacts",
        p: `Privacy inquiries: ${PRIVACY_OFFICER_CONTACT}
EU data protection inquiries (GDPR Art. 37, where applicable): ${DPO_CONTACT}`,
      },
      {
        h: "9. Changes to This Policy",
        p: `We may update this policy to reflect changes in law or our services. Material changes will be announced in-service at least 30 days before taking effect; minor changes, at least 7 days before.`,
      },
    ],
  },
};

export const TERMS_OF_SERVICE = {
  ko: {
    title: "이용약관",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "1. 목적",
        p: `이 약관은 ${COMPANY_NAME}(이하 "회사")가 제공하는 커뮤니티, 뉴스, 메신저, 마켓, 결제 등 모든 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
      },
      {
        h: "2. 계정 및 Mannamplace ID",
        p: `이용자는 이메일 또는 외부 OAuth(Google, Naver 등) 로그인을 통해 가입할 수 있으며, 이 경우 고유한 Mannamplace ID를 설정해야 합니다. 계정 정보의 관리 책임은 이용자 본인에게 있으며, 제3자에게 계정을 양도·대여할 수 없습니다.`,
      },
      {
        h: "3. 서비스의 제공 및 변경",
        p: `회사는 서비스의 전부 또는 일부를 운영상·기술상 필요에 따라 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 단, 긴급한 보안 문제 등 불가피한 사유가 있는 경우 사후에 공지할 수 있습니다.`,
      },
      {
        h: "4. 이용자의 의무",
        p: `이용자는 관계 법령, 이 약관, 이용안내 및 서비스와 관련하여 회사가 공지한 사항을 준수하여야 하며, 다음 행위를 하여서는 안 됩니다: 타인의 정보 도용, 서비스 운영 방해, 저작권 등 지식재산권 침해, 청소년에게 유해한 정보의 유통, 불법적인 금전 거래(포인트의 현금화 등) 목적의 이용.`,
      },
      {
        h: "5. 게시물의 관리",
        p: `이용자가 작성한 게시물의 저작권은 이용자 본인에게 있으나, 회사는 서비스 운영·홍보 목적으로 필요한 범위 내에서 이를 사용할 수 있습니다. 관계 법령 및 이 약관에 위반되는 게시물은 사전 통지 없이 삭제될 수 있습니다.`,
      },
      {
        h: "6. 포인트 및 가상 자산에 관한 사항",
        p: `서비스 내 포인트는 현금 또는 이에 준하는 자산으로 환전되지 않으며, 서비스 내에서만 사용 가능합니다. 포인트를 스테이블코인 등 가상자산으로 전환하는 기능은 현재 제공되지 않습니다.`,
      },
      {
        h: "7. 면책 조항",
        p: `회사는 천재지변, 불가항력적 사유로 인한 서비스 중단, 이용자의 귀책사유로 인한 손해에 대해 책임을 지지 않습니다.`,
      },
      {
        h: "8. 분쟁 해결 및 준거법",
        p: `이 약관과 관련한 분쟁은 대한민국 법을 준거법으로 하며, 관할 법원은 관계 법령에 따라 정합니다.`,
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "1. Purpose",
        p: `These Terms govern the conditions and procedures for using all services provided by ${COMPANY_NAME} ("the Company") — including community, news, messaging, marketplace, and payment features (together, the "Service") — and set out the rights, obligations, and responsibilities of the Company and users.`,
      },
      {
        h: "2. Accounts and Mannamplace ID",
        p: `You may sign up by email or via external OAuth providers (Google, Naver, etc.), in which case you must choose a unique Mannamplace ID. You are responsible for safeguarding your account credentials and may not transfer or lend your account to a third party.`,
      },
      {
        h: "3. Changes to the Service",
        p: `The Company may modify or discontinue all or part of the Service for operational or technical reasons, with advance notice where practicable. Notice may follow after the fact where urgent action (e.g. a security issue) is required.`,
      },
      {
        h: "4. User Obligations",
        p: `You agree to comply with applicable law, these Terms, and any service guidelines the Company publishes, and not to: impersonate others, interfere with Service operation, infringe intellectual property rights, distribute content harmful to minors, or use the Service for unlawful monetary transactions (including cashing out in-service points).`,
      },
      {
        h: "5. User Content",
        p: `You retain copyright in content you post, but grant the Company the right to use it as reasonably necessary to operate and promote the Service. Content that violates law or these Terms may be removed without prior notice.`,
      },
      {
        h: "6. Points and Virtual Assets",
        p: `In-service points cannot be exchanged for cash or cash-equivalent assets and may only be used within the Service. Conversion of points into stablecoins or other virtual assets is not currently offered.`,
      },
      {
        h: "7. Limitation of Liability",
        p: `The Company is not liable for service interruptions caused by force majeure or events beyond its reasonable control, or for damages arising from a user's own fault.`,
      },
      {
        h: "8. Dispute Resolution and Governing Law",
        p: `These Terms are governed by the laws of the Republic of Korea, without prejudice to any mandatory consumer-protection rights you may have under the law of your country of residence (e.g. under EU/EEA consumer law, where applicable).`,
      },
    ],
  },
};

export const COOKIE_POLICY = {
  ko: {
    title: "쿠키 정책",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "1. 쿠키란?",
        p: `쿠키는 웹사이트가 이용자의 브라우저에 저장하는 작은 텍스트 파일로, 로그인 유지, 서비스 이용 통계 수집 등에 사용됩니다.`,
      },
      {
        h: "2. 사용하는 쿠키의 종류",
        p: `- 필수 쿠키: 로그인 세션 유지, 보안, 기본 기능 제공 (거부 시 서비스 일부 이용 불가)
- 분석 쿠키: 서비스 이용 패턴 분석 및 기능 개선 (동의 시에만 사용)
- 마케팅 쿠키: 관심사 기반 추천, 광고 효과 측정 (동의 시에만 사용)`,
      },
      {
        h: "3. 쿠키 설정 변경",
        p: `하단의 "쿠키 설정 관리" 버튼을 통해 언제든지 동의 항목을 변경할 수 있습니다.`,
      },
    ],
  },
  en: {
    title: "Cookie Policy",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "1. What Are Cookies?",
        p: `Cookies are small text files a website stores in your browser, used for purposes such as maintaining your login session and collecting usage statistics.`,
      },
      {
        h: "2. Categories of Cookies We Use",
        p: `- Essential: maintains your login session, security, and core functionality (declining may limit parts of the Service)
- Analytics: helps us understand usage patterns and improve features (used only with consent)
- Marketing: interest-based recommendations and ad performance measurement (used only with consent)`,
      },
      {
        h: "3. Managing Your Preferences",
        p: `You can change your consent choices at any time using the "Manage cookie settings" button below.`,
      },
    ],
  },
};
