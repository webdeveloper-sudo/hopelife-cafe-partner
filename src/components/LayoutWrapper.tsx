"use client";

import Header from "./Header";
import { usePathname } from "next/navigation";
import CapacitorBridge from "./CapacitorBridge";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/about";

    return (
        <>
            <CapacitorBridge />
            {isLandingPage && <Header />}
            <main className={isLandingPage ? "pt-16" : ""}>
                {children}
            </main>
        </>
    );
}

