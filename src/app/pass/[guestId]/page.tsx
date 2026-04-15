"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Timer, AlertCircle, Sparkles } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PassDisplayPage({ params }: { params: Promise<{ guestId: string }> }) {
    const unwrappedParams = React.use(params);
    const [timeLeft, setTimeLeft] = useState(60);
    const [sessionNonce, setSessionNonce] = useState(Date.now());
    const [guestData, setGuestData] = useState<{ 
        name: string, 
        mobile: string, 
        partnerName: string, 
        partnerCode: string, 
        commissionSlab: number,
        isRedeemed: boolean 
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [qrData, setQrData] = useState<string>("");

    // Fetch the secure QR payload from the server
    const fetchSecureQr = async () => {
        try {
            const res = await fetch(`/api/guest/${unwrappedParams.guestId}/qr`);
            if (!res.ok) throw new Error("Pass not found or expired");
            const data = await res.json();

            if (data.success && data.secureQrData) {
                setQrData(data.secureQrData);
                setGuestData({
                    ...data.guestMeta,
                    isRedeemed: data.isRedeemed
                });
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
            toast.error("Invalid or expired Live Pass");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchSecureQr();
    }, [unwrappedParams.guestId]);

    // Handle dynamic QR countdown timer and refresh
    useEffect(() => {
        if (!guestData) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    fetchSecureQr(); // Fetch a new secure payload from the server
                    return 60; // Reset the 60s timer
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [guestData, unwrappedParams.guestId]);

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-hope-green border-t-transparent animate-spin" /></div>;
    }

    if (error || !guestData) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-black mb-2">Pass Not Found</h1>
                <p className="text-gray-400">This pass link is invalid or has expired.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #fdf8ff 0%, #f5f3ff 50%, #ede9fe 100%)",
            }}
        >
            {/* Subtle dot pattern overlay */}
            <div className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: "radial-gradient(circle, #7030a0 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
            {/* Glow accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-hope-green/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="pass"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-8 relative flex flex-col items-center"
                    >
                        <div className="text-center mb-8 relative z-10 w-full px-8">
                            {guestData.isRedeemed ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                                    <AlertCircle className="w-3.5 h-3.5" /> Pass Redeemed
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-200 text-green-700 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass Active
                                </div>
                            )}
                            <h2 className="text-4xl font-black text-gray-900 mb-2">Live Discount Pass</h2>
                            <p className="text-purple-700 text-sm font-semibold tracking-wide">
                                {guestData.isRedeemed ? "This pass has been used and is no longer valid." : "Present this secure QR to the cashier."}
                            </p>
                        </div>

                        {/* QR Code Section */}
                        <div className={cn(
                            "p-6 rounded-[1.5rem] shadow-2xl relative z-10 mx-auto w-fit mb-8 border transition-all duration-500",
                            guestData.isRedeemed 
                                ? "bg-gray-50 border-gray-200 grayscale opacity-50" 
                                : "bg-white border-purple-100 shadow-purple-200/60"
                        )}>
                            <div className="relative">
                                {!guestData.isRedeemed && (
                                    <motion.div
                                        animate={{ y: [0, 192, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 left-0 right-0 h-1 bg-hope-green shadow-[0_0_8px_rgba(112,48,160,0.8)] z-20 pointer-events-none"
                                    />
                                )}
                                <div className="w-48 h-48 bg-white flex items-center justify-center rounded-xl overflow-hidden">
                                    <QRCode
                                        value={guestData.isRedeemed ? "EXPIRED" : qrData}
                                        size={256}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        level="Q"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full px-8 text-center relative z-10">
                            <div className="flex items-center justify-center gap-2 text-hope-green mb-3">
                                <Timer className="w-4 h-4 animate-pulse" />
                                <span className="font-bold text-sm tracking-wide">Refreshes in {timeLeft}s</span>
                            </div>
                            <div className="w-full h-1.5 bg-purple-200 rounded-full overflow-hidden mb-8">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-hope-green to-hope-pink rounded-full"
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </div>

                            <div className="bg-white border border-purple-100 rounded-2xl p-6 text-left shadow-lg shadow-purple-100/50">
                                <div className="mb-5">
                                    <p className="text-[10px] text-purple-700 uppercase tracking-widest font-black mb-1">Guest Name</p>
                                    <p className="text-3xl font-black text-gray-900">{guestData.name}</p>
                                </div>
                                <div className="mb-5">
                                    <p className="text-[10px] text-purple-700 uppercase tracking-widest font-black mb-1">Registered Mobile</p>
                                    <p className="text-2xl font-bold text-gray-800 tracking-widest">+91 {guestData.mobile.slice(0, 5)} {guestData.mobile.slice(5)}</p>
                                </div>
                                <div className="pt-4 border-t border-purple-100">
                                    <p className="text-[10px] text-purple-700 uppercase tracking-widest font-black mb-1">Pass Authorized By</p>
                                    <p className="text-base text-hope-green font-black uppercase tracking-wide">{guestData.partnerName}</p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <p className="text-[10px] text-hope-green uppercase tracking-widest flex items-center justify-center gap-1 font-black">
                                    <Sparkles className="w-3 h-3 text-hope-pink" /> 10% Discount Applied
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
