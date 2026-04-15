"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function PartnerLoginPage() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("demo@partner.hub");
    const [password, setPassword] = React.useState("partner2026");

    const router = useRouter();
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
                // Sync JWT session with localStorage guard used by the partner layout
                localStorage.setItem("hopecafe_partner_session", JSON.stringify({ role: "PARTNER", partnerCode: data.partnerCode, ts: Date.now() }));
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
        <div className="min-h-screen bg-surface-light flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Card className="border-none shadow-2xl overflow-hidden">
                    <CardHeader className="text-center pt-10">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white overflow-hidden">
                            <img 
                                src="/logo.png" 
                                alt="HOPE Cafe Logo" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardTitle className="text-3xl font-black">Partner Login</CardTitle>
                        <p className="text-gray-400 mt-2 font-medium">Access your global referral center</p>
                    </CardHeader>
                    <CardContent className="p-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        className="pl-12"
                                        placeholder="name@company.com"
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                                    <Link href="#" className="text-[10px] font-black text-hope-green uppercase tracking-widest hover:underline">Forgot?</Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        className="pl-12"
                                        placeholder="••••••••"
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-14 text-lg" isLoading={loading}>
                                Authorize Access <LogIn className="w-5 h-5 ml-2" />
                            </Button>

                            <div className="pt-6 border-t border-gray-50 text-center space-y-4">
                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Demo Credentials</p>
                                    <p className="text-xs text-gray-600 font-bold">Password: <span className="text-hope-green text-sm">partner2026</span></p>
                                </div>
                                <p className="text-sm font-medium text-gray-400">
                                    New to the network?{" "}
                                    <Link href="/register" className="text-hope-green font-bold hover:underline">Register Hub</Link>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
