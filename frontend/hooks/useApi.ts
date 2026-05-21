// [개념] 커스텀 훅 - "use" 접두사 함수. 클라이언트에선 document.cookie로 토큰 읽어 서버 액션에 전달 (서버 컴포넌트와 경로 다름) → docs/01-react-basics.md (#7), docs/06-auth-flow.md (#5)
"use client";

import { getCookie } from "cookies-next/client";
import * as api from "@/lib/api";

const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export function useApi() {
  // 클라이언트에서 쿠키 가져오기
  const token = getCookie(AUTH_COOKIE_NAME) as string;

  return {
    getUserTest: () => api.getUserTest(token),
  };
}