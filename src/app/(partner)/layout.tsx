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
    CreditCard,
    Menu,
    X
} from "lucide-react";
import { toast } from "sonner";


export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [partnerCode, setPartnerCode] = React.useState("demo");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

        const checkSession = async () => {
            const sessionRaw = sessionStorage.getItem("hopecafe_partner_session");
            
            if (sessionRaw) {
                const session = JSON.parse(sessionRaw);
                if (session.partnerCode) setPartnerCode(session.partnerCode);
                setIsAuthorized(true);
            } else {
                // Try to restore from cookie via API
                try {
                    const res = await fetch("/api/auth/session");
                    const data = await res.json();
                    if (data.authenticated && data.user.role === "PARTNER") {
                        sessionStorage.setItem("hopecafe_partner_session", JSON.stringify({ 
                            role: "PARTNER", 
                            partnerCode: data.user.partnerCode, 
                            ts: Date.now() 
                        }));
                        if (data.user.partnerCode) setPartnerCode(data.user.partnerCode);
                        setIsAuthorized(true);
                    } else if (!isPublicPage) {
                        toast.error("Session expired. Please sign in to continue.");
                        router.replace("/login");
                    } else {
                        setIsAuthorized(true);
                    }
                } catch (error) {
                    if (!isPublicPage) router.replace("/login");
                    else setIsAuthorized(true);
                }
            }
        };

        checkSession();
    }, [pathname, router]);

    const handleLogout = () => {
        sessionStorage.removeItem("hopecafe_partner_session");
        toast.info("Signed out successfully.");
        router.replace("/login");
    };

    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/scan";

    if (!isAuthorized && !isAuthPage) return <div className="min-h-screen bg-surface-light flex items-center justify-center"><div className="w-8 h-8 border-4 border-hope-purple border-t-transparent rounded-full animate-spin" /></div>;

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
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
                        onClick={() => setIsMobileMenuOpen(false)}
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
                        onClick={() => setIsMobileMenuOpen(false)}
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
        </div>
    );

    return (
        <div className="flex min-h-screen bg-surface-light overflow-x-hidden">
            {/* Sidebar - Desktop */}
            {!isAuthPage && (
                <aside className="w-64 border-r border-gray-100 hidden lg:flex flex-col fixed h-screen z-50">
                    <SidebarContent />
                </aside>
            )}

            {/* Mobile Header */}
            {!isAuthPage && (
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between z-40">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-black text-xl text-gray-900 tracking-tighter">HOPE Cafe</span>
                    </Link>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {!isAuthPage && isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar - Drawer */}
            {!isAuthPage && (
                <aside className={cn(
                    "fixed top-0 left-0 bottom-0 w-72 bg-white z-[70] transition-transform duration-300 ease-in-out lg:hidden",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full shadow-2xl"
                )}>
                    <div className="absolute top-4 right-4 z-[80]">
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                    <SidebarContent />
                </aside>
            )}

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 transition-all w-full", 
                !isAuthPage && "lg:ml-64",
                !isAuthPage && "mt-16 lg:mt-0"
            )}>
                <div className={cn(
                    "min-h-screen", 
                    isAuthPage ? "p-4 flex items-center justify-center" : "p-4 sm:p-6 lg:p-8 pb-10"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
