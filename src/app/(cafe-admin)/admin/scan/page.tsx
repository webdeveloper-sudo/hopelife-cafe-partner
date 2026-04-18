"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Smartphone, CheckCircle2, AlertCircle, IndianRupee, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";

export default function CashierScanPage() {
    const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "detected" | "verifying" | "success" | "error" | "settled">("idle");
    const [mobileVerify, setMobileVerify] = useState("");
    const [billAmount, setBillAmount] = useState("");

    // Data states
    const [scannedGuest, setScannedGuest] = useState<any>(null);
    const [rawQrData, setRawQrData] = useState<string>("");
    const [incomingReferrals, setIncomingReferrals] = useState<any[]>([]);

    // Fetch incoming arrivals automatically
    useEffect(() => {
        const fetchIncoming = async () => {
            try {
                const res = await fetch("/api/admin/incoming");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setIncomingReferrals(data.arrivals);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch incoming referrals");
            }
        };

        fetchIncoming(); // initial fetch
        const interval = setInterval(fetchIncoming, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Start the camera
    const handleStartScan = () => {
        setScanStatus("scanning");
    };

    // Handle React QR Scanner reading a code
    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue;

            // Only process if we haven't already moved to the next step
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
                            toast.error("PASS ALREADY REDEEMED: This is a one-time discount only.");
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

    // Cashier Verbal Verification
    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mobileVerify.length !== 10) return;

        if (mobileVerify === scannedGuest?.mobile) {
            setScanStatus("success");
            toast.success("Guest identity verified.");
        } else {
            setScanStatus("error");
            toast.error("Mobile number mismatch.");
        }
    };

    const handleCompleteTransaction = async () => {
        if (!billAmount || isNaN(Number(billAmount))) {
            toast.error("Please enter a valid bill amount.");
            return;
        }

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

                // Immediately refresh incoming feed to clear them if they were on it
                fetch("/api/admin/incoming").then(res => res.json()).then(d => setIncomingReferrals(d.arrivals || []));
            } else {
                toast.error(data.error || "Failed to settle transaction.");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        }
    };

    const handleReset = () => {
        setScanStatus("idle");
        setMobileVerify("");
        setBillAmount("");
        setScannedGuest(null);
        setRawQrData("");
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Partner Pass Verification</h1>
                <p className="text-gray-500 font-medium mt-2">Scan guest passes and apply referral discounts securely.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Column 1: Live Expected Arrivals Feed */}
                <div className="lg:col-span-1 bg-white p-6 rounded-md shadow-sm border border-gray-300 flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-hope-green" />
                            <h3 className="text-lg font-bold text-gray-900">Incoming Setup</h3>
                        </div>
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {incomingReferrals.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 text-center">
                                <User className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-500">No pending arrivals currently.</p>
                            </div>
                        ) : (
                            incomingReferrals.map((guest) => (
                                <div key={guest.id} className="p-4 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-900">{guest.name}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{guest.timeAgo}</span>
                                    </div>
                                    <p className="text-xs text-hope-green font-bold uppercase tracking-widest mb-2">{guest.partnerName}</p>
                                    <p className="text-xs text-gray-500 font-medium tracking-widest">+91 {guest.mobile.slice(0, 5)} {guest.mobile.slice(5)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Column 2: The Scanner */}
                <div className="lg:col-span-1 bg-white p-8 rounded-md shadow-xl shadow-gray-200/50 border border-gray-300 flex flex-col items-center justify-center min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {scanStatus === "idle" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center space-y-6 w-full"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-200">
                                    <ScanLine className="w-10 h-10 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Scan</h3>
                                    <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">Ask the guest to show their dynamic Live Pass on their phone.</p>
                                    <Button onClick={handleStartScan} className="w-full h-14" size="lg">
                                        Start Camera
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {scanStatus === "scanning" && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center w-full relative"
                            >
                                <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-md mx-auto overflow-hidden relative shadow-2xl flex items-center justify-center">

                                    <div className="absolute inset-0 z-0">
                                        <Scanner
                                            onScan={handleScan}
                                            components={{
                                                finder: false
                                            }}
                                            styles={{
                                                container: { width: "100%", height: "100%" },
                                                video: { objectFit: "cover", width: "100%", height: "100%" }
                                            }}
                                        />
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                        <div className="w-48 h-48 border-2 border-white/20 rounded-md relative">
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hope-green rounded-tl-md" />
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hope-green rounded-tr-md" />
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hope-green rounded-bl-md" />
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-hope-green rounded-br-md" />
                                        </div>
                                    </div>

                                    <motion.div
                                        animate={{ y: [-96, 96, -96] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute w-48 h-0.5 bg-hope-green shadow-[0_0_12px_rgba(255,122,26,1)] z-20 pointer-events-none"
                                    />

                                    <p className="absolute bottom-4 text-xs font-bold text-white tracking-widest uppercase z-20 drop-shadow-md bg-black/50 px-3 py-1 rounded-full">Looking for QR Code...</p>
                                </div>
                                <Button onClick={handleReset} variant="outline" className="mt-4">
                                    Cancel Scan
                                </Button>
                            </motion.div>
                        )}

                        {(scanStatus === "detected" || scanStatus === "verifying" || scanStatus === "success" || scanStatus === "error" || scanStatus === "settled") && (
                            <motion.div
                                key="detected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center w-full"
                            >
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring" }}
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </motion.div>
                                    <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-ping opacity-20" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Valid Pass Detected</h3>
                                <p className="text-gray-500 font-medium mb-1">
                                    Guest: <span className="font-bold text-gray-900">{scannedGuest?.name}</span>
                                </p>
                                <p className="text-gray-500 font-medium">
                                    Partner: <span className="text-hope-green font-bold uppercase tracking-widest text-xs">{scannedGuest?.partnerName}</span>
                                </p>

                                {(scanStatus === "success" || scanStatus === "settled") && (
                                    <Button onClick={handleReset} variant="outline" className="mt-8">
                                        Scan Next Guest
                                    </Button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Column 3: Verification Panel */}
                <div className="lg:col-span-1 bg-gray-50 p-8 rounded-md border border-gray-300 flex flex-col h-[600px]">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Security Verification</h3>
                        <p className="text-sm text-gray-500">Ask the guest for their full 10-digit mobile number to verify identity and finalize the discount.</p>
                    </div>

                    <div className="flex-1">
                        {scanStatus === "idle" || scanStatus === "scanning" || scanStatus === "verifying" ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <Smartphone className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="text-sm font-bold text-gray-400">
                                    {scanStatus === "verifying" ? "Validating QR Data..." : "Awaiting scan detection..."}
                                </p>
                            </div>
                        ) : scanStatus === "detected" || scanStatus === "error" ? (
                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleVerifySubmit}
                                className="space-y-6"
                            >
                                {scanStatus === "error" && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-md border border-gray-300 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-sm font-bold">Number mismatch. Ask the guest to verify the number they registered with.</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Spoken Mobile Number</label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={mobileVerify}
                                        onChange={(e) => setMobileVerify(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full px-4 py-4 bg-white border border-gray-300 rounded-md text-xl font-black tracking-widest text-gray-900 focus:ring-2 focus:ring-hope-purple focus:border-hope-purple transition-all placeholder:text-gray-300 placeholder:font-normal text-center shadow-sm"
                                        placeholder="• • • • • • • • • •"
                                        required
                                    />
                                    <p className="text-[10px] text-center text-gray-400 mt-2 font-bold uppercase tracking-widest">Matches: +91 *******{scannedGuest?.mobile?.slice(-3)}</p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={mobileVerify.length !== 10}
                                    className="w-full h-14 text-lg"
                                >
                                    Verify Guest Identity
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-green-50 border border-gray-300 rounded-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                        <h4 className="font-bold text-green-900">Identity Verified</h4>
                                    </div>
                                    <p className="text-sm text-green-700 font-medium leading-relaxed">Guest <span className="font-bold">{scannedGuest.name}</span> is eligible for a {scannedGuest.commissionSlab}% discount.</p>
                                </div>

                                {scanStatus === "success" && (
                                    <div className="p-6 bg-white border border-gray-300 rounded-md shadow-sm space-y-4">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Finalize Billing</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 mb-2">Total Bill Amount</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={billAmount}
                                                    onChange={(e) => setBillAmount(e.target.value)}
                                                    className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-md text-lg font-bold text-gray-900 focus:ring-2 focus:ring-hope-purple"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        {billAmount && (
                                            <div className="pt-4 border-t border-gray-100 space-y-2 text-sm font-bold">
                                                <div className="flex justify-between text-gray-500">
                                                    <span>Discount ({scannedGuest.commissionSlab}%)</span>
                                                    <span className="text-green-600">-₹{(Number(billAmount) * (scannedGuest.commissionSlab / 100)).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-900 text-lg">
                                                    <span>Final Payable</span>
                                                    <span>₹{(Number(billAmount) * (1 - scannedGuest.commissionSlab / 100)).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-400 text-xs mt-2">
                                                    <span>Partner Commission ({scannedGuest.commissionSlab}%)</span>
                                                    <span className="text-hope-purple">₹{(Number(billAmount) * (1 - scannedGuest.commissionSlab / 100) * (scannedGuest.commissionSlab / 100)).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <Button onClick={handleCompleteTransaction} className="w-full h-12 mt-4" disabled={!billAmount}>
                                            Complete Transaction
                                        </Button>
                                    </div>
                                )}

                                {scanStatus === "settled" && (
                                    <div className="p-6 border border-gray-300 bg-green-500/5 rounded-md text-center space-y-2">
                                        <h4 className="text-green-700 font-bold text-lg">Transaction Settled</h4>
                                        <p className="text-gray-600 text-sm font-medium">Discount applied and referral attributed to partner.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
