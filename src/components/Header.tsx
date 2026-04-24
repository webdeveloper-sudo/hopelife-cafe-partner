"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { QrCode, LogIn, Shield } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Header() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-white/95 backdrop-blur-2xl py-4 border-b border-hope-purple/10 shadow-[0_8px_30px_rgba(93,46,140,0.06)]"
                    : "bg-transparent py-6 border-b border-transparent"
            )}
        >
            {/* Top decorative gradient edge */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-hope-purple via-hope-pink to-hope-gold" />

            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
                <div className="flex justify-between items-center relative py-2 sm:py-0">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group relative z-10 transition-transform hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-hope-purple/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                            className="h-16 sm:h-20 w-auto relative z-10 flex items-center"
                            role="img"
                            aria-label="HOPE Cafe Logo"
                        >
                            <img 
                                src="/logo.png" 
                                alt="HOPE Cafe" 
                                className="h-full w-auto object-contain scale-125 sm:scale-135 origin-left px-2" 
                            />
                        </motion.div>
                    </Link>

                    {/* Navigation */}
                    {!isAuthPage && (
                        <nav className="flex items-center gap-4 relative z-10">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-[#1A1A1A] hover:text-hope-purple transition-all px-4 py-2 rounded-md hover:bg-hope-purple/5"
                            >
                                Partner Login
                            </Link>

                            <Link href="/register">
                                <Button className="rounded-md bg-hope-purple text-white hover:bg-[#4A2470] font-bold text-sm px-6 h-10 shadow-lg shadow-hope-purple/10">
                                    Join Network
                                </Button>
                            </Link>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}
