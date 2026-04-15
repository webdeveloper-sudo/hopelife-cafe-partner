"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function MarketingLoginPage() {
    const [loading, setLoading] = React.useState(false);
    const [email, setEmail] = React.useState("mark@hopecafe.network");
    const [password, setPassword] = React.useState("hope2026");

    const router = useRouter();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        localStorage.setItem("hopecafe_marketing_session", "active");
        setLoading(false);
        toast.success("Marketing Executive Login Successful");
        router.push("/marketing/dashboard");
    };

    return (
        <div className="min-h-screen bg-surface-light flex items-center justify-center p-4 text-gray-900">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-md"
            >
                <Card className="bg-white border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] overflow-hidden rounded-[2.5rem]">
                    {/* Brand Purple Plate */}
                    <div className="h-32 bg-hope-purple" />

                    <CardHeader className="text-center pt-0 -mt-16">
                        <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500">
                            <div className="w-full h-full bg-hope-purple/5 rounded-[1.8rem] flex items-center justify-center text-hope-purple">
                                <Briefcase className="w-16 h-16" />
                            </div>
                        </div>
                        <CardTitle className="text-4xl font-black text-gray-900 tracking-tight">Executive Auth</CardTitle>
                        <p className="text-gray-400 mt-2 font-bold uppercase tracking-[0.3em] text-[11px]">HOPE Cafe Marketing Network</p>
                    </CardHeader>
                    <CardContent className="p-12">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                                    <Input
                                        className="h-14 pl-14 bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:ring-hope-purple/20 text-lg rounded-2xl transition-all focus:bg-white"
                                        placeholder="name@hopecafe.network"
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
                                        className="h-14 pl-14 bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:ring-hope-purple/20 text-lg rounded-2xl transition-all focus:bg-white"
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
                                className="w-full h-16 text-xl mt-6 shadow-hope-purple/40 bg-hope-purple hover:bg-hope-purple/90 transition-all active:scale-[0.98] text-white"
                                isLoading={loading}
                            >
                                Authorize <ArrowRight className="w-6 h-6 ml-3" />
                            </Button>

                            <div className="pt-8 text-center space-y-4">
                                <div className="p-5 bg-hope-purple/5 border border-hope-purple/10 rounded-2xl">
                                    <p className="text-[11px] font-black text-hope-purple uppercase tracking-widest mb-1">Demo Credentials</p>
                                    <p className="text-sm text-gray-500 font-bold">Key: <span className="text-gray-900 font-black">hope2026</span></p>
                                </div>
                                <Link href="/" className="inline-block text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-hope-purple transition-colors">
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
