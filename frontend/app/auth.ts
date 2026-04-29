import { prisma } from "@/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    useSecureCookies: process.env.NODE_ENV  === "production",
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {
                    label: "이메일",
                    type: "email",
                    placeholder: "이메일 입력",
                },
                password: {
                    label: "비밀번호",
                    type: "password",
                },
            },
        })
    ],
})