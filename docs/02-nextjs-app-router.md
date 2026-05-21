# 02. Next.js App Router

> Next.js 15의 App Router 기준. (`/pages` 디렉토리 쓰는 옛날 방식 아님)

## 1. 파일 = 라우트

`frontend/app/` 폴더 안에 `page.tsx` 파일을 만들면 그 폴더가 URL이 됨.

| 파일 경로 | URL |
|---|---|
| `app/page.tsx` | `/` |
| `app/signin/page.tsx` | `/signin` |
| `app/api-test/page.tsx` | `/api-test` |
| `app/(auth)/signin/page.tsx` | `/signin` (괄호 폴더는 URL에 포함 X) |

### 특수 파일 이름

| 파일 | 의미 |
|---|---|
| `page.tsx` | 그 URL에서 보여지는 화면 |
| `layout.tsx` | 그 URL과 **하위 모든 URL**을 감싸는 공통 wrapper |
| `loading.tsx` | 로딩 중 화면 |
| `error.tsx` | 에러 화면 |
| `route.ts` | API 라우트 (HTML 대신 JSON 응답) |

### Route Group `(이름)`

폴더명을 괄호로 감싸면 **URL에는 안 들어가지만 그룹으로 묶기** 위한 용도.

이 프로젝트에선 [frontend/app/(auth)/](../frontend/app/(auth)/) — `signin`, `signup`을 묶지만 URL은 그대로 `/signin`, `/signup`.

## 2. 서버 컴포넌트 vs 클라이언트 컴포넌트

**App Router의 컴포넌트는 기본적으로 서버 컴포넌트.** 이게 가장 헷갈리는 포인트.

| | 서버 컴포넌트 | 클라이언트 컴포넌트 |
|---|---|---|
| 어디서 도나? | 서버 (Node.js) | 브라우저 |
| 표시 방법 | (기본값, 아무것도 안 씀) | 파일 맨 위에 `"use client"` |
| 쓸 수 있는 것 | `await`, DB 접근, 환경변수, 비밀키 | `useState`, `onClick`, `useEffect`, 브라우저 API |
| 쓸 수 없는 것 | `useState`, `onClick` 등 | DB 직접 접근, 서버 비밀키 |

### 이 프로젝트 예시

**서버 컴포넌트** → [frontend/app/page.tsx](../frontend/app/page.tsx):
```tsx
export default async function Home() {
  const session = await auth();  // ← 서버에서 auth() 호출 (DB/쿠키 접근)
  return <p>이메일 = {session?.user?.email}</p>;
}
```
`async`/`await`이 자연스럽게 됨. 비밀 정보도 안전.

**클라이언트 컴포넌트** → [frontend/app/(auth)/signin/page.tsx](../frontend/app/(auth)/signin/page.tsx):
```tsx
"use client";  // ← 이거 있으면 클라이언트

export default function SigninPage() {
  const [email, setEmail] = useState("");  // 훅 사용 가능
  // ...
}
```

### 언제 무엇을?
- **기본은 서버 컴포넌트로** 둔다 (페이지 무게가 가벼워짐)
- 사용자 입력, 이벤트, 상태가 필요하면 그 부분만 `"use client"`로 빼낸다
- 한 페이지에 두 종류 섞일 수 있음 → [frontend/app/api-test/page.tsx](../frontend/app/api-test/page.tsx)가 좋은 예. 서버 컴포넌트 안에서 클라이언트 컴포넌트(`<ClientTest />`)를 import해서 같이 보여줌.

## 3. Layout

`layout.tsx`는 자식 URL들을 감싸는 wrapper. **페이지 전환 시 리렌더 안 됨** (그래서 사이드바, 헤더 같은 거 두기 좋음).

[frontend/app/layout.tsx](../frontend/app/layout.tsx) — 루트 레이아웃. 모든 페이지가 `<Providers>`로 감싸짐.

```tsx
<html>
  <body>
    <Providers>{children}</Providers>  {/* ← 각 page.tsx가 여기에 들어옴 */}
  </body>
</html>
```

## 4. 서버 액션 (Server Action)

**클라이언트에서 호출하지만 서버에서 실행되는 함수.** 폼 처리/DB 쓰기에 쓰임.

함수(또는 파일) 맨 위에 `"use server"`를 붙임.

### 이 프로젝트 예시

[frontend/app/actions/auth-actions.ts](../frontend/app/actions/auth-actions.ts):
```ts
"use server";  // ← 이 파일의 모든 export는 서버에서 실행됨

export async function signUp({ email, password }) {
  const user = await prisma.user.create({ ... });  // DB 직접 접근
  return { status: "ok" };
}
```

호출은 평범하게:
```tsx
// signup/page.tsx (클라이언트 컴포넌트)
const result = await signUp({ email, password });
```

**작동 방식:** Next.js가 알아서 클라이언트의 호출을 fetch 요청으로 바꿔서 서버로 보내고, 서버에서 함수를 실행한 뒤 결과를 돌려줌. **개발자는 그냥 함수 호출처럼 쓰면 됨.**

### "use server" vs "use client"
헷갈리지 말 것. 둘은 정반대 의미.
- `"use client"` — 이 컴포넌트는 **브라우저에서 실행**
- `"use server"` — 이 함수는 **서버에서 실행** (호출은 어디서든)

## 5. API 라우트 (`route.ts`)

`route.ts`를 만들면 그 URL이 API 엔드포인트가 됨.

[frontend/app/api/auth/[...nextauth]/route.ts](../frontend/app/api/auth/[...nextauth]/route.ts):
```ts
export const { GET, POST } = handlers
```

`[...nextauth]` — 대괄호 + `...` = **catch-all**. `/api/auth/signin`, `/api/auth/callback/...` 등 하위 모든 경로를 잡아냄. NextAuth가 알아서 처리.

## 6. 환경변수

- `.env.local` — 로컬 개발용 (gitignore됨)
- 서버에서만 읽힘: `process.env.AUTH_SECRET`
- 브라우저에서도 읽으려면 `NEXT_PUBLIC_` 접두사 필요: `process.env.NEXT_PUBLIC_API_URL`

이 프로젝트는 서버 컴포넌트/서버 액션에서만 백엔드를 호출하므로 `NEXT_PUBLIC_` 안 씀.

## 다음 문서

→ [03. NestJS](./03-nestjs.md): 백엔드는 어떻게 구성돼 있는지.
