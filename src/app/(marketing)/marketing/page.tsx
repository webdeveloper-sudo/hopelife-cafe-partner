"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketingIndexPage() {
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.user?.role === "MARKETING") {
                    router.replace("/marketing/dashboard");
                } else {
                    router.replace("/marketing/login");
                }
            })
            .catch(() => {
                router.replace("/marketing/login");
            });
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-hope-pink border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
