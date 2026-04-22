"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Invalid invitation link. Please request a new invitation from your administrator.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/marketing/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setIsSuccess(true);
            } else {
                setError(data.error || "Failed to set password. Link might be expired.");
            }
        } catch (err) {
            setError("A network error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white rounded-md border border-gray-300 shadow-xl p-10 text-center"
                >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Access Granted</h2>
                    <p className="text-gray-500 mt-2 mb-8 font-medium">Your password has been successfully set. You can now login to your Marketing Executive dashboard.</p>
                    <Button 
                        onClick={() => router.push("/marketing/login")}
                        className="w-full h-14 bg-hope-purple hover:bg-purple-700 text-white font-bold"
                    >
                        Proceed to Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="max-w-md w-full bg-white rounded-md border border-gray-300 shadow-xl overflow-hidden"
            >
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="w-14 h-14 bg-hope-purple/10 rounded-md border border-hope-purple/20 flex items-center justify-center text-hope-purple mb-6">
                        <Lock className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Set Your Password</h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Hope Cafe Marketing Portal</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm font-medium mb-6">
                            {error}
                        </div>
                    )}

                    {!token ? null : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple transition-all"
                                            placeholder="At least 8 characters"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple transition-all"
                                        placeholder="Repeat new password"
                                        required
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit"
                                isLoading={isLoading}
                                className="w-full h-14 bg-hope-purple hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs"
                            >
                                Secure Registration
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
