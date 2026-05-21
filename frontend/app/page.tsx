// [개념] 서버 컴포넌트 (async function) - await로 직접 세션/DB 접근 가능, useState 등 클라이언트 훅은 사용 불가 → docs/02-nextjs-app-router.md (#2)
import { auth } from "@/auth";
import { signOut } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <p>현재 로그인한 유저 보여주기</p>
      <p>이메일 = {session?.user?.email}</p>
      {session?.user ? (
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit">로그아웃</button>
        </form>
      ) : (
        <Link href="/signin">로그인</Link>
      )}
    </div>
  );
}