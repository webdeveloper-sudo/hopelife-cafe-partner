"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function SetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

    const validate = () => {
        const e: typeof errors = {};
        if (password.length < 8) e.password = "Password must be at least 8 characters";
        if (password !== confirmPassword) e.confirm = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/partner/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password, confirmPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to set password");
            setDone(true);
            toast.success("Password set successfully!");
            setTimeout(() => router.push("/login"), 2500);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const strength = password.length === 0 ? 0
        : password.length < 8 ? 1
        : password.length < 12 && !/[A-Z]/.test(password) ? 2
        : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
        : 3;

    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"];

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-md p-10 text-center max-w-md shadow-xl border border-gray-300">
                    <div className="w-16 h-16 bg-red-100 rounded-md border border-gray-300 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-500 text-sm">This link is invalid or has expired. Please contact the admin for a new link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="bg-white rounded-md shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-300">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-[#1a6b3a] to-[#2aab5a] p-8 text-center">
                            {done ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                                    <div className="w-20 h-20 bg-white rounded-md border border-gray-300 flex items-center justify-center mx-auto mb-4 shadow-xl">
                                        <CheckCircle2 className="w-12 h-12 text-[#1a6b3a]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">Password Set!</h2>
                                    <p className="text-white/80 text-sm mt-1">Redirecting you to login...</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white/20 rounded-md border border-white/20 flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-9 h-9 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">Set Your Password</h2>
                                    <p className="text-white/70 text-sm mt-1">Create a secure password for your partner account</p>
                                </>
                            )}
                        </div>

                        {!done && (
                            <div className="p-8">
                                {/* Email display */}
                                <div className="bg-gray-50 rounded-md border border-gray-300 px-4 py-3 mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#1a6b3a]/10 rounded-md border border-gray-300 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-[#1a6b3a]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Email</p>
                                        <p className="text-sm font-bold text-gray-900">{email}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: undefined })); }}
                                                placeholder="Minimum 8 characters"
                                                error={!!errors.password}
                                                className="pr-12 h-12"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
                                        {/* Strength bar */}
                                        {password.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className={`h-1 flex-1 rounded-md border border-gray-300 transition-all duration-300 ${i <= strength ? strengthColors[strength] : "bg-gray-200"}`} />
                                                    ))}
                                                </div>
                                                <p className={`text-[10px] font-bold ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-blue-500" : "text-green-500"}`}>
                                                    {strengthLabels[strength]}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirm Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={e => { setConfirmPassword(e.target.value); setErrors(er => ({ ...er, confirm: undefined })); }}
                                                placeholder="Repeat your password"
                                                error={!!errors.confirm}
                                                className="pr-12 h-12"
                                            />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirm && <p className="text-[10px] text-red-500">{errors.confirm}</p>}
                                        {confirmPassword && !errors.confirm && password === confirmPassword && (
                                            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Passwords match
                                            </p>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full h-13 font-bold text-base mt-2" isLoading={isSubmitting}>
                                        Set Password & Login
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <SetPasswordForm />
        </Suspense>
    );
}
