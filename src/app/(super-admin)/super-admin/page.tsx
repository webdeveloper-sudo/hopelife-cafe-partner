"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        const sessionRaw = sessionStorage.getItem("hopecafe_superadmin_session");
        if (sessionRaw) {
            router.replace("/super-admin/dashboard");
            return;
        }

        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.user?.role === "SUPER_ADMIN") {
                    sessionStorage.setItem("hopecafe_superadmin_session", JSON.stringify({ 
                        role: "SUPER_ADMIN", 
                        ts: Date.now() 
                    }));
                    router.replace("/super-admin/dashboard");
                } else {
                    router.replace("/super-admin/login");
                }
            })
            .catch(() => {
                router.replace("/super-admin/login");
            });
    }, [router]);

    return (
        <div className="min-h-screen bg-[#1E0B36] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-hope-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
