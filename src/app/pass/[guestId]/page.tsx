"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, Timer, AlertCircle, Sparkles, Smartphone, Clock } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/AuthLayout";

export default function PassDisplayPage({ params }: { params: Promise<{ guestId: string }> }) {
    const unwrappedParams = React.use(params);
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(60);
    const [guestData, setGuestData] = useState<{ 
        name: string, 
        mobile: string, 
        partnerName: string, 
        partnerCode: string, 
        discount: number,
        frequency: number,
        isRedeemed: boolean,
        isExpired: boolean
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [qrData, setQrData] = useState<string>("");
    
    // For QR Download
    const qrRef = useRef<HTMLDivElement>(null);

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
        if (!guestData || guestData.isRedeemed || guestData.isExpired) return;

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

    // Real-time Redemption Polling
    useEffect(() => {
        if (!guestData || guestData.isRedeemed || guestData.isExpired) return;

        const pollRedemption = setInterval(async () => {
            try {
                const res = await fetch(`/api/guest/${unwrappedParams.guestId}/status`);
                const data = await res.json();
                if (data.success && data.isRedeemed) {
                    toast.success("Pass Redeemed Successfully!");
                    if (data.billAmount) {
                        router.push(`/thank-you?billAmount=${data.billAmount}&discount=${data.discount || 0}`);
                    } else {
                        router.push("/thank-you");
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 2000);

        return () => clearInterval(pollRedemption);
    }, [guestData, unwrappedParams.guestId]);

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 rounded-full border-4 border-hope-green border-t-transparent animate-spin" /></div>;
    }

    if (error || !guestData || guestData.isExpired) {
        return (
            <AuthLayout>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-md border border-white/20 flex items-center justify-center mb-8 shadow-2xl shadow-black/40">
                        <AlertCircle className="w-12 h-12 text-white/50" />
                    </div>
                    <h1 className="text-3xl font-black mb-4 tracking-tight text-white">Pass Expired or Invalid</h1>
                    <p className="text-white/60 max-w-sm mb-10 leading-relaxed font-medium">
                        Referral passes are valid for 24 hours only. Please contact your partner/referrer to request a fresh invitation link.
                    </p>
                    <Button 
                        variant="outline" 
                        className="bg-white/10 hover:bg-white/20 border-white/20 text-white px-8 h-14 rounded-md font-black uppercase tracking-widest text-xs" 
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="w-full max-w-4xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="pass"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                    >
                        {/* Status Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6 shadow-xl shadow-black/20">
                                {guestData.isRedeemed ? (
                                    <><AlertCircle className="w-4 h-4 text-white/50" /> Pass Redeemed</>
                                ) : (
                                    <><Sparkles className="w-4 h-4 text-amber-400" /> High Priority Pass</>
                                )}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">Your Digital Pass</h2>
                            <p className="text-white/60 text-sm font-medium mt-2 max-w-md mx-auto">
                                {guestData.isRedeemed 
                                    ? "This pass has been settled and is now inactive." 
                                    : "Validate this code at the outlet counter during checkout."}
                            </p>
                        </div>

                        {/* Main Interaction Card (Ticket Style) */}
                        <div className={cn(
                            "w-full bg-white rounded-md shadow-2xl shadow-black/40 border border-gray-300 overflow-hidden flex flex-col md:flex-row min-h-[400px]",
                            guestData.isRedeemed && "opacity-50 grayscale"
                        )}>
                            {/* Left Section: QR Code */}
                            <div className="w-full md:w-[40%] bg-gray-50 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                                <div className="relative p-2 bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden mb-6 group">
                                    {!guestData.isRedeemed && (
                                        <motion.div
                                            animate={{ y: [0, 200, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-0 left-[-20%] right-[-20%] h-[2px] bg-gradient-to-r from-transparent via-hope-green to-transparent z-10 blur-[1px]"
                                        />
                                    )}
                                    <QRCode
                                        value={guestData.isRedeemed ? "REDEEMED-PASS" : qrData}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        level="H"
                                        className="relative z-0"
                                    />
                                </div>
                                
                                {!guestData.isRedeemed && (
                                    <div className="w-full max-w-[200px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5 text-hope-green">
                                                <Timer className="w-3 h-3 animate-pulse" />
                                                <span className="text-[10px] font-black tracking-widest uppercase">Securing Refresh</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400">{timeLeft}s</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-hope-green"
                                                initial={{ width: "100%" }}
                                                animate={{ width: `${(timeLeft / 60) * 100}%` }}
                                                transition={{ duration: 1, ease: "linear" }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Section: Details */}
                            <div className="flex-1 p-10 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Validated Guest</p>
                                            <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">{guestData.name}</h3>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md w-fit">
                                                <Smartphone className="w-4 h-4 text-hope-green" />
                                                <span className="text-sm font-bold text-gray-700 tracking-wider">+91 {guestData.mobile}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visit Rank</p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md">
                                                <Sparkles className="w-4 h-4" />
                                                <span className="text-xs font-black uppercase">Level {guestData.frequency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Claimable Discount</p>
                                            <p className="text-2xl font-black text-hope-green">{guestData.discount}% Off</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Referrer Details</p>
                                            <p className="text-sm font-bold text-gray-900">{guestData.partnerName}</p>
                                            <p className="text-[10px] font-medium text-gray-400 mt-0.5">{guestData.partnerCode}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Expires in 24 hours from generation</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-md">
                                        <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                            ⚠️ IMPORTANT: This pass is unique to your mobile number and non-transferable. Screenshot misuse may lead to blacklisting.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Logo */}
                        <div className="mt-12 opacity-50 flex flex-col items-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-xl border border-gray-300 overflow-hidden p-1.5">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-fit" />
                            </div>
                            <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Hope Life Cafe</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
