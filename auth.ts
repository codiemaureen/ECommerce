import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import { compareSync } from "bcryptjs";
import { authConfig } from "./auth.config";

const fullConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (
          user &&
          user.password &&
          compareSync(credentials.password as string, user.password)
        ) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
};

export const { auth, handlers, signIn, signOut } = NextAuth(fullConfig);
