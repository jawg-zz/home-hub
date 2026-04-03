import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type UserRole = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

const ONE_DAY_IN_SECONDS = 86400;

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials");
          return null;
        }

        console.log(`[Auth] Login attempt for: ${credentials.email}`);
        console.log(`[Auth] Password length: ${(credentials.password as string).length}`);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          console.error(`[Auth] User not found: ${credentials.email}`);
          return null;
        }

        console.log(`[Auth] User found, hash length: ${user.password.length}`);

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        console.log(`[Auth] Password comparison result: ${isValid}`);

        if (!isValid) {
          console.error(`[Auth] Invalid password for: ${credentials.email}`);
          return null;
        }

        console.log(`[Auth] Login successful: ${credentials.email}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const u = user as unknown as UserRole;
        token.id = u.id;
        token.role = u.role;
      }

      // Refresh session on update trigger
      if (trigger === "update") {
        token.iat = Math.floor(Date.now() / 1000);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: ONE_DAY_IN_SECONDS, // 24 hours
  },
  jwt: {
    maxAge: ONE_DAY_IN_SECONDS, // 24 hours
  },
});
