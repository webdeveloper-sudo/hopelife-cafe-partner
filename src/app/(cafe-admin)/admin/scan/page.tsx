"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, CheckCircle2, AlertCircle, IndianRupee, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

export default function CashierScanPage() {
    const router = useRouter();
    const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "detected" | "verifying" | "success" | "error" | "settled">("idle");
    const [mobileVerify, setMobileVerify] = useState("");
    const [billAmount, setBillAmount] = useState("");
    const [isSettling, setIsSettling] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    
    // Data states
    const [scannedGuest, setScannedGuest] = useState<any>(null);
    const [rawQrData, setRawQrData] = useState<string>("");
    
    // Error tracking
    const [errorMsg, setErrorMsg] = useState("");
    const [errorType, setErrorType] = useState<"redeemed" | "mismatch" | "invalid" | null>(null);

    // Simulate calculation delay for aesthetics
    useEffect(() => {
        if (billAmount && !isNaN(Number(billAmount)) && Number(billAmount) > 0) {
            setIsCalculating(true);
            const timer = setTimeout(() => setIsCalculating(false), 600);
            return () => clearTimeout(timer);
        } else {
            setIsCalculating(false);
        }
    }, [billAmount]);

    const handleStartScan = () => {
        setScanStatus("scanning");
        setErrorMsg("");
        setErrorType(null);
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue;

            if (scanStatus === "scanning") {
                setScanStatus("verifying");
                setRawQrData(code);

                try {
                    const response = await fetch("/api/admin/verify-qr", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ qrData: code, action: "verify" })
                    });

                    const data = await response.json();

                    if (data.success) {
                        setScannedGuest(data.guest);
                        if (data.guest.isRedeemed) {
                            setScanStatus("error");
                            setErrorType("redeemed");
                            setErrorMsg("PASS ALREADY REDEEMED: This is a one-time discount only.");
                            toast.error("PASS ALREADY REDEEMED");
                        } else {
                            setScanStatus("detected");
                            toast.success("Valid Pass Scanned!");
                        }
                    } else {
                        toast.error(data.error || "Invalid QR Code");
                        setScanStatus("scanning"); // go back to scanning
                    }
                } catch (err) {
                    toast.error("Network error during verification.");
                    setScanStatus("scanning");
                }
            }
        }
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobileVerify.length !== 10) return;

        if (mobileVerify === scannedGuest?.mobile) {
            setScanStatus("success");
            setErrorMsg("");
            setErrorType(null);
            toast.success("Guest identity verified.");
        } else {
            setScanStatus("error");
            setErrorType("mismatch");
            setErrorMsg("Number mismatch. Ask the guest to verify the number they registered with.");
            toast.error("Mobile number mismatch.");
        }
    };

    const handleCompleteTransaction = async () => {
        setIsSettling(true);
        try {
            const response = await fetch("/api/admin/verify-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    qrData: rawQrData,
                    action: "settle",
                    billAmount: Number(billAmount)
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Discount of ₹${data.discountApplied.toFixed(2)} applied successfully!`);
                setScanStatus("settled");

                // Redirect to thank you page with full receipt details
                const params = new URLSearchParams({
                    billAmount: billAmount,
                    discount: data.discountApplied.toString(),
                    guestName: scannedGuest.name,
                    guestMobile: scannedGuest.mobile,
                    partnerName: scannedGuest.partnerName,
                    discountPercent: scannedGuest.guestDiscountSlab.toString(),
                    date: new Date().toISOString()
                });
                router.push(`/thank-you?${params.toString()}`);
            } else {
                toast.error(data.error || "Failed to settle transaction.");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSettling(false);
        }
    };

    const handleReset = () => {
        setScanStatus("idle");
        setMobileVerify("");
        setBillAmount("");
        setScannedGuest(null);
        setRawQrData("");
        setErrorMsg("");
        setErrorType(null);
    };

    return (
        <div className="px-4 py-8 md:py-12 max-w-md mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center">
            <div className="text-center mb-8 w-full">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Scan Guest Pass</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Scan pass and apply discount securely.</p>
            </div>

            <div className="w-full relative">
                <AnimatePresence mode="wait">
                    {/* STEP 1: SCANNER */}
                    {(scanStatus === "idle" || scanStatus === "scanning" || scanStatus === "verifying") && (
                        <motion.div
                            key="step-scanner"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full"
                        >
                            {scanStatus === "idle" && (
                                <div className="text-center space-y-6">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-200">
                                        <ScanLine className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Scan</h3>
                                        <p className="text-sm text-gray-500 mb-8 max-w-[200px] mx-auto">Ask the guest to show their dynamic Live Pass.</p>
                                        <Button onClick={handleStartScan} className="w-full py-6 text-lg rounded-xl shadow-lg shadow-hope-green/20">
                                            Start Camera
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {(scanStatus === "scanning" || scanStatus === "verifying") && (
                                <div className="w-full relative text-center">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Scanning Pass</h3>
                                    <div className="w-full aspect-square bg-gray-900 rounded-xl overflow-hidden relative shadow-inner">
                                        {scanStatus === "scanning" && (
                                            <div className="absolute inset-0 z-0">
                                                <Scanner
                                                    onScan={handleScan}
                                                    components={{ finder: false }}
                                                    styles={{
                                                        container: { width: "100%", height: "100%" },
                                                        video: { objectFit: "cover", width: "100%", height: "100%" }
                                                    }}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                            <div className="w-48 h-48 border-2 border-white/30 rounded-xl relative">
                                                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-hope-green rounded-tl-xl" />
                                                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-hope-green rounded-tr-xl" />
                                                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-hope-green rounded-bl-xl" />
                                                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-hope-green rounded-br-xl" />
                                            </div>
                                        </div>
                                        
                                        <motion.div
                                            animate={{ y: [-96, 96, -96] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-x-12 top-1/2 h-0.5 bg-hope-green shadow-[0_0_15px_rgba(255,122,26,1)] z-20 pointer-events-none"
                                        />
                                        
                                        {scanStatus === "verifying" && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                                                <span className="w-8 h-8 rounded-full border-4 border-hope-green border-t-transparent animate-spin mb-3"></span>
                                                <p className="text-sm font-bold text-white tracking-widest uppercase">Verifying Data...</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button onClick={handleReset} variant="outline" className="mt-6 w-full rounded-xl py-5">
                                        Cancel Scan
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 1.5: ALREADY REDEEMED */}
                    {scanStatus === "error" && errorType === "redeemed" && (
                        <motion.div
                            key="step-redeemed"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 w-full text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Pass Invalid</h3>
                            <p className="text-sm text-red-600 font-bold mb-8 px-4 leading-relaxed">{errorMsg}</p>
                            <Button onClick={handleReset} variant="outline" className="w-full py-6 rounded-xl text-lg font-bold border-red-200 text-red-600 hover:bg-red-50">
                                Try Another Pass
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 2: VERIFICATION */}
                    {(scanStatus === "detected" || (scanStatus === "error" && errorType === "mismatch")) && (
                        <motion.div
                            key="step-verify"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full"
                        >
                            {/* Guest summary header */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center shrink-0 border border-green-100">
                                    <CheckCircle2 className="w-7 h-7 text-green-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{scannedGuest?.name}</h3>
                                    <p className="text-xs text-hope-green font-bold uppercase tracking-wider truncate mt-0.5">{scannedGuest?.partnerName}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-1">Security Verification</h4>
                                <p className="text-xs text-gray-500">Ask the guest for their full mobile number to confirm identity.</p>
                            </div>

                            <form onSubmit={handleVerifySubmit} className="space-y-5">
                                {scanStatus === "error" && errorType === "mismatch" && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold leading-tight">{errorMsg}</p>
                                    </div>
                                )}

                                <div>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={mobileVerify}
                                        onChange={(e) => setMobileVerify(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold tracking-[0.2em] text-gray-900 focus:ring-2 focus:ring-hope-purple focus:border-hope-purple transition-all placeholder:text-gray-300 placeholder:font-normal text-center shadow-inner"
                                        placeholder="••••••••••"
                                        required
                                    />
                                    <p className="text-[10px] text-center text-gray-400 mt-2 font-semibold uppercase tracking-widest">
                                        Matches: +91 *******{scannedGuest?.mobile?.slice(-3)}
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={mobileVerify.length !== 10} className="w-full py-6 rounded-xl text-md font-bold shadow-lg">
                                        Verify Number
                                    </Button>
                                    <Button type="button" onClick={handleReset} variant="ghost" className="w-full mt-2 text-gray-500 hover:text-gray-900 font-medium">
                                        Cancel Protocol
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3: BILLING */}
                    {(scanStatus === "success" || scanStatus === "settled") && (
                        <motion.div
                            key="step-billing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 border-t-4 border-t-green-500 w-full"
                        >
                            {scanStatus === "settled" ? (
                                <div className="text-center py-6">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Transaction Settled</h3>
                                    <p className="text-sm text-gray-500 mb-8">Discount applied successfully.</p>
                                    <Button onClick={handleReset} className="w-full py-6 rounded-xl text-lg font-bold shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white">
                                        Scan Next Guest
                                    </Button>
                                    <p className="text-xs text-gray-400 font-medium mt-4">Partner commissions computed auto-magically.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Verified Guest Info */}
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                        <div className="overflow-hidden pr-2">
                                            <h3 className="text-lg font-bold text-gray-900 truncate">{scannedGuest?.name}</h3>
                                            <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="inline-block px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold tracking-wider border border-green-200">
                                                {scannedGuest?.commissionSlab}% OFF
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Enter Total Bill Amount</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={billAmount}
                                                    onChange={(e) => setBillAmount(e.target.value)}
                                                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold text-gray-900 focus:ring-2 focus:ring-green-500 transition-all shadow-inner"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {billAmount && !isNaN(Number(billAmount)) && Number(billAmount) > 0 && (
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3 text-sm font-bold shadow-sm relative min-h-[140px] flex flex-col justify-center">
                                                {isCalculating ? (
                                                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                                                        <Loader2 className="w-6 h-6 text-hope-green animate-spin" />
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Computing breakdown...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between text-gray-500">
                                                            <span>Subtotal</span>
                                                            <span>₹{Number(billAmount).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-600 border-b border-gray-200 pb-3">
                                                            <span>Discount ({scannedGuest.commissionSlab}%)</span>
                                                            <span>-₹{(Number(billAmount) * (scannedGuest.commissionSlab / 100)).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-900 text-xl font-black pt-1">
                                                            <span>Payable</span>
                                                            <span>₹{(Number(billAmount) * (1 - scannedGuest.commissionSlab / 100)).toFixed(2)}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <Button 
                                                onClick={handleCompleteTransaction} 
                                                className="w-full py-6 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 gap-3" 
                                                disabled={!billAmount || isNaN(Number(billAmount)) || Number(billAmount) <= 0 || isSettling}
                                            >
                                                {isSettling ? (
                                                    <>
                                                        <Loader2 className="w-6 h-6 animate-spin" />
                                                        Processing Settlement...
                                                    </>
                                                ) : (
                                                    "Apply Discount & Settle"
                                                )}
                                            </Button>
                                            <Button type="button" onClick={handleReset} variant="ghost" className="w-full mt-2 text-gray-500 hover:text-gray-900 font-medium" disabled={isSettling}>
                                                Cancel Protocol
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

