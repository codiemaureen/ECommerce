import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get session token (JWT) — works in Edge
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });
  const isAuthenticated = !!token;

  //  Protect specific routes
  const protectedPaths = ["/shipping-address", "/payment-method", "/place-order", "/profile", "/user", "/order", "/admin"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  //  Set sessionCartId cookie if missing
  const cartId = req.cookies.get("sessionCartId");
  if (!cartId) {
    const newCartId = crypto.randomUUID();
    res.cookies.set("sessionCartId", newCartId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: ["/", "/cart", "/checkout", "/account/:path*", "/shipping-address", "/payment-method", "/place-order", "/profile", "/user", "/order", "/admin"],
};
