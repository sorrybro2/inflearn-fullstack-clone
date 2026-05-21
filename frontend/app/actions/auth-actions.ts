// [개념] 서버 액션 - "use server" 파일의 export는 클라이언트에서 import해 호출 가능하지만 실행은 서버. 비밀번호 해싱 + Prisma DB 쓰기 → docs/02-nextjs-app-router.md (#4), docs/06-auth-flow.md (#2)
"use server";

import { saltAndHashPassword } from "@/lib/password-utils";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export async function signUp({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return { status: "error", message: "이미 존재하는 이메일입니다." };
    }

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword: saltAndHashPassword(password),
      },
    });

    if (user) {
      return { status: "ok" };
    }
  } catch (err) {
    console.error(err);
    return { status: "error", message: "회원가입에 실패했습니다." };
  }
}
