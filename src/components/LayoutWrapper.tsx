"use client";

import React from "react";
import { usePathname } from "next/navigation";
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <main>
                {children}
            </main>
        </>
    );
}
