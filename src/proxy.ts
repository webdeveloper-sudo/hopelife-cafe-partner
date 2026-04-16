import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes
    const isPublicAdminRoute = pathname === "/admin/login" || pathname.startsWith("/api/auth/login");
    const isAdminRoute = pathname.startsWith("/admin") && !isPublicAdminRoute;
    const isPublicPartnerRoute = pathname === "/login" || pathname === "/register" || pathname === "/scan" || pathname.startsWith("/api/auth/login");
    const isPartnerRoute = (pathname.startsWith("/dashboard") || pathname.startsWith("/settings") || pathname.startsWith("/referrals") || pathname.startsWith("/payouts") || pathname.startsWith("/transactions")) && !isPublicPartnerRoute;

    // Public partner routes (no auth required for registration flow)
    const isPublicPartnerApi =
        pathname === "/api/partner/send-otp" ||
        pathname === "/api/partner/verify-otp" ||
        pathname === "/api/partner/register" ||
        pathname === "/api/partner/set-password";

    // Protected API routes
    const isProtectedApiRoute = (pathname.startsWith("/api/admin") || pathname.startsWith("/api/partner") || pathname.startsWith("/api/whatsapp")) && !isPublicPartnerApi;

    if (isAdminRoute || isPartnerRoute || isProtectedApiRoute) {
        const sessionStore = request.cookies.get("session")?.value;
        const session = sessionStore ? await decrypt(sessionStore) : null;

        if (!session) {
            // Unauthenticated API request
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Unauthenticated Page request
            if (isAdminRoute) {
                return NextResponse.redirect(new URL("/admin/login", request.url));
            } else {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }

        // Role-based access enforcement
        if (isAdminRoute && session.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        if (isPartnerRoute && session.role !== "PARTNER") {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        // Protect admin APIs from partner tokens and vice versa
        if (pathname.startsWith("/api/admin") && session.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (pathname.startsWith("/api/partner") && session.role !== "PARTNER") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/:path*",
        "/settings/:path*",
        "/referrals/:path*",
        "/payouts/:path*",
        "/transactions/:path*",
        "/api/admin/:path*",
        "/api/partner/:path*",
        "/api/whatsapp/:path*",
    ],
};
