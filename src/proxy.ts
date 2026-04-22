import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const sessionStore = request.cookies.get("session")?.value;
    const session = sessionStore ? await decrypt(sessionStore) : null;

    // 1. Landing Page Auto-Navigation
    if (pathname === '/' || pathname === '/home') {
        if (session) {
            if (session.role === 'PARTNER') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
            if (session.role === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
            if (session.role === 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
            }
            if (session.role === 'MARKETING') {
                return NextResponse.redirect(new URL('/marketing/dashboard', request.url));
            }
        }
        
        // If visiting /home specifically and not logged in, redirect to / to show landing page
        if (pathname === '/home') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    }

    // Define protected application routes
    const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/super-admin/login" || pathname.startsWith("/api/auth/login");
    const isAdminRoute = (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) && !isPublicAdminRoute;
    const isPublicPartnerRoute = pathname === "/login" || pathname === "/register" || pathname === "/scan" || pathname.startsWith("/api/auth/login");
    const isPartnerRoute = (pathname.startsWith("/dashboard") || pathname.startsWith("/settings") || pathname.startsWith("/referrals") || pathname.startsWith("/payouts") || pathname.startsWith("/transactions") || pathname.startsWith("/support")) && !isPublicPartnerRoute;
    const isMarketingRoute = pathname.startsWith('/marketing') && pathname !== '/marketing/login' && pathname !== '/marketing/set-password';

    // Public API routes (no auth required for registration/login flow)
    const isPublicApi =
        pathname === "/api/partner/send-otp" ||
        pathname === "/api/partner/verify-otp" ||
        pathname === "/api/partner/register" ||
        pathname === "/api/partner/set-password" ||
        pathname === "/api/marketing/set-password" ||
        pathname.startsWith("/api/auth/login");

    // Protected API routes
    const isProtectedApiRoute = (pathname.startsWith("/api/admin") || pathname.startsWith("/api/super-admin") || pathname.startsWith("/api/partner") || pathname.startsWith("/api/marketing") || pathname.startsWith("/api/whatsapp")) && !isPublicApi;

    if (isAdminRoute || isPartnerRoute || isMarketingRoute || isProtectedApiRoute) {
        
        console.log(`[PROXY DEBUG] Path: ${pathname}, Role: ${session?.role}, HasSession: ${!!session}`);

        if (!session) {
            // Unauthenticated API request
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // Unauthenticated Page request
            if (isAdminRoute) {
                const loginPath = pathname.startsWith("/super-admin") ? "/super-admin/login" : "/admin/login";
                return NextResponse.redirect(new URL(loginPath, request.url));
            } else if (isMarketingRoute) {
                return NextResponse.redirect(new URL('/marketing/login', request.url));
            } else {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        }

        // Role-based access enforcement (Pages)
        if (isAdminRoute && (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        if (isPartnerRoute && session.role !== "PARTNER") {
            return NextResponse.redirect(new URL("/", request.url));
        }
        if (isMarketingRoute && session.role !== "MARKETING") {
            return NextResponse.redirect(new URL("/", request.url));
        }
        
        // Protect APIs from cross-role access (except when Marketing hits partner registration API which is public)
        const currentRole = session.role?.toUpperCase();
        if (pathname.startsWith("/api/admin") && (currentRole !== "ADMIN" && currentRole !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (pathname.startsWith("/api/super-admin") && currentRole !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        // Note: The /api/partner/register is public, so it bypasses `isProtectedApiRoute`. 
        if (pathname.startsWith("/api/partner") && currentRole !== "PARTNER") {
            // Wait, what if Marketing Rep calls some partner API? We don't have any right now except register.
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (pathname.startsWith("/api/marketing") && currentRole !== "MARKETING") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/',
        '/home',
        "/admin/:path*",
        "/super-admin/:path*",
        "/marketing/:path*",
        "/dashboard/:path*",
        "/settings/:path*",
        "/referrals/:path*",
        "/payouts/:path*",
        "/transactions/:path*",
        "/support/:path*",
        "/api/admin/:path*",
        "/api/super-admin/:path*",
        "/api/partner/:path*",
        "/api/marketing/:path*",
        "/api/whatsapp/:path*",
    ],
};
