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
