"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Crown, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SuperAdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    React.useEffect(() => {
        const session = sessionStorage.getItem("hopecafe_superadmin_session");
        if (session) {
            router.push("/super-admin/dashboard");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "SUPER_ADMIN", email, password }),
            });

            const data = await res.json();

            if (data.success && data.role === "SUPER_ADMIN") {
                sessionStorage.setItem("hopecafe_superadmin_session", JSON.stringify({ role: "SUPER_ADMIN", ts: Date.now() }));
                toast.success("Super Admin Authorization Granted");
                router.push("/super-admin/dashboard");
            } else if (data.success && data.role !== "SUPER_ADMIN") {
                toast.error("This account does not have Super Admin privileges.");
            } else {
                toast.error(data.error || "Access Denied");
            }
        } catch (error) {
            toast.error("Network Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-light flex items-center justify-center p-4 text-gray-900">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-md"
            >
                <Card className="bg-white border border-gray-300 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden rounded-md">
                    <div className="h-[80px] bg-gradient-to-r from-amber-600 to-amber-700" />

                    <CardHeader className="text-center pt-0 -mt-16">
                        <div className="w-32 h-32 bg-white rounded-md flex items-center justify-center mx-auto mb-6 border border-gray-300 shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500 overflow-hidden">
                            <img 
                                src="/logo.png" 
                                alt="HOPE Cafe Logo" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">Super Admin</CardTitle>
                        <p className="text-gray-400 mt-2 font-bold uppercase tracking-[0.3em] text-[11px]">HQ Enterprise Console</p>
                    </CardHeader>
                    <CardContent className="px-12 pb-14 pt-4">
                        <form onSubmit={handleLogin} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                    <Input
                                        className="h-14 pl-14 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-amber-500/20 text-lg rounded-md transition-all focus:bg-white"
                                        placeholder="hq@hopecafe.com"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Key</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                    <Input
                                        className="h-14 pl-14 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-amber-500/20 text-lg rounded-md transition-all focus:bg-white"
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="w-full h-16 text-xl mt-6 shadow-amber-600/30 bg-amber-600 hover:bg-amber-700 transition-all rounded-md active:scale-[0.98] text-white"
                                isLoading={loading}
                            >
                                Authorize <ArrowRight className="w-6 h-6 ml-3" />
                            </Button>

                            <div className="pt-8 text-center space-y-4">
                                <Link href="/" className="inline-block text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-amber-600 transition-colors">
                                    ← Back to Public Interface
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
