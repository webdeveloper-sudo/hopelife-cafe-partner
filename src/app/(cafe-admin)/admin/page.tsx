"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CafeAdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        const sessionRaw = sessionStorage.getItem("hopecafe_admin_session");
        if (sessionRaw) {
            router.replace("/admin/dashboard");
            return;
        }

        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && (data.user?.role === "ADMIN" || data.user?.role === "SUPER_ADMIN")) {
                    sessionStorage.setItem("hopecafe_admin_session", JSON.stringify({ 
                        role: data.user.role, 
                        name: data.user.name,
                        ts: Date.now() 
                    }));
                    router.replace("/admin/dashboard");
                } else {
                    router.replace("/admin/login");
                }
            })
            .catch(() => {
                router.replace("/admin/login");
            });
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-hope-purple border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
