"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, QrCode, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ScanPage() {
    const router = useRouter();
    const [mobile, setMobile] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ name: string; passUrl: string } | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`/api/guest/lookup?mobile=${encodeURIComponent(mobile)}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "No pass found.");
                return;
            }

            setResult({ name: data.name, passUrl: data.passUrl });
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoToPass = () => {
        if (result?.passUrl) router.push(result.passUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30 flex flex-col items-center justify-center px-4 py-16">
            {/* Back link */}
            <div className="w-full max-w-md mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-hope-green transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-hope-green to-hope-pink p-8 text-center relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Find Your Live Pass</h1>
                    <p className="text-purple-100 text-sm font-medium mt-1">
                        Enter the mobile number you registered with
                    </p>
                </div>

                {/* Body */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleLookup}
                                className="space-y-6"
                            >
                                {/* Mobile input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Mobile Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="\d{10}"
                                            maxLength={10}
                                            required
                                            placeholder="10-digit number"
                                            value={mobile}
                                            onChange={e => {
                                                setError(null);
                                                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                                            }}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-hope-green focus:outline-none font-bold text-gray-900 text-lg transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl"
                                        >
                                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <p className="text-sm font-semibold text-red-700">{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading || mobile.length < 10}
                                    className="w-full h-14 bg-gradient-to-r from-hope-green to-hope-pink hover:from-hope-pink hover:to-hope-green text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-hope-green/30 hover:shadow-xl hover:shadow-hope-green/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Looking up…</>
                                    ) : (
                                        <>Find My Pass <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-400 font-medium">
                                    Not registered yet?{" "}
                                    <span className="text-gray-500 font-semibold">Contact support for assistance.</span>
                                </p>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center"
                            >
                                <div className="flex flex-col items-center gap-3 p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <CheckCircle2 className="w-14 h-14 text-green-500" />
                                    <div>
                                        <h3 className="text-xl font-black text-green-900">Pass Found!</h3>
                                        <p className="text-green-700 font-medium mt-1">
                                            Welcome back, <span className="font-black">{result.name}</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoToPass}
                                    className="w-full h-14 bg-gradient-to-r from-hope-green to-hope-pink hover:from-hope-pink hover:to-hope-green text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-hope-green/30 transition-all hover:-translate-y-0.5"
                                >
                                    <QrCode className="w-5 h-5" /> Open My Live Pass
                                </button>

                                <button
                                    onClick={() => { setResult(null); setMobile(""); }}
                                    className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
                                >
                                    Look up a different number
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Info strip */}
            <p className="mt-8 text-xs text-gray-400 font-medium text-center max-w-xs">
                Your Live Pass contains a secure QR code accepted at HOPE Cafe for your guest discount.
            </p>
        </div>
    );
}
