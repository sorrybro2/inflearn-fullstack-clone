# 01. React 기초

> 진짜 처음부터. "리액트도 잘 모름" 기준으로 복습.

## 1. 컴포넌트란?

**화면의 한 조각을 만드는 함수**. 함수가 JSX(HTML처럼 생긴 것)를 리턴하면 그게 컴포넌트.

```tsx
function Hello() {
  return <p>안녕하세요</p>;
}
```

이걸 다른 곳에서 `<Hello />`라고 쓰면 그 자리에 `<p>안녕하세요</p>`가 들어감.

이 프로젝트에서 가장 단순한 컴포넌트 예시:
- [frontend/app/page.tsx](../frontend/app/page.tsx) — `Home` 함수가 JSX를 리턴. 이게 곧 컴포넌트.

## 2. JSX

JSX는 JavaScript 안에 HTML을 쓸 수 있게 해주는 문법. 단 몇 가지 차이:

| HTML | JSX |
|---|---|
| `class="..."` | `className="..."` |
| `for="..."` | `htmlFor="..."` |
| `onclick` | `onClick` (카멜케이스) |
| 닫는 태그 생략 가능 | 무조건 닫아야 함 (`<input />`) |

중괄호 `{}` 안에는 JavaScript 표현식이 들어감.

```tsx
const name = "코딩";
return <p>안녕 {name}!</p>; // → 안녕 코딩!
```

## 3. Props (부모 → 자식 데이터 전달)

부모 컴포넌트가 자식에게 데이터를 내려주는 방법. **HTML 속성처럼 생겼지만 객체가 통째로 전달됨.**

```tsx
function Greet({ name }: { name: string }) {
  return <p>{name}님 환영</p>;
}

// 사용
<Greet name="홍길동" />
```

## 4. State (컴포넌트 내부 상태)

**컴포넌트가 기억해야 하는 값**. 사용자가 입력한 값, 토글 상태, 카운트 등.

`useState`는 React가 제공하는 함수 (이런 걸 **훅**이라고 부름).

```tsx
const [email, setEmail] = useState(""); // 초기값 ""
```

- `email` — 현재 값
- `setEmail` — 값을 바꿀 때 호출하는 함수. **이걸 호출해야 화면이 다시 그려진다.**

직접 `email = "abc"`로 바꾸면 화면이 안 바뀜. 반드시 `setEmail("abc")` 호출.

이 프로젝트의 예시 → [frontend/app/(auth)/signin/page.tsx](../frontend/app/(auth)/signin/page.tsx):

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}  // 입력할 때마다 setEmail
/>
```

## 5. 훅 (Hook)

**`use~`로 시작하는 React 함수.** 컴포넌트 최상단에서 호출해서 React의 기능을 빌려쓰는 도구.

기본 훅:
| 훅 | 용도 |
|---|---|
| `useState` | 상태 저장 |
| `useEffect` | 외부 작업 (API 호출, 구독 등) 실행 |
| `useRef` | DOM 요소 직접 접근 / 리렌더링 없이 값 보관 |
| `useMemo` | 무거운 계산 결과 캐싱 |
| `useCallback` | 함수 자체를 캐싱 (자식에 prop으로 넘길 때) |

**규칙 두 가지:**
1. 컴포넌트(또는 다른 훅) 안에서만 호출
2. 컴포넌트 최상단에서 호출 (조건문/반복문 안에서 호출 X)

### `useEffect` 한 줄 요약

> 컴포넌트가 화면에 그려진 **뒤에** 무언가 실행하고 싶을 때.

```tsx
useEffect(() => {
  console.log("처음 렌더링되거나 count가 바뀔 때마다 실행");
}, [count]); // [] 안에 있는 값이 바뀔 때만 실행
```

이 프로젝트에선 직접 쓴 곳이 없음 (React Query가 대신 처리). 다음 단계에서 나옴.

## 6. 이벤트 핸들러

`onClick`, `onSubmit`, `onChange` 등에 함수를 넘기는 것.

```tsx
<button onClick={() => alert("클릭")}>버튼</button>

<form onSubmit={(e) => {
  e.preventDefault();  // ← form 기본 동작(페이지 새로고침) 막기
  // 처리...
}}>
```

이 프로젝트의 예시 → [frontend/app/(auth)/signup/page.tsx](../frontend/app/(auth)/signup/page.tsx)의 `handleSubmit`.

## 7. 커스텀 훅

`use`로 시작하는 함수를 직접 만들 수도 있음. 여러 컴포넌트가 같은 로직을 공유할 때 유용.

이 프로젝트의 예시 → [frontend/hooks/useApi.ts](../frontend/hooks/useApi.ts):

```ts
export function useApi() {
  const token = getCookie(AUTH_COOKIE_NAME) as string;
  return {
    getUserTest: () => api.getUserTest(token),
  };
}
```

`useApi()`를 호출하면 토큰이 자동으로 붙은 API 함수들이 리턴됨.

## 다음 문서

→ [02. Next.js App Router](./02-nextjs-app-router.md): 컴포넌트가 어떻게 URL과 연결되는지, 서버에서 도는 컴포넌트와 브라우저에서 도는 컴포넌트의 차이.
