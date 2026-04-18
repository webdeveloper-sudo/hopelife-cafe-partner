"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ScanLine,
    LayoutDashboard,
    ChevronRight,
    LogOut,
    Coffee,
    Activity,
    Menu,
    X
} from "lucide-react";
import { toast } from "sonner";

const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Scan Pass", href: "/admin/scan", icon: ScanLine },
    { name: "System Logs", href: "/admin/logs", icon: Activity },
];

export default function CafeAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const isPublicPage = pathname === "/admin/login";

        const checkSession = async () => {
            const sessionRaw = sessionStorage.getItem("hopecafe_admin_session");
            
            if (sessionRaw) {
                try {
                    const session = JSON.parse(sessionRaw);
                    if (session.role !== "ADMIN") {
                        toast.error("Access Denied: Cafe Admin privileges required.");
                        router.replace("/admin/login");
                        return;
                    }
                    setIsAuthorized(true);
                } catch {
                    router.replace("/admin/login");
                }
            } else {
                // Try to restore from cookie via API
                try {
                    const res = await fetch("/api/auth/session");
                    const data = await res.json();
                    if (data.authenticated && data.user.role === "ADMIN") {
                        sessionStorage.setItem("hopecafe_admin_session", JSON.stringify({ 
                            role: "ADMIN", 
                            ts: Date.now() 
                        }));
                        setIsAuthorized(true);
                    } else if (!isPublicPage) {
                        router.replace("/admin/login");
                    } else {
                        setIsAuthorized(true);
                    }
                } catch (error) {
                    if (!isPublicPage) router.replace("/admin/login");
                    else setIsAuthorized(true);
                }
            }
        };

        checkSession();
    }, [pathname, router]);

    const handleLogout = () => {
        sessionStorage.removeItem("hopecafe_admin_session");
        toast.info("Cafe Admin session terminated.");
        router.replace("/admin/login");
    };

    const isAuthPage = pathname === "/admin/login";

    if (!isAuthorized && !isAuthPage) return <div className="min-h-screen bg-surface-light flex items-center justify-center"><div className="w-8 h-8 border-4 border-hope-green border-t-transparent rounded-full animate-spin" /></div>;

    const isNavActive = (href: string) => {
        return pathname === href || pathname.startsWith(href + "/");
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-8">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 overflow-hidden transition-transform group-hover:scale-110 p-1">
                        <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <span className="font-black text-xl text-gray-900 block leading-none tracking-tighter">
                            Cafe Admin
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-black">
                            Outlet Operations
                        </span>
                    </div>
                </Link>
            </div>

            <div className="px-6 pb-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-green-200 bg-green-50 text-hope-green text-[10px] font-black uppercase tracking-widest">
                    <Coffee className="w-3 h-3" />
                    Cafe Admin
                </div>
            </div>

            <nav className="flex-1 px-6 space-y-2 mt-2">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                            isNavActive(link.href)
                                ? "bg-hope-green/5 text-hope-green"
                                : "text-gray-600 hover:text-hope-green hover:bg-hope-green/5"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <link.icon className="w-5 h-5 text-inherit shrink-0" />
                            <span className="translate-y-[0.5px]">{link.name}</span>
                        </div>
                        {isNavActive(link.href) && <ChevronRight className="w-4 h-4" />}
                    </Link>
                ))}
            </nav>

            <div className="px-6 pb-10 mt-auto">
                <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 mb-6 font-medium">
                    <p className="text-[10px] text-gray-500 mb-2 font-black uppercase tracking-widest">System Status</p>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-200" />
                        <span className="text-gray-900">All Systems Active</span>
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
        </div>
    );

    return (
        <div className="flex min-h-screen bg-surface-light text-gray-900 overflow-x-hidden">
            {/* Sidebar - Desktop */}
            {!isAuthPage && (
                <aside className="w-72 border-r border-gray-100 hidden lg:flex flex-col fixed h-screen z-50">
                    <SidebarContent />
                </aside>
            )}

            {/* Mobile Header */}
            {!isAuthPage && (
                <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between z-40">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <span className="font-black text-xl text-gray-900 tracking-tighter">Cafe Admin</span>
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

            <main className={cn(
                "flex-1 transition-all w-full", 
                !isAuthPage && "lg:ml-72",
                !isAuthPage && "mt-16 lg:mt-0"
            )}>
                <div className={cn(
                    "min-h-screen", 
                    isAuthPage ? "flex items-center justify-center bg-surface-light" : "p-4 sm:p-8 lg:p-12"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
