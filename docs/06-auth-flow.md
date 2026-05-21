# 06. 인증 전체 흐름

> 가장 헷갈리는 부분. 한 번 그림으로 정리하면 풀림.

## 1. 큰 그림

```
┌─────────────────────────────────────────────────────────────────┐
│                          브라우저                                │
│                                                                 │
│  [회원가입]  →  서버 액션 signUp()  →  Prisma.user.create        │
│                                                                 │
│  [로그인]   →  NextAuth signIn()    →  authorize()              │
│                                            ↓                    │
│                                         JWT 발급                │
│                                            ↓                    │
│                              쿠키(authjs.session-token) 저장    │
│                                                                 │
│  [페이지 이동]  쿠키 자동 전송                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     프론트엔드 서버 (Next.js)                     │
│                                                                 │
│  서버 컴포넌트/서버 액션 안에서:                                   │
│    쿠키에서 JWT 꺼냄                                              │
│    Authorization: Bearer <JWT> 헤더로                            │
│    백엔드 API 호출                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       백엔드 (NestJS)                            │
│                                                                 │
│  @UseGuards(AccessTokenGuard)                                   │
│        ↓                                                        │
│  Passport JWT 전략이 토큰 검증 (AUTH_SECRET으로)                  │
│        ↓                                                        │
│  payload를 req.user에 채움                                       │
│        ↓                                                        │
│  컨트롤러에서 req.user.email 사용                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 회원가입 흐름

[frontend/app/(auth)/signup/page.tsx](../frontend/app/(auth)/signup/page.tsx):

```tsx
"use client";
const result = await signUp({ email, password });
```

호출되는 서버 액션 [frontend/app/actions/auth-actions.ts](../frontend/app/actions/auth-actions.ts):

```ts
"use server";
const user = await prisma.user.create({
  data: {
    email,
    hashedPassword: saltAndHashPassword(password),  // bcrypt 해싱
  },
});
```

**비밀번호는 평문 저장 X.** [frontend/lib/password-utils.ts](../frontend/lib/password-utils.ts)의 `bcrypt.hashSync()`로 단방향 해싱.

## 3. 로그인 흐름

[frontend/app/(auth)/signin/page.tsx](../frontend/app/(auth)/signin/page.tsx):

```tsx
signIn("credentials", { email, password, redirectTo: "/" });
```

이게 호출되면 NextAuth 내부에서 [frontend/auth.ts](../frontend/auth.ts)의 `authorize()` 콜백 실행:

```ts
async authorize(credentials) {
  // 1. DB에서 유저 찾기
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("존재하지 않는 이메일입니다.");

  // 2. 비밀번호 비교 (bcrypt.compareSync)
  const passwordMatch = comparePassword(credentials.password, user.hashedPassword);
  if (!passwordMatch) throw new Error("비밀번호가 일치하지 않습니다.");

  return user;  // 통과 → JWT 발급으로 넘어감
}
```

## 4. 세션 전략: JWT

[frontend/auth.ts](../frontend/auth.ts):

```ts
session: { strategy: "jwt" },

jwt: {
  encode: async ({ token, secret }) => jwt.sign(token, secret),
  decode: async ({ token, secret }) => jwt.verify(token, secret) as JWT,
},
```

**중요 포인트: `jsonwebtoken` 라이브러리로 직접 sign/verify.**

기본 NextAuth는 JWE(암호화된 JWT)를 쓰는데, 백엔드 NestJS가 평범한 JWT만 검증 가능하기 때문에 의도적으로 표준 JWT로 발급. 양쪽이 같은 `AUTH_SECRET`을 공유해야 검증 가능.

발급된 JWT는 쿠키에 자동 저장:
- 개발: `authjs.session-token`
- 운영: `__Secure-authjs.session-token` (HTTPS 전용)

## 5. 백엔드 호출 시 토큰 전달

### 서버 컴포넌트 / 서버 액션에서

[frontend/lib/api.ts](../frontend/lib/api.ts):

```ts
"use server";

async function fetchApi(endpoint, options, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${API_URL}${endpoint}`, { ...options, headers });
}

export async function getUserTest(token?: string) {
  if (!token && typeof window === "undefined") {
    token = await getCookie(AUTH_COOKIE_NAME, { cookies });  // 서버에서 쿠키 읽기
  }
  return fetchApi("/user-test", {}, token);
}
```

서버에서 쿠키 읽기 → `next/headers`의 `cookies()`를 `cookies-next`가 한 번 더 감싸서 편하게 해줌.

### 클라이언트 컴포넌트에서

[frontend/hooks/useApi.ts](../frontend/hooks/useApi.ts):

```ts
"use client";

export function useApi() {
  const token = getCookie(AUTH_COOKIE_NAME) as string;  // 브라우저 document.cookie
  return {
    getUserTest: () => api.getUserTest(token),
  };
}
```

클라이언트는 `document.cookie`에서 직접 읽음.

> **왜 둘 다 필요?** 서버 컴포넌트는 브라우저 API가 없어서 `document.cookie` 사용 불가. 그래서 서버용 코드 따로, 클라이언트용 훅 따로.

## 6. 백엔드에서 토큰 검증

[backend/src/auth/guards/access-token.guard.ts](../backend/src/auth/guards/access-token.guard.ts) 적용:

```ts
@Get('user-test')
@UseGuards(AccessTokenGuard)  // ← 여기서 검증 시작
testUser(@Req() req: Request) {
  return `유저 이메일: ${req.user?.email}`;
}
```

흐름:
1. 가드 발동
2. Passport가 `Authorization: Bearer xxx`에서 토큰 추출
3. `AUTH_SECRET`으로 서명 검증 ← 프론트와 같은 키여야 함
4. payload (예: `{ sub, email, name, ... }`)를 `req.user`에 저장
5. 컨트롤러 본체 실행

**검증 실패 시 401 Unauthorized 자동 응답.**

## 7. AUTH_SECRET 공유의 의미

```
frontend/.env.local              backend/.env.local
AUTH_SECRET=xxxxx        ←→     AUTH_SECRET=xxxxx
   (sign)                          (verify)
```

이 둘이 같아야:
- 프론트가 만든 JWT를 백엔드가 알아볼 수 있음
- 백엔드가 만든 JWT를 프론트가 알아볼 수도 있음 (이 프로젝트는 한 방향만 씀)

다르면 백엔드 `/user-test`가 항상 401.

## 8. 흔한 함정

| 증상 | 원인 |
|---|---|
| `/user-test` 401 | `AUTH_SECRET`이 프론트/백엔드에 다름 |
| `fetch failed` | 백엔드 서버 미실행 또는 `API_URL` 포트 잘못 |
| 로그인 후에도 `session?.user`가 `undefined` | 쿠키 이름 오타 (개발/운영 분기 확인) |
| `req.user.email` 타입 에러 | `backend/src/types/express.d.ts` 누락 |
| 회원가입 후 로그인 실패 | 비밀번호 비교 함수 mismatch (둘 다 bcrypt인지 확인) |

## 정리

이 프로젝트의 인증은 **"NextAuth가 표준 JWT를 발급 → 같은 secret으로 NestJS Passport가 검증"** 패턴.
백엔드와 프론트가 사용자 ID/이메일 정도만 공유하면 되는 단순한 구조여서 입문용으로 좋음. 더 복잡한 시스템(refresh token, 권한 등)은 이 기반 위에 얹는 식.
