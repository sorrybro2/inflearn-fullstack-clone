# 05. Prisma ORM

> SQL을 직접 안 쓰고, **타입 안전한 JavaScript 함수로** DB에 접근하게 해주는 도구.

## 1. 기본 흐름

```
schema.prisma (스키마 정의)
   ↓ prisma generate
타입 안전한 Prisma Client (자동 생성된 코드)
   ↓ import
prisma.user.findUnique({ ... })  ← 코드에서 호출
```

## 2. schema.prisma

DB 구조의 단일 진실 공급원.

[backend/prisma/schema.prisma](../backend/prisma/schema.prisma) 발췌:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String?   @unique
  emailVerified  DateTime? @map("email_verified")
  hashedPassword String?   @map("hashed_password")
  image          String?

  accounts Account[]
  sessions Session[]

  @@map("users")
}
```

### 읽는 법

| 표현 | 의미 |
|---|---|
| `model User` | `User` 모델 정의 (DB 테이블 하나) |
| `String?` | nullable String (`?` 없으면 NOT NULL) |
| `@id` | 기본 키 |
| `@default(cuid())` | 기본값으로 cuid 자동 생성 |
| `@unique` | 유일 인덱스 |
| `@map("email_verified")` | TS에선 `emailVerified`, DB 컬럼은 `email_verified` |
| `@@map("users")` | TS에선 `User` 모델, DB 테이블은 `users` |
| `accounts Account[]` | 1:N 관계 (User 하나가 여러 Account) |

## 3. 관계 (Relation)

[backend/prisma/schema.prisma](../backend/prisma/schema.prisma)의 `Account`:

```prisma
model Account {
  id     String @id @default(cuid())
  userId String @map("user_id")
  // ...
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- `userId` — 외래 키 컬럼
- `user User @relation(...)` — 실제 관계 (JOIN 정보)
- `onDelete: Cascade` — User 삭제되면 Account도 같이 삭제

반대편 (`User`)에는 `accounts Account[]`로 표시.

## 4. NextAuth가 기대하는 스키마

이 프로젝트의 `Account`, `Session`, `VerificationToken` 모델은 **NextAuth(Auth.js)가 요구하는 표준 스키마**임. `@auth/prisma-adapter`가 이 테이블 이름과 컬럼을 그대로 쓰기 때문.

- `User` — 사용자 본체
- `Account` — OAuth 계정 (Google, GitHub 등) 정보 저장용
- `Session` — DB 세션 (JWT 전략이면 사용 안 함)
- `VerificationToken` — 이메일 인증 토큰

이 프로젝트는 JWT 전략이라 `Session` 테이블은 비어있을 것. `Account`도 OAuth 안 쓰니 비어있음. 그래도 어댑터 요구사항이라 만들어 둠.

## 5. Prisma Client 사용

```ts
import { prisma } from "@/prisma";  // 미리 만들어 둔 PrismaClient 인스턴스

// 단일 조회
const user = await prisma.user.findUnique({
  where: { email: "abc@test.com" },
});

// 생성
const user = await prisma.user.create({
  data: {
    email,
    hashedPassword: saltAndHashPassword(password),
  },
});

// 여러 개 조회
const users = await prisma.user.findMany({
  where: { name: { contains: "홍" } },
  orderBy: { createdAt: "desc" },
  take: 10,
});

// 수정
await prisma.user.update({
  where: { id: "..." },
  data: { name: "새 이름" },
});

// 삭제
await prisma.user.delete({ where: { id: "..." } });

// 관계 데이터 같이 가져오기
await prisma.user.findUnique({
  where: { id },
  include: { accounts: true },
});
```

이 프로젝트의 실제 예시:
- [frontend/app/actions/auth-actions.ts](../frontend/app/actions/auth-actions.ts) — `findUnique`, `create`
- [frontend/auth.ts](../frontend/auth.ts) — `findUnique`로 로그인 검증

## 6. 자주 쓰는 명령어

```bash
# schema.prisma → DB에 반영 (개발용, 마이그레이션 파일 안 만듦)
pnpm prisma db push

# 마이그레이션 파일 만들고 적용 (운영용 권장)
pnpm prisma migrate dev --name <이름>

# schema.prisma → TypeScript 타입 재생성
pnpm prisma generate

# GUI로 DB 보기 (브라우저에서 표 형태로)
pnpm prisma studio
```

## 7. 이 프로젝트의 특이사항

**Prisma Client가 두 군데에서 import됨:**
- `backend/` — NestJS에서 (현재는 사실상 미사용, 추후 강의에서 추가될 예정)
- `frontend/` — NextAuth의 어댑터와 서버 액션에서

그래서 양쪽 다 `pnpm prisma generate`를 해야 함. (모노레포 구성 때문)

## 다음 문서

→ [06. 인증 전체 흐름](./06-auth-flow.md): 지금까지 본 모든 조각(NextAuth, JWT, Prisma, Passport, 쿠키)이 어떻게 연결되는지.
