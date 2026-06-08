"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, Key, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";

type PageMode = "login" | "forgot-email" | "forgot-otp" | "forgot-reset";

export default function PartnerLoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<PageMode>("login");
    const [loading, setLoading] = useState(false);
    
    // Login & Forgot states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // OTP states
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Reset password states
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetToken, setResetToken] = useState("");

    useEffect(() => {
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

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to send OTP");
            }
            toast.success("OTP sent to your email!");
            setMode("forgot-otp");
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const digits = [...otpDigits];
        digits[index] = value;
        setOtpDigits(digits);
        setOtpError("");
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (text.length === 6) {
            setOtpDigits(text.split(""));
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otp = otpDigits.join("");
        if (otp.length < 6) {
            setOtpError("Please enter all 6 digits");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Verification failed");
            }
            setResetToken(data.resetToken);
            toast.success("OTP verified successfully!");
            setMode("forgot-reset");
            setPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setOtpError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, resetToken, password, confirmPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Reset password failed");
            }
            toast.success("Password reset successfully! Please login.");
            setMode("login");
            setPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.message);
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
                                    <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                        <div className="md:col-span-3 p-10 bg-white flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                
                                {/* ── MODE 1: LOGIN FORM ── */}
                                {mode === "login" && (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                    >
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
                                                    <button
                                                        type="button"
                                                        onClick={() => setMode("forgot-email")}
                                                        className="text-[10px] font-bold text-hope-purple uppercase tracking-widest hover:underline focus:outline-none"
                                                    >
                                                        Forgot Password?
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        className="pl-12 pr-12 h-12"
                                                        placeholder="••••••••"
                                                        required
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
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
                                    </motion.div>
                                )}

                                {/* ── MODE 2: FORGOT PASSWORD EMAIL INPUT ── */}
                                {mode === "forgot-email" && (
                                    <motion.div
                                        key="forgot-email"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Forgot Password</h1>
                                            <p className="text-gray-400 text-sm mt-1">Enter your registered email to receive a recovery code.</p>
                                        </div>
                                        <form onSubmit={handleSendOtp} className="space-y-6">
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

                                            <Button type="submit" className="w-full h-14 text-lg font-bold mt-4" isLoading={loading}>
                                                Send Verification Code <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>

                                            <div className="pt-6 border-t border-gray-100 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setMode("login")}
                                                    className="text-sm font-bold text-hope-purple hover:underline focus:outline-none"
                                                >
                                                    ← Back to Login
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* ── MODE 3: FORGOT PASSWORD OTP VERIFICATION ── */}
                                {mode === "forgot-otp" && (
                                    <motion.div
                                        key="forgot-otp"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Verify Security Code</h1>
                                            <p className="text-gray-400 text-sm mt-1">We sent a 6-digit confirmation code to your email.</p>
                                        </div>
                                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center mb-4">Enter Security Code</label>
                                                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                                                    {otpDigits.map((digit, i) => (
                                                        <input
                                                            key={i}
                                                            ref={el => { otpRefs.current[i] = el; }}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={e => handleOtpChange(i, e.target.value)}
                                                            onKeyDown={e => handleOtpKeyDown(i, e)}
                                                            className={`w-12 h-14 text-center text-2xl font-black rounded-md border-2 border-gray-300 outline-none transition-all ${
                                                                otpError ? "border-red-400 bg-red-50 text-red-600 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" :
                                                                digit ? "border-hope-purple bg-purple-50 text-hope-purple" :
                                                                "focus:border-hope-purple focus:shadow-lg focus:shadow-purple-500/10"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                {otpError && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -10 }} 
                                                        animate={{ opacity: 1, y: 0 }} 
                                                        className="text-center text-xs font-bold text-red-500 mt-4 bg-red-50 py-2 rounded-md"
                                                    >
                                                        {otpError}
                                                    </motion.p>
                                                )}
                                            </div>

                                            <Button type="submit" className="w-full h-14 text-lg font-bold mt-4" isLoading={loading} disabled={otpDigits.some(d => !d)}>
                                                Verify Code <ShieldCheck className="w-5 h-5 ml-2" />
                                            </Button>

                                            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    onClick={() => setMode("forgot-email")}
                                                    className="text-xs font-bold text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    ← Change Email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setMode("login")}
                                                    className="text-xs font-bold text-hope-purple hover:underline focus:outline-none"
                                                >
                                                    Back to Login
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                                {/* ── MODE 4: RESET PASSWORD FORM ── */}
                                {mode === "forgot-reset" && (
                                    <motion.div
                                        key="forgot-reset"
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Reset Password</h1>
                                            <p className="text-gray-400 text-sm mt-1">Create a new secure password for your partner account.</p>
                                        </div>
                                        <form onSubmit={handleResetPassword} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        className="pl-12 pr-12 h-12"
                                                        placeholder="••••••••"
                                                        required
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        className="pl-12 pr-12 h-12"
                                                        placeholder="••••••••"
                                                        required
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full h-14 text-lg font-bold mt-4" isLoading={loading}>
                                                Update Password <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>

                                            <div className="pt-6 border-t border-gray-100 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setMode("login")}
                                                    className="text-sm font-bold text-hope-purple hover:underline focus:outline-none"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
