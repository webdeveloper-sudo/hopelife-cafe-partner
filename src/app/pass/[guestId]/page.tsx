"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, Timer, AlertCircle, Sparkles, Smartphone, Clock } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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
                    router.push("/thank-you");
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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-gray-900 text-center">
                <div className="w-24 h-24 bg-red-100 rounded-md border border-gray-300 flex items-center justify-center mb-8">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-3xl font-black mb-4 tracking-tight">Pass Expired or Invalid</h1>
                <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">
                    Referral passes are valid for 24 hours only. Please contact your partner/referrer to request a fresh invitation link.
                </p>
                <Button variant="outline" className="border-gray-300 px-8 h-12 rounded-md font-bold" onClick={() => window.location.reload()}>
                    Refresh Page
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#fafafa]">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
                }}
            />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-hope-green/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="pass"
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="py-10 relative flex flex-col items-center"
                    >
                        {/* Header Section */}
                        <div className="text-center mb-10 w-full">
                            <div className="flex justify-center mb-6">
                                {guestData.isRedeemed ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 border border-gray-300 text-gray-500 rounded-md text-[10px] font-black tracking-[0.2em] uppercase">
                                        <AlertCircle className="w-3.5 h-3.5" /> Pass Already Redeemed
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-gray-300 text-green-700 rounded-md text-[10px] font-black tracking-[0.2em] uppercase">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> High Priority Pass
                                    </div>
                                )}
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight leading-tight">Your Live Pass</h2>
                            <p className="text-gray-500 text-sm font-medium px-4">
                                {guestData.isRedeemed 
                                    ? "This pass has been settled at the counter and is now deactivated." 
                                    : "Present this secure code to the cashier during checkout to claim your benefits."}
                            </p>
                        </div>

                        {/* QR Code Card */}
                        <div className={cn(
                            "group p-8 rounded-md shadow-2xl relative z-10 mx-auto w-full max-w-[320px] mb-10 transition-all duration-700 bg-white border border-gray-300",
                            guestData.isRedeemed && "grayscale opacity-40 shadow-none border-dashed"
                        )}>
                            <div className="relative aspect-square flex items-center justify-center" ref={qrRef}>
                                {!guestData.isRedeemed && (
                                    <motion.div
                                        animate={{ y: [0, 256, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 left-[-10%] right-[-10%] h-[2px] bg-gradient-to-r from-transparent via-hope-green to-transparent z-20 pointer-events-none blur-[1px]"
                                    />
                                )}
                                <div className="p-2 bg-white rounded-md border border-gray-300">
                                    <QRCode
                                        value={guestData.isRedeemed ? "REDEEMED-PASS" : qrData}
                                        size={256}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox={`0 0 256 256`}
                                        level="H"
                                    />
                                </div>
                            </div>

                            {!guestData.isRedeemed && (
                                <div className="mt-8 flex flex-col items-center">
                                    <div className="flex items-center justify-center gap-2 text-hope-green mb-3">
                                        <Timer className="w-4 h-4 animate-pulse" />
                                        <span className="font-black text-[11px] tracking-widest uppercase">Securing Refresh: {timeLeft}s</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-100 rounded-md overflow-hidden">
                                        <motion.div
                                            className="h-full bg-hope-green rounded-md"
                                            initial={{ width: "100%" }}
                                            animate={{ width: `${(timeLeft / 60) * 100}%` }}
                                            transition={{ duration: 1, ease: "linear" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guest ID Card Bottom */}
                        <div className="w-full px-4 space-y-6">
                            <div className="bg-white rounded-md p-8 shadow-xl shadow-gray-200/40 border border-gray-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                                
                                <div className="relative z-10 space-y-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-2">Authenticated Guest</p>
                                        <h3 className="text-3xl font-black text-gray-900 leading-tight">{guestData.name}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-gray-500">
                                            <Smartphone className="w-4 h-4 text-hope-green" />
                                            <span className="font-bold text-sm tracking-[0.1em]">+91 {guestData.mobile.slice(0, 5)} {guestData.mobile.slice(5)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100/80">
                                        <div>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Referrer</p>
                                            <p className="text-xs font-black text-hope-green truncate">{guestData.partnerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-black mb-1">Visit Rank</p>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <p className="text-xs font-black text-gray-900">Level {guestData.frequency}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                Valid for 24 hours only. <br />
                                Please do not share this pass with others.
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
