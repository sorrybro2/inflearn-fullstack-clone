// [개념] catch-all 동적 라우트 ([...nextauth]) - /api/auth/* 모든 경로를 NextAuth가 자동 처리 (signin, callback, signout 등) → docs/02-nextjs-app-router.md (#5)
import { handlers } from "@/auth" // 방금 만든 auth.ts의 핸들러를 가져옵니다
export const { GET, POST } = handlers