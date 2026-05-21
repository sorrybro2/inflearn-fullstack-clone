// [개념] 서버 컴포넌트 안에서 클라이언트 컴포넌트 import - 같은 페이지에 두 방식 혼용 가능. 서버에선 await fetch, 클라이언트에선 React Query → docs/02-nextjs-app-router.md (#2)
 import * as api from "@/lib/api";
import ClientTest from "./client-test";

export default async function ApiTestPage() {
  const apiResult = await api.getUserTest();

  return (
    <div className="p-8">
      <h1>백엔드 API 테스트</h1>
      <h2>서버 컴포넌트 API 테스트 결과</h2>
      <pre>{apiResult}</pre>
      <ClientTest />
    </div>
  );
}