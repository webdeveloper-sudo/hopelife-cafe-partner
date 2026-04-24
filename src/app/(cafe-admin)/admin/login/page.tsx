"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";

export default function CafeAdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    React.useEffect(() => {
        const session = sessionStorage.getItem("hopecafe_admin_session");
        if (session) {
            router.push("/admin/dashboard");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "ADMIN", email, password }),
            });

            const data = await res.json();

            if (data.success && data.role === "ADMIN") {
                sessionStorage.setItem("hopecafe_admin_session", JSON.stringify({ role: "ADMIN", ts: Date.now() }));
                toast.success("Cafe Admin Authorization Granted");
                router.push("/admin/dashboard");
            } else if (data.success && data.role !== "ADMIN") {
                toast.error("This account does not have Cafe Admin privileges. Use Super Admin login instead.");
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
        <AuthLayout>
            <div className="w-full max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="bg-white rounded-md border border-gray-300 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
                        {/* Left panel - Cafe Specific */}
                        <div className="md:col-span-2 bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl border border-gray-300 overflow-hidden p-2">
                                    <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-3xl font-bold mb-3 leading-tight tracking-tight">Outlet <br />Operations Console</h2>
                                <p className="text-white/70 text-sm mb-8">Manage real-time guest scans, bill settlements, and partner referral tracking from a single outlet node.</p>
                                <div className="space-y-4">
                                    {[
                                        "Real-time guest QR scan logic",
                                        "Instant commission calculation",
                                        "End-to-end bill settlement",
                                        "Secure node authentication",
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-sm font-medium">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative z-10 mt-10 p-5 bg-white/10 rounded-md border border-white/10 backdrop-blur-sm">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Operational Node v1.1 Active</p>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="md:col-span-3 p-10 bg-white">
                            <div className="mb-8 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cafe Admin</h1>
                                <p className="text-gray-400 text-sm mt-1 uppercase font-black tracking-widest text-[10px]">Secure Authorization Required</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Outlet Admin Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            className="pl-12 h-14 bg-gray-50/50"
                                            placeholder="outlet@hopecafe.com"
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Key Access</label>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            className="pl-12 h-14 bg-gray-50/50"
                                            placeholder="••••••••"
                                            required
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-16 text-xl font-bold mt-4" isLoading={loading}>
                                    Verify Operations <ArrowRight className="w-6 h-6 ml-2" />
                                </Button>

                                <div className="pt-8 border-t border-gray-100 text-center">
                                    <Link href="/" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#2D6A4F] transition-colors">
                                        ← Back to Global Page
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
