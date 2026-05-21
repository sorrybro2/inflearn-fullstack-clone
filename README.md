# Inflearn Clone (Fullstack)

인프런 클론 풀스택 프로젝트. 강의를 따라가며 만든 학습용 모노레포입니다.

## 기술 스택

### Frontend (`/frontend`)

| 항목 | 버전 |
|---|---|
| Next.js | 15.5.15 (App Router, Turbopack) |
| React | 19.1.0 |
| TypeScript | ^5 |
| Auth.js (next-auth) | 5.0.0-beta.31 |
| Prisma Client | ^6.16.0 |
| bcryptjs | ^3.0.3 |
| Tailwind CSS | ^4 |
| shadcn/ui | ^4.6.0 |
| @base-ui/react | ^1.4.1 |
| Radix UI | ^1.4.3 |
| TanStack Query | ^5.100.6 |
| Jotai | ^2.19.1 |

### Backend (`/backend`)

| 항목 | 버전 |
|---|---|
| NestJS | ^11.0.1 |
| TypeScript | ^5.7.3 |
| Prisma Client | ^6.16.0 |
| Jest | ^30.0.0 |
| ESLint / Prettier | ^9.18.0 / ^3.4.2 |

### 데이터베이스 / 인프라

| 항목 | 버전 |
|---|---|
| PostgreSQL | 16 (Docker) |
| Prisma ORM | 6.x |

### 런타임 / 도구

| 항목 | 버전 |
|---|---|
| Node.js | v22.22.2 |
| pnpm | 10.33.2 |
| Docker Desktop | (PostgreSQL 컨테이너용) |

## 폴더 구조

```
fullstack-clone/
├── frontend/   # Next.js (App Router) + Auth.js
├── backend/    # NestJS API
└── README.md
```

## 실행 방법

### 1. PostgreSQL 컨테이너 실행

```powershell
docker run --name inflearn-postgres `
  -e POSTGRES_USER=prisma `
  -e POSTGRES_PASSWORD=prismapass `
  -e POSTGRES_DB=inflearn_clone `
  -p 5432:5432 `
  -d postgres:16
```

### 2. 환경 변수 설정

`backend/.env`
```
DATABASE_URL="postgresql://prisma:prismapass@localhost:5432/inflearn_clone?schema=public"
```

`backend/.env.local`
```
PORT=3001
DATABASE_URL="postgresql://prisma:prismapass@localhost:5432/inflearn_clone?schema=public"
```

`frontend/.env.local`
```
DATABASE_URL="postgresql://prisma:prismapass@localhost:5432/inflearn_clone?schema=public"
AUTH_SECRET="<pnpm dlx auth secret 로 생성>"
```

### 3. 의존성 설치 & DB 동기화

```powershell
# backend
cd backend
pnpm install
pnpm prisma generate
pnpm prisma db push

# frontend
cd ../frontend
pnpm install
pnpm prisma generate
```

### 4. 개발 서버 실행

```powershell
# backend (포트 3001)
cd backend
pnpm start:dev

# frontend (포트 3000)
cd frontend
pnpm dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001
- API 문서 (Swagger): http://localhost:3001/docs

## 페이지별 기능

| URL | 파일 | 하는 일 |
|---|---|---|
| `/` | [frontend/app/page.tsx](frontend/app/page.tsx) | 서버 컴포넌트. `auth()`로 세션 확인 → 로그인 상태면 이메일 + 로그아웃 버튼, 아니면 로그인 링크 표시. |
| `/signup` | [frontend/app/(auth)/signup/page.tsx](frontend/app/(auth)/signup/page.tsx) | 클라이언트 컴포넌트. 이메일·비밀번호·비밀번호 확인 입력 → 서버 액션 `signUp()` 호출 → bcrypt 해싱 + Prisma로 User 생성 → 성공 시 `/signin`으로 이동. |
| `/signin` | [frontend/app/(auth)/signin/page.tsx](frontend/app/(auth)/signin/page.tsx) | 클라이언트 컴포넌트. NextAuth `signIn("credentials")` 호출 → `authorize()`가 DB 조회 + 비밀번호 비교 → JWT 발급 후 쿠키 저장 → `/`로 redirect. |
| `/api-test` | [frontend/app/api-test/page.tsx](frontend/app/api-test/page.tsx) | 서버 컴포넌트가 `lib/api.ts`로 백엔드 `/user-test`를 호출한 결과 + 클라이언트 컴포넌트가 React Query로 호출한 결과를 한 화면에 표시 (양쪽 다 같은 JWT 사용). |
| `/api/auth/[...nextauth]` | [frontend/app/api/auth/[...nextauth]/route.ts](frontend/app/api/auth/[...nextauth]/route.ts) | NextAuth가 자동으로 제공하는 API 엔드포인트(signin/callback/signout 등). 직접 호출할 일은 없음. |

### 백엔드 엔드포인트

| URL | 파일 | 인증 | 응답 |
|---|---|---|---|
| `GET /` | [backend/src/app.controller.ts](backend/src/app.controller.ts) | 없음 | `"Hello World!"` |
| `GET /user-test` | [backend/src/app.controller.ts](backend/src/app.controller.ts) | `AccessTokenGuard` (Bearer JWT) | `"유저 이메일: <email>"` (토큰의 페이로드에서 추출) |
| `GET /docs` | [backend/src/main.ts](backend/src/main.ts) | 없음 | Swagger UI |

## 학습 노트 (docs/)

리액트·Next·Nest·Prisma·React Query·인증 흐름을 이 프로젝트 코드를 기준으로 정리한 복습 노트.

- [docs/README.md](docs/README.md) — 인덱스 (여기부터 시작)
- [01. React 기초](docs/01-react-basics.md)
- [02. Next.js App Router](docs/02-nextjs-app-router.md)
- [03. NestJS](docs/03-nestjs.md)
- [04. React Query](docs/04-react-query.md)
- [05. Prisma ORM](docs/05-prisma.md)
- [06. 인증 전체 흐름](docs/06-auth-flow.md)
