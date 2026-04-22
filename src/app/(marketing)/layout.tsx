"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Briefcase,
    UserPlus,
    BarChart3,
    ChevronRight,
    LogOut
} from "lucide-react";
import { toast } from "sonner";

const marketingLinks = [
    { name: "My Performance", href: "/marketing/dashboard", icon: BarChart3 },
    { name: "Onboard Partner", href: "/marketing/onboard", icon: UserPlus },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [repInfo, setRepInfo] = React.useState<{ name: string, id: string } | null>(null);

    React.useEffect(() => {
        // Exempt auth pages from the guard
        if (pathname === "/marketing/login" || pathname === "/marketing/set-password") {
            setIsAuthorized(true);
            return;
        }

        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/session");
                const data = await res.json();
                if (data.authenticated && data.user.role === "MARKETING") {
                    setIsAuthorized(true);
                } else {
                    router.replace("/marketing/login");
                }
            } catch (err) {
                router.replace("/marketing/login");
            }
        };

        checkAuth();
    }, [pathname, router]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {}
        toast.info("Logged out successfully.");
        router.replace("/marketing/login");
    };

    const isAuthPage = pathname === "/marketing/login" || pathname === "/marketing/set-password";

    if (!isAuthorized && !isAuthPage) return <div className="min-h-screen bg-surface-light flex items-center justify-center"><div className="w-8 h-8 border-4 border-hope-purple border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900">
            {/* Sidebar - Desktop */}
            {!isAuthPage && (
                <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed h-screen z-40 shadow-xl shadow-gray-200/50">
                    <div className="p-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-hope-purple rounded-xl flex items-center justify-center shadow-lg shadow-hope-purple/20">
                                <Briefcase className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <span className="font-bold text-lg text-gray-900 block leading-none tracking-tight">Marketing</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-black">HOPE Cafe Network</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 px-6 space-y-2 mt-6">
                        {marketingLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                                    pathname === link.href
                                        ? "bg-hope-purple/10 text-hope-purple"
                                        : "text-gray-600 hover:text-hope-purple hover:bg-hope-purple/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5 text-inherit shrink-0" />
                                    <span className="translate-y-[0.5px]">{link.name}</span>
                                </div>
                                {pathname === link.href && (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="px-6 pb-10 mt-auto">
                        <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 mb-6 font-medium">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-black">M</div>
                                <div>
                                    <p className="text-xs font-black text-gray-900">Marketing Rep</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Member</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main className={cn("flex-1 transition-all", !isAuthPage && "lg:ml-72")}>
                <div className={cn("min-h-screen", isAuthPage ? "flex items-center justify-center bg-surface-light" : "p-8 lg:p-12")}>
                    {children}
                </div>
            </main>
        </div>
    );
}
