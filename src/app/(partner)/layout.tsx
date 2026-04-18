"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    UserPlus,
    QrCode,
    ArrowLeftRight,
    Settings,
    HelpCircle,
    LogOut,
    ExternalLink,
    CreditCard
} from "lucide-react";
import { toast } from "sonner";


export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [partnerCode, setPartnerCode] = React.useState("demo");

    const sidebarLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Referrals", href: "/referrals", icon: UserPlus },
        { name: "Register Guest", href: `/p/${partnerCode}`, icon: QrCode },
        { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
        { name: "Earnings & Payouts", href: "/payouts", icon: CreditCard },
    ];

    const secondaryLinks = [
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "Help & Support", href: "/support", icon: HelpCircle },
    ];

    React.useEffect(() => {
        const isPublicPage = pathname === "/login" || pathname === "/register" || pathname === "/scan";

        if (isPublicPage) {
            setIsAuthorized(true);
            return;
        }

        const sessionRaw = localStorage.getItem("hopecafe_partner_session");
        if (!sessionRaw) {
            toast.error("Session expired. Please sign in to continue.");
            router.replace("/login");
        } else {
            const session = JSON.parse(sessionRaw);
            if (session.partnerCode) setPartnerCode(session.partnerCode);
            setIsAuthorized(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("hopecafe_partner_session");
        toast.info("Signed out successfully.");
        router.replace("/login");
    };

    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/scan";

    if (!isAuthorized) return <div className="min-h-screen bg-surface-light" />;

    return (
        <div className="flex min-h-screen bg-surface-light">
            {/* Sidebar - Desktop (Only on dashboard pages) */}
            {!isAuthPage && (
                <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed h-screen z-40">
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 overflow-hidden transition-transform group-hover:scale-110">
                                <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-black text-2xl text-gray-900 tracking-tighter">HOPE Cafe</span>
                        </Link>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 mt-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Main Menu</p>
                        {sidebarLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                                    pathname === link.href
                                        ? "bg-hope-purple/5 text-hope-purple"
                                        : "text-gray-500 hover:text-hope-purple hover:bg-hope-purple/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5 shrink-0" />
                                    <span className="translate-y-[0.5px]">{link.name}</span>
                                </div>
                            </Link>
                        ))}
                    </nav>

                    <div className="px-4 space-y-1 mt-auto pb-8">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">Support</p>
                        {secondaryLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-hope-purple hover:bg-hope-purple/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5 shrink-0" />
                                    <span className="translate-y-[0.5px]">{link.name}</span>
                                </div>
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-4"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content Area */}
            <main className={cn("flex-1 transition-all", !isAuthPage && "lg:ml-64")}>
                <div className={cn("min-h-screen", isAuthPage ? "p-4 flex items-center justify-center" : "p-8 pb-10")}>
                    {children}
                </div>
            </main>
        </div>
    );
}
