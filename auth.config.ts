import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      credentials: {},
      async authorize() {
        return null;
      },
    }),
  ],
  callbacks: {
    authorized() {
      return true;
    },
  },
};

// For Edge Middleware
export const { auth } = NextAuth(authConfig);

// For server usage (like getServerSession)
export const authSession = () => NextAuth(authConfig).auth;