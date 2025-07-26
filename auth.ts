import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import { compareSync } from "bcryptjs";
import { authConfig } from "./auth.config";
import { cookies } from "next/headers";

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
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;
      
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });
      
            if (sessionCart) {
              await prisma.cart.deleteMany({ where: { userId: user.id } });
      
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
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
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.role = token.role;
      return session;
    }
    ,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
      }

      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }

      return token;
    }

  }
};

// Edge middleware handler
export const { auth: middlewareAuth, handlers, signIn, signOut } = NextAuth(fullConfig);

// Server usage: session getter
export const auth = () => NextAuth(fullConfig).auth();
