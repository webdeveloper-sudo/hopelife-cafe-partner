"use client";

import Header from "./Header";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    return (
        <>
            {isLandingPage && <Header />}
            <main className={isLandingPage ? "pt-16" : ""}>
                {children}
            </main>
        </>
    );
}
