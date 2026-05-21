# 학습 노트 (docs/)

강의에서 다룬 개념을 **이 프로젝트의 코드 기준**으로 정리한 복습용 노트입니다.
코드의 어떤 파일이 어떤 개념을 보여주는지 같이 적어놨으니, 노트 읽다가 실제 코드를 바로 열어볼 수 있어요.

순서대로 읽기를 추천합니다. (앞 내용을 알아야 뒤에서 막히지 않음)

| # | 문서 | 다루는 내용 |
|---|---|---|
| 1 | [React 기초](./01-react-basics.md) | 컴포넌트, JSX, props, state, 주요 훅 (`useState`, `useEffect`) |
| 2 | [Next.js App Router](./02-nextjs-app-router.md) | 파일 기반 라우팅, 서버/클라이언트 컴포넌트, 서버 액션, layout, route group |
| 3 | [NestJS](./03-nestjs.md) | 모듈/컨트롤러/서비스 3층, 데코레이터, 의존성 주입, 가드 |
| 4 | [React Query](./04-react-query.md) | `QueryClient`, `useQuery`, 서버 상태 관리 |
| 5 | [Prisma ORM](./05-prisma.md) | 스키마, 모델, 관계, Prisma Client |
| 6 | [인증 전체 흐름](./06-auth-flow.md) | NextAuth → JWT → 쿠키 → Bearer → Passport 가드까지 한 큐 |

## 한 페이지 요약

```
[브라우저]
   ↓ 회원가입 form (signup/page.tsx)
   ↓ → 서버 액션 signUp() → Prisma로 User 생성 (비밀번호 bcrypt 해싱)
   ↓
   ↓ 로그인 form (signin/page.tsx)
   ↓ → NextAuth signIn("credentials")
   ↓ → DB에서 User 찾고 비밀번호 비교
   ↓ → JWT 발급 → 쿠키(authjs.session-token)에 저장
   ↓
[프론트엔드 서버 컴포넌트 / 클라이언트 컴포넌트]
   ↓ 쿠키에서 JWT 꺼냄
   ↓ Authorization: Bearer <JWT> 헤더로 백엔드 호출
   ↓
[NestJS 백엔드]
   ↓ AccessTokenGuard → Passport JWT 전략으로 토큰 검증
   ↓ req.user에 payload 채워서 컨트롤러로 전달
   ↓ /user-test → "유저 이메일: xxx" 응답
```
