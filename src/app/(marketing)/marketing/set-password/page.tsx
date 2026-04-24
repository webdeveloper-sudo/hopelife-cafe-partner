"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";

function SetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
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
            const res = await fetch("/api/marketing/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setIsSuccess(true);
                toast.success("Marketing account secured!");
            } else {
                toast.error(data.error || "Failed to set password. Link might be expired.");
            }
        } catch (err) {
            toast.error("A network error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-md p-10 text-center shadow-xl border border-gray-300">
                    <div className="w-16 h-16 bg-red-100 rounded-md border border-gray-300 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-500 text-sm">This invitation link is invalid or has expired. Please contact your administrator.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="bg-white rounded-md shadow-2xl overflow-hidden border border-gray-300">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-hope-pink to-[#880E4F] p-8 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                        {isSuccess ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                                <div className="w-20 h-20 bg-white rounded-md border border-gray-300 flex items-center justify-center mx-auto mb-4 shadow-xl">
                                    <CheckCircle2 className="w-12 h-12 text-[#880E4F]" />
                                </div>
                                <h2 className="text-2xl font-black text-white">Access Granted!</h2>
                                <p className="text-white/80 text-sm mt-1">Your marketing account is now ready.</p>
                            </motion.div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white/20 rounded-md border border-white/20 flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-9 h-9 text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-white">Secure Executive Account</h2>
                                <p className="text-white/70 text-sm mt-1">Set a secure password for the marketing portal</p>
                            </>
                        )}
                    </div>

                    {!isSuccess ? (
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
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
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
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
                                </div>

                                <Button type="submit" className="w-full h-14 bg-hope-pink hover:bg-pink-700 text-white font-bold text-base mt-2" isLoading={isSubmitting}>
                                    Activate Account
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-8">
                            <Button 
                                onClick={() => router.push("/marketing/login")}
                                className="w-full h-14 bg-hope-pink hover:bg-pink-700 text-white font-bold"
                            >
                                Proceed to Terminal Login
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <AuthLayout>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-hope-pink" />
                </div>
            }>
                <SetPasswordContent />
            </Suspense>
        </AuthLayout>
    );
}
