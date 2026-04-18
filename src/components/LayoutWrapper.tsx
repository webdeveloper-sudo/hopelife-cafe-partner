"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard =
        pathname.includes("/admin") ||
        pathname.includes("/dashboard") ||
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/marketing") ||
        pathname.includes("/referrals") ||
        pathname.includes("/scan") ||
        pathname.includes("/transactions") ||
        pathname.includes("/settings") ||
        pathname.includes("/support") ||
        pathname.includes("/payouts") ||
        pathname.startsWith("/pass/") ||
        pathname.startsWith("/p/") ||
        pathname.includes("/thank-you");

    return (
        <>
            {!isDashboard && <Header />}
            <main className={isDashboard ? "" : "pt-16"}>
                {children}
            </main>
        </>
    );
}
