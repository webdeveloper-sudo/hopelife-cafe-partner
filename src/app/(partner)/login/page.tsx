"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";

export default function PartnerLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    React.useEffect(() => {
        const session = sessionStorage.getItem("hopecafe_partner_session");
        if (session) {
            router.push("/dashboard");
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "PARTNER", email: email, password: password }),
            });

            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem("hopecafe_partner_session", JSON.stringify({ role: "PARTNER", partnerCode: data.partnerCode, ts: Date.now() }));
                toast.success("Login Successful");
                router.push(data.redirectUrl || "/dashboard");
            } else {
                toast.error(data.error || "Partner account not found.");
            }
        } catch (error) {
            toast.error("Network Error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout blur="blur-[3px]" overlayOpacity="bg-black/30">
            <div className="w-full max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="bg-white rounded-md border border-gray-300 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
                        {/* Left panel */}
                        <div className="md:col-span-2 bg-gradient-to-br from-hope-purple to-[#3E1E5E] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl border border-gray-300 overflow-hidden p-2">
                                    <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-3xl font-bold mb-3 leading-tight tracking-tight">Partner <br />Portal Access</h2>
                                <p className="text-white/70 text-sm mb-8">Access your dashboard to track referrals, payouts, and network growth.</p>
                                <div className="space-y-4">
                                    {[
                                        "Real-time referral tracking",
                                        "Weekly UPI settlements",
                                        "Exclusive partner priority",
                                        "Direct support protocol",
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
                                <p className="text-xs text-white/80 italic leading-relaxed">"The transparency in referral tracking is unmatched. Exceptional platform."</p>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="md:col-span-3 p-10 bg-white">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Partner Login</h1>
                                <p className="text-gray-400 text-sm mt-1">Authenticate to enter your dashboard.</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            className="pl-12 h-12"
                                            placeholder="name@business.com"
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                                        <Link href="#" className="text-[10px] font-bold text-hope-purple uppercase tracking-widest hover:underline">Forgot Key?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            className="pl-12 h-12"
                                            placeholder="••••••••"
                                            required
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-14 text-lg font-bold mt-4" isLoading={loading}>
                                    Verify & Log In <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>

                                <div className="pt-8 border-t border-gray-100 text-center">
                                    <p className="text-sm font-medium text-gray-400">
                                        New to the network?{" "}
                                        <Link href="/register" className="text-hope-purple font-bold hover:underline">Apply to Join</Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
