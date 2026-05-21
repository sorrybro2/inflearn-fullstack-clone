# 04. React Query (TanStack Query)

> 정확한 이름은 **TanStack Query** (예전엔 React Query). 라이브러리 import는 `@tanstack/react-query`.

## 1. 왜 쓰나?

**서버에서 가져온 데이터를 관리하기 위한 라이브러리.**

직접 `fetch` + `useState` + `useEffect`로 만들면 매번 다음을 직접 짜야 함:
- 로딩 상태 (`isLoading`)
- 에러 상태 (`error`)
- 캐싱 (같은 데이터 또 가져오지 않기)
- 자동 재요청 (탭 다시 활성화될 때 등)
- 중복 요청 합치기

React Query는 이걸 다 알아서 해줌.

## 2. 셋업

루트 레이아웃 어딘가에서 `QueryClient`를 만들고 `QueryClientProvider`로 감싸야 함.

[frontend/app/config/provider.tsx](../frontend/app/config/provider.tsx):
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

이걸 [frontend/app/layout.tsx](../frontend/app/layout.tsx)에서 루트에 적용:
```tsx
<Providers>{children}</Providers>
```

## 3. `useQuery` — 데이터 가져오기

```tsx
const { data, error, isLoading } = useQuery({
  queryKey: ["user-test"],          // ← 캐시 키 (고유해야 함)
  queryFn: () => api.getUserTest(), // ← 실제 fetch 함수
});
```

이 프로젝트의 예시 → [frontend/app/api-test/client-test.tsx](../frontend/app/api-test/client-test.tsx):

```tsx
"use client";

export default function ClientTest() {
  const api = useApi();

  const { data, error, isLoading } = useQuery({
    queryKey: ["user-test"],
    queryFn: () => api.getUserTest(),
  });

  if (isLoading) return <div>로딩중 ...</div>;

  return <pre>{data}</pre>;
}
```

| 반환값 | 의미 |
|---|---|
| `data` | 받아온 데이터 (`queryFn` 리턴값) |
| `error` | 에러 |
| `isLoading` | 첫 로딩 중인가? |
| `isFetching` | 재요청 포함 fetch 중인가? |
| `refetch` | 수동으로 다시 가져오는 함수 |

## 4. `queryKey`의 중요성

캐시의 "주소". 같은 키 = 같은 데이터로 간주.

```tsx
// 단순한 데이터
queryKey: ["posts"]

// 파라미터가 있는 데이터
queryKey: ["post", postId]   // postId가 바뀌면 다른 캐시
queryKey: ["users", { page: 1, size: 20 }]
```

## 5. `useMutation` — 데이터 변경 (POST/PUT/DELETE)

읽기는 `useQuery`, 쓰기는 `useMutation`.

```tsx
const mutation = useMutation({
  mutationFn: (newPost) => api.createPost(newPost),
  onSuccess: () => {
    // 캐시 무효화 → 자동으로 다시 가져옴
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});

// 호출
mutation.mutate({ title: "새 글" });
```

이 프로젝트엔 아직 안 쓰임. 강의 후반에서 나옴.

## 6. 서버 컴포넌트와의 관계

**서버 컴포넌트에선 React Query 안 써도 됨.** 그냥 `await fetch(...)` 하면 끝.

```tsx
// 서버 컴포넌트 (app/api-test/page.tsx)
export default async function ApiTestPage() {
  const apiResult = await api.getUserTest();  // 직접 await
  return <pre>{apiResult}</pre>;
}
```

**클라이언트 컴포넌트**에서 사용자 인터랙션 후 데이터를 가져와야 할 때 React Query가 빛남.

이 프로젝트의 [frontend/app/api-test/page.tsx](../frontend/app/api-test/page.tsx)는 두 방식을 한 페이지에 보여주는 데모임.

## 다음 문서

→ [05. Prisma ORM](./05-prisma.md): DB와 대화하는 방법.
