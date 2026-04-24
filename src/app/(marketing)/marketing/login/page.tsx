"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";

export default function MarketingLoginPage() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("mark@hopecafe.network");
    const [password, setPassword] = React.useState("hope2026");

    const router = useRouter();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "MARKETING", email, password }),
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success("Marketing Executive Login Successful");
                router.push(data.redirectUrl || "/marketing/dashboard");
            } else {
                toast.error(data.error || "Login failed");
            }
        } catch (error) {
            toast.error("An error occurred during login");
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
                        {/* Left panel - Marketing Specific */}
                        <div className="md:col-span-2 bg-gradient-to-br from-hope-pink to-[#880E4F] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl border border-gray-300 overflow-hidden p-2 text-hope-pink">
                                    <img src="/logo.png" alt="Logo" className="object-fit" />
                                </div>
                                <h2 className="text-3xl font-bold mb-3 leading-tight tracking-tight">Marketing <br />Network Login</h2>
                                <p className="text-white/70 text-sm mb-8">Executive portal for partner onboarding, performance auditing, and referral growth management.</p>
                                <div className="space-y-4">
                                    {[
                                        "Partner onboarding pipeline",
                                        "In-depth performance data",
                                        "Marketing resource management",
                                        "Tiered commission tracking",
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
                            <div className="relative z-10 mt-10 p-5 bg-white/10 rounded-md border border-white/10 backdrop-blur-sm text-center">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Developer Demo Mode</p>
                                <p className="text-sm font-bold">Key: hope2026</p>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="md:col-span-3 p-10 bg-white">
                            <div className="mb-8 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Auth</h1>
                                <p className="text-gray-400 text-sm mt-1 uppercase font-black tracking-widest text-[10px]">Marketing Operations Protocol</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            className="pl-12 h-14 bg-gray-50/50"
                                            placeholder="mark@hopecafe.network"
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secret Key</label>
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

                                <Button type="submit" className="w-full h-16 text-xl font-bold mt-4 bg-hope-pink hover:bg-pink-700" isLoading={loading}>
                                    Authorize Marketing <ArrowRight className="w-6 h-6 ml-2" />
                                </Button>

                                <div className="pt-8 border-t border-gray-100 text-center">
                                    <Link href="/" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-hope-pink transition-colors">
                                        ← Back to Website
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
