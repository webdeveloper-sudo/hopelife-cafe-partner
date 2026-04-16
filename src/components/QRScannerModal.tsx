"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    ScanLine, 
    CheckCircle2, 
    AlertCircle, 
    IndianRupee, 
    Smartphone, 
    User, 
    Sparkles, 
    Loader2,
    Calendar,
    ArrowRight
} from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
    const [scanState, setScanState] = useState<"idle" | "scanning" | "verifying" | "details" | "expired" | "success">("idle");
    const [scannedData, setScannedData] = useState<any>(null);
    const [billAmount, setBillAmount] = useState("");
    const [isSettling, setIsSettling] = useState(false);
    const [rawQrCode, setRawQrCode] = useState("");

    const handleReset = () => {
        setScanState("idle");
        setScannedData(null);
        setBillAmount("");
        setIsSettling(false);
        setRawQrCode("");
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes.length > 0 && scanState === "scanning") {
            const code = detectedCodes[0].rawValue;
            setRawQrCode(code);
            setScanState("verifying");

            try {
                const res = await fetch("/api/admin/verify-qr", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ qrData: code, action: "verify" })
                });

                const data = await res.json();

                if (res.status === 410 || data.isExpired) {
                    setScanState("expired");
                } else if (data.success) {
                    setScannedData(data.guest);
                    setScanState("details");
                    toast.success("Guest Pass Validated!");
                } else {
                    toast.error(data.error || "Invalid QR Code");
                    setScanState("scanning");
                }
            } catch (err) {
                toast.error("Auth server connection failed.");
                setScanState("scanning");
            }
        }
    };

    const handleSettle = async () => {
        if (!billAmount || isNaN(Number(billAmount))) {
            toast.error("Enter a valid bill amount.");
            return;
        }

        setIsSettling(true);
        try {
            const res = await fetch("/api/admin/verify-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    qrData: rawQrCode,
                    action: "settle",
                    billAmount: Number(billAmount)
                })
            });

            const data = await res.json();
            if (data.success) {
                setScanState("success");
                toast.success("Transaction recorded successfully!");
            } else {
                toast.error(data.error || "Settlement failed.");
            }
        } catch (err) {
            toast.error("Network error during checkout.");
        } finally {
            setIsSettling(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { if (scanState !== "verifying" && !isSettling) onClose(); }}
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <ScanLine className="w-6 h-6 text-hope-green" /> 
                            {scanState === "details" ? "Guest Verification" : "Scan Partner Pass"}
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Management Console • Secure Verification</p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onClose} 
                        disabled={scanState === "verifying" || isSettling}
                        className="rounded-2xl bg-gray-50 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {/* IDLE / START SCAN */}
                        {(scanState === "idle" || scanState === "scanning") && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                {scanState === "idle" ? (
                                    <div className="text-center py-10 space-y-6">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl">
                                            <ScanLine className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Ready to Validate</h3>
                                            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Click below to open the camera. Ensure the guest pass is visible on their screen.</p>
                                        </div>
                                        <Button onClick={() => setScanState("scanning")} className="w-full h-16 text-lg rounded-[1.25rem]">
                                            Open Scanner
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="w-full aspect-square bg-black rounded-[2rem] overflow-hidden relative shadow-inner">
                                            <Scanner
                                                onScan={handleScan}
                                                components={{ finder: false }}
                                                styles={{
                                                    container: { width: "100%", height: "100%" },
                                                    video: { objectFit: "cover", width: "100%", height: "100%" }
                                                }}
                                            />
                                            {/* Scanning Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-64 h-64 border-2 border-white/20 rounded-2xl relative">
                                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-hope-green rounded-tl-xl" />
                                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-hope-green rounded-tr-xl" />
                                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-hope-green rounded-bl-xl" />
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-hope-green rounded-br-xl" />
                                                </div>
                                            </div>
                                            <motion.div
                                                animate={{ y: [-150, 150, -150] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-hope-green to-transparent z-10 blur-[1px]"
                                            />
                                        </div>
                                        <Button variant="outline" onClick={() => setScanState("idle")} className="w-full h-14 rounded-2xl border-gray-100">
                                            Cancel Calibration
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* VERIFYING LOADER */}
                        {scanState === "verifying" && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="relative">
                                    <Loader2 className="w-16 h-16 text-hope-green animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-hope-green rounded-full animate-ping" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 tracking-tight">Authenticating Digital Signature...</h3>
                                <p className="text-sm text-gray-500 mt-2 font-medium">Connecting to HOPE Cafe Secure Gateway</p>
                            </motion.div>
                        )}

                        {/* EXPIRED ALERT */}
                        {scanState === "expired" && (
                            <motion.div
                                key="expired"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-10"
                            >
                                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <AlertCircle className="w-12 h-12 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Pass Code Expired</h3>
                                <p className="text-gray-500 font-medium px-4 mb-10 leading-relaxed">
                                    This referral code has exceeded its 24-hour validity window. <br/>
                                    <span className="text-red-600 font-bold mt-2 block">Kindly ask the guest to request a new referral from their partner.</span>
                                </p>
                                <Button onClick={handleReset} className="w-full h-14 bg-gray-900 text-white rounded-2xl border-none font-black uppercase tracking-widest">
                                    Scan Another Pass
                                </Button>
                            </motion.div>
                        )}

                        {/* GUEST DETAILS & CALC */}
                        {scanState === "details" && scannedData && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="p-8 bg-green-50/50 border border-green-100/50 rounded-[2rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                                    </div>
                                    <div className="relative z-10 flex flex-col gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-hope-green text-2xl border border-green-100">
                                                {scannedData.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-xl text-gray-900 leading-tight">{scannedData.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs font-bold text-gray-500 tracking-widest">+91 {scannedData.mobile.slice(0, 5)} {scannedData.mobile.slice(5)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6 pt-6 border-t border-green-100/30">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Referred By</p>
                                                <p className="text-sm font-black text-gray-900 truncate">{scannedData.partnerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 text-right">Referral Count</p>
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                                    <p className="text-sm font-black text-gray-900">Visit #{scannedData.referralCount}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Partner Code</p>
                                                <p className="text-xs font-bold text-hope-green uppercase tracking-widest">{scannedData.partnerCode}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Eligible Discount</p>
                                                <p className="text-lg font-black text-green-600">{scannedData.guestDiscountSlab}% OFF</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Final Settlement Amount</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <IndianRupee className="h-6 w-6 text-gray-300" />
                                            </div>
                                            <input
                                                type="number"
                                                value={billAmount}
                                                onChange={(e) => setBillAmount(e.target.value)}
                                                className="block w-full pl-16 pr-8 h-20 bg-gray-50 border-none rounded-[1.5rem] text-3xl font-black text-gray-900 focus:ring-4 focus:ring-hope-green/10 transition-all placeholder:text-gray-200"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {billAmount && !isNaN(Number(billAmount)) && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-6 space-y-3"
                                        >
                                            <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                                <span>Subtotal</span>
                                                <span>₹{Number(billAmount).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-black text-green-600">
                                                <span>HOPE Discount ({scannedData.guestDiscountSlab}%)</span>
                                                <span className="flex items-center gap-1">- ₹{(Number(billAmount) * (scannedData.guestDiscountSlab / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="pt-3 border-t-2 border-gray-50 flex justify-between items-center">
                                                <span className="text-lg font-black text-gray-900">Amount Payable</span>
                                                <span className="text-3xl font-black text-gray-900">₹{(Number(billAmount) * (1 - scannedData.guestDiscountSlab / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="pt-2 flex gap-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={handleReset} 
                                            disabled={isSettling}
                                            className="flex-1 h-14 rounded-2xl border-gray-100"
                                        >
                                            Back to Scan
                                        </Button>
                                        <Button 
                                            disabled={!billAmount || isSettling} 
                                            onClick={handleSettle}
                                            className="flex-[2] h-14 rounded-2xl bg-hope-green hover:bg-hope-green/90 shadow-xl shadow-hope-green/10 border-none font-black uppercase tracking-widest gap-2"
                                        >
                                            {isSettling ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Settle Bill</>}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS MESSAGE */}
                        {scanState === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 relative">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 z-10" />
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Transaction Successful!</h3>
                                <p className="text-gray-500 font-medium mb-12">The referral has been recorded and the partner's commission has been credited.</p>
                                
                                <div className="space-y-4">
                                    <Button onClick={handleReset} className="w-full h-16 text-lg rounded-2xl font-black uppercase tracking-widest bg-gray-900 text-white border-none gap-3">
                                        Scan Next <ArrowRight className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" onClick={onClose} className="w-full text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                                        Exit Management Hub
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
