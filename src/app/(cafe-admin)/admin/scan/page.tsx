"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ScanLine, 
    CheckCircle2, 
    AlertCircle, 
    IndianRupee, 
    X, 
    Loader2, 
    User, 
    Smartphone, 
    ArrowRight, 
    ArrowLeft, 
    Store, 
    Percent, 
    ShieldCheck, 
    RotateCcw,
    Keyboard,
    Camera
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        ACTIVE: "bg-green-50 text-green-700 border-green-200",
        PENDING: "bg-amber-50 text-amber-700 border-amber-200",
        REJECTED: "bg-red-50 text-red-700 border-red-200",
        RESTRICTED: "bg-red-100 text-red-800 border-red-300",
    };
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border", styles[status] || "bg-gray-100 text-gray-600 border-gray-300")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", status === "ACTIVE" ? "bg-green-500" : "bg-red-500")} />
            {status}
        </span>
    );
};

export default function CashierScanPage() {
    const router = useRouter();
    const [scanStatus, setScanStatus] = useState<
        "idle" | "scanning" | "verifying" | "partner-detected" | "guest-info" | "validating" | "billing" | "settling" | "settled" | "error"
    >("idle");
    
    // Scanner vs Manual Mode Tab
    const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");
    const [manualCode, setManualCode] = useState("");
    
    // Partner Data
    const [scannedPartner, setScannedPartner] = useState<any>(null);
    const [rawQrData, setRawQrData] = useState<string>("");
    
    // Guest Details Form Inputs
    const [guestName, setGuestName] = useState("");
    const [guestMobile, setGuestMobile] = useState("");
    const [registeredGuest, setRegisteredGuest] = useState<any>(null);
    
    // Billing
    const [billAmount, setBillAmount] = useState("");
    const [settlementResult, setSettlementResult] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    
    // Error tracking
    const [errorMsg, setErrorMsg] = useState("");

    // Simulate calculation delay for aesthetics
    useEffect(() => {
        if (billAmount && !isNaN(Number(billAmount)) && Number(billAmount) > 0) {
            setIsCalculating(true);
            const timer = setTimeout(() => setIsCalculating(false), 300);
            return () => clearTimeout(timer);
        } else {
            setIsCalculating(false);
        }
    }, [billAmount]);

    const verifyPartnerCode = async (code: string) => {
        if (!code || !code.trim()) {
            toast.error("Please provide a valid Partner Code or URL");
            return;
        }

        setScanStatus("verifying");
        setRawQrData(code.trim());

        try {
            const response = await fetch("/api/admin/scan-partner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ partnerCode: code.trim(), action: "verify" })
            });

            const data = await response.json();

            if (data.success) {
                setScannedPartner(data.partner);
                setScanStatus("partner-detected");
                toast.success("Partner identified successfully!");
            } else {
                toast.error(data.error || "Partner not found with this code");
                setScanStatus(scanMode === "camera" ? "scanning" : "idle");
            }
        } catch (err) {
            toast.error("Network error during verification.");
            setScanStatus(scanMode === "camera" ? "scanning" : "idle");
        }
    };

    const handleStartScan = () => {
        setScanMode("camera");
        setScanStatus("scanning");
        setErrorMsg("");
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue;
            if (scanStatus === "scanning" && code) {
                verifyPartnerCode(code);
            }
        }
    };

    const handleManualVerify = (e: React.FormEvent) => {
        e.preventDefault();
        verifyPartnerCode(manualCode);
    };

    // Step: Proceed to Guest Information form
    const handleProceedToGuestInfo = () => {
        setScanStatus("guest-info");
    };

    // Step: Submit Guest Details and move to Billing
    const handleGuestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (guestMobile.length !== 10 || !guestName.trim()) {
            toast.error("Please provide a valid 10-digit mobile number and guest name.");
            return;
        }

        setScanStatus("validating");
        setErrorMsg("");

        try {
            const response = await fetch("/api/admin/scan-partner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "register-guest",
                    partnerCode: scannedPartner.partnerCode,
                    guestName: guestName.trim(),
                    guestMobile: guestMobile.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setRegisteredGuest(data.guest);
                setScanStatus("billing");
                toast.success("Guest verified! Proceed to bill amount.");
            } else {
                setErrorMsg(data.error || "Partner status validation failed.");
                setScanStatus("error");
                toast.error("Verification Blocked");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
            setScanStatus("guest-info");
        }
    };

    // Step: Complete Transaction / Settle Bill
    const handleCompleteTransaction = async () => {
        setScanStatus("settling");
        try {
            const response = await fetch("/api/admin/scan-partner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "settle",
                    guestId: registeredGuest.id,
                    billAmount: Number(billAmount)
                })
            });

            const data = await response.json();

            if (data.success) {
                setSettlementResult(data);
                toast.success(`Discount of ₹${data.discountApplied.toFixed(2)} applied successfully!`);
                setScanStatus("settled");
            } else {
                toast.error(data.error || "Failed to settle transaction.");
                setScanStatus("billing");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
            setScanStatus("billing");
        }
    };

    const handleReset = () => {
        setScanStatus("idle");
        setManualCode("");
        setGuestName("");
        setGuestMobile("");
        setBillAmount("");
        setScannedPartner(null);
        setRegisteredGuest(null);
        setSettlementResult(null);
        setRawQrData("");
        setErrorMsg("");
    };

    return (
        <div className="px-4 py-8 md:py-12 max-w-md mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center">
            <div className="text-center mb-6 w-full">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Referral Settlement</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Scan partner referral QR or enter code to apply guest discount.</p>
            </div>

            <div className="w-full relative">
                <AnimatePresence mode="wait">
                    {/* STEP 1: SCANNER & MANUAL ENTRY */}
                    {(scanStatus === "idle" || scanStatus === "scanning" || scanStatus === "verifying") && (
                        <motion.div
                            key="step-scanner"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full"
                        >
                            {/* Mode Toggle */}
                            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6 border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScanMode("camera");
                                        setScanStatus("idle");
                                    }}
                                    className={cn(
                                        "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                        scanMode === "camera" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Camera className="w-4 h-4" /> Camera Scan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setScanMode("manual");
                                        setScanStatus("idle");
                                    }}
                                    className={cn(
                                        "py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                                        scanMode === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    <Keyboard className="w-4 h-4" /> Enter Code
                                </button>
                            </div>

                            {/* CAMERA MODE - IDLE */}
                            {scanMode === "camera" && scanStatus === "idle" && (
                                <div className="text-center space-y-6">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-gray-200">
                                        <ScanLine className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Ready to Scan</h3>
                                        <p className="text-sm text-gray-500 mb-6 max-w-[220px] mx-auto">Scan guest&apos;s referral QR code from their mobile.</p>
                                        <Button onClick={handleStartScan} className="w-full py-6 text-lg rounded-xl shadow-lg shadow-hope-green/20 bg-hope-green hover:bg-hope-green/90 gap-2">
                                            <Camera className="w-5 h-5" /> Open Camera
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* CAMERA MODE - SCANNING & VERIFYING */}
                            {scanMode === "camera" && (scanStatus === "scanning" || scanStatus === "verifying") && (
                                <div className="w-full relative text-center">
                                    <h3 className="text-base font-bold text-gray-900 mb-4">Scanning Referral QR</h3>
                                    <div className="w-full aspect-square bg-gray-900 rounded-xl overflow-hidden relative shadow-inner">
                                        {scanStatus === "scanning" && (
                                            <div className="absolute inset-0 z-0">
                                                <Scanner
                                                    onScan={handleScan}
                                                    onError={(err) => {
                                                        console.warn("Scanner error:", err);
                                                    }}
                                                    constraints={{ facingMode: "environment" }}
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
                                            className="absolute inset-x-12 top-1/2 h-0.5 bg-hope-green shadow-[0_0_15px_rgba(25,122,26,1)] z-20 pointer-events-none"
                                        />
                                        
                                        {scanStatus === "verifying" && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                                                <span className="w-8 h-8 rounded-full border-4 border-hope-green border-t-transparent animate-spin mb-3"></span>
                                                <p className="text-sm font-bold text-white tracking-widest uppercase">Resolving Partner...</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button onClick={handleReset} variant="outline" className="flex-1 rounded-xl py-5">
                                            Cancel Scan
                                        </Button>
                                        <Button onClick={() => setScanMode("manual")} variant="secondary" className="rounded-xl py-5 text-xs font-bold gap-1.5">
                                            <Keyboard className="w-4 h-4" /> Enter Manually
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* MANUAL MODE */}
                            {scanMode === "manual" && (
                                <form onSubmit={handleManualVerify} className="space-y-4">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Enter Partner Code</h3>
                                        <p className="text-xs text-gray-500 mt-1">Enter code (e.g. <span className="font-mono font-bold text-gray-800">SAM7602</span>) or paste URL</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Partner Code or Referral Link</label>
                                        <input
                                            type="text"
                                            value={manualCode}
                                            onChange={(e) => setManualCode(e.target.value)}
                                            placeholder="e.g. SAM7602 or https://.../p/SAM7602"
                                            className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-md font-mono font-bold text-gray-950 focus:ring-2 focus:ring-hope-green focus:border-hope-green placeholder:text-gray-300"
                                            required
                                            autoFocus
                                            disabled={scanStatus === "verifying"}
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        disabled={!manualCode.trim() || scanStatus === "verifying"}
                                        className="w-full py-6 rounded-xl text-md font-bold shadow-lg shadow-hope-green/20 bg-hope-green hover:bg-hope-green/90 gap-2"
                                    >
                                        {scanStatus === "verifying" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Verifying Partner...
                                            </>
                                        ) : (
                                            <>
                                                Verify Partner <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: PARTNER IDENTIFIED (PROCEED BUTTON) */}
                    {scanStatus === "partner-detected" && (
                        <motion.div
                            key="step-partner-detected"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full"
                        >
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Referral Partner</p>
                                    <h3 className="text-lg font-extrabold text-gray-900">{scannedPartner?.name}</h3>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Partner Code</span>
                                    <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded border border-gray-200 text-xs">
                                        {scannedPartner?.partnerCode}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Account Status</span>
                                    <StatusBadge status={scannedPartner?.status} />
                                </div>

                                {scannedPartner?.businessType && scannedPartner.businessType !== "N/A" && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Type</span>
                                        <span className="font-semibold text-gray-800 text-xs">{scannedPartner.businessType}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200/60">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Guest Discount</span>
                                    <span className="font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">
                                        {scannedPartner?.guestDiscountSlab || 7.5}% OFF
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button 
                                    onClick={handleProceedToGuestInfo}
                                    className="w-full py-6 rounded-xl text-md font-bold shadow-lg shadow-hope-green/20 bg-hope-green hover:bg-hope-green/90 border-none gap-2"
                                >
                                    Proceed <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Button 
                                    type="button" 
                                    onClick={handleReset} 
                                    variant="ghost" 
                                    className="w-full text-gray-500 hover:text-gray-900 font-medium"
                                >
                                    Cancel & Rescan
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: GUEST DETAILS COLLECTION */}
                    {(scanStatus === "guest-info" || scanStatus === "validating") && (
                        <motion.div
                            key="step-guest-details"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full"
                        >
                            {/* Partner Header Summary */}
                            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Referred By</p>
                                    <h3 className="text-md font-bold text-gray-900 truncate">{scannedPartner?.name}</h3>
                                    <p className="text-xs text-gray-500 font-mono">Code: {scannedPartner?.partnerCode}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-200">
                                        {scannedPartner?.guestDiscountSlab || 7.5}% OFF
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-base font-bold text-gray-900 mb-1">Guest Details</h4>
                                <p className="text-xs text-gray-500">Enter the guest&apos;s name and mobile number to proceed.</p>
                            </div>

                            <form onSubmit={handleGuestSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guest Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Smartphone className="h-4 w-4 text-gray-400" />
                                            <span className="ml-1.5 text-sm font-bold text-gray-800">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={guestMobile}
                                            onChange={(e) => setGuestMobile(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-md font-semibold text-gray-950 focus:ring-2 focus:ring-hope-green focus:border-hope-green placeholder:text-gray-300"
                                            placeholder="99999 99999"
                                            required
                                            autoFocus
                                            disabled={scanStatus === "validating"}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guest Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                                            className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-md font-semibold text-gray-950 focus:ring-2 focus:ring-hope-green focus:border-hope-green placeholder:text-gray-300"
                                            placeholder="Guest Full Name"
                                            required
                                            disabled={scanStatus === "validating"}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                    <Button 
                                        type="submit" 
                                        disabled={guestMobile.length !== 10 || !guestName.trim() || scanStatus === "validating"} 
                                        className="w-full py-6 rounded-xl text-md font-bold shadow-lg shadow-hope-green/20 bg-hope-green hover:bg-hope-green/90 border-none gap-2"
                                    >
                                        {scanStatus === "validating" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Validating Guest...
                                            </>
                                        ) : (
                                            <>
                                                Next <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={() => setScanStatus("partner-detected")} 
                                        variant="ghost" 
                                        className="w-full text-gray-500 hover:text-gray-900 font-medium"
                                        disabled={scanStatus === "validating"}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Partner
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 4: BILLING PROCESS */}
                    {(scanStatus === "billing" || scanStatus === "settling") && (
                        <motion.div
                            key="step-billing"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 border-t-4 border-t-green-500 w-full"
                        >
                            {/* Verified Info */}
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guest Verified</p>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{registeredGuest?.name}</h3>
                                    <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> +91 {registeredGuest?.mobile} (Visit #{registeredGuest?.referralCount})
                                    </p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="inline-block px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold tracking-wider border border-green-200">
                                        {registeredGuest?.guestDiscountSlab}% OFF
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
                                            autoFocus
                                            disabled={scanStatus === "settling"}
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
                                                    <span>Discount ({registeredGuest.guestDiscountSlab}%)</span>
                                                    <span>-₹{(Number(billAmount) * (registeredGuest.guestDiscountSlab / 100)).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-900 text-xl font-black pt-1">
                                                    <span>Payable</span>
                                                    <span>₹{(Number(billAmount) * (1 - registeredGuest.guestDiscountSlab / 100)).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button 
                                        onClick={handleCompleteTransaction} 
                                        className="w-full py-6 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20 gap-3 border-none" 
                                        disabled={!billAmount || isNaN(Number(billAmount)) || Number(billAmount) <= 0 || scanStatus === "settling"}
                                    >
                                        {scanStatus === "settling" ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Processing Settlement...
                                            </>
                                        ) : (
                                            "Apply Discount & Settle"
                                        )}
                                    </Button>
                                    <Button type="button" onClick={handleReset} variant="ghost" className="w-full mt-2 text-gray-500 hover:text-gray-900 font-medium" disabled={scanStatus === "settling"}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: TRANSACTION SETTLED */}
                    {scanStatus === "settled" && (
                        <motion.div
                            key="step-settled"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 w-full text-center"
                        >
                            <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Transaction Settled</h3>
                            <p className="text-sm text-gray-500 mb-6">Discount applied successfully. Commission recorded for partner.</p>

                            <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200 mb-6 text-sm space-y-2">
                                <div className="flex justify-between font-medium text-gray-500">
                                    <span>Discount Applied</span>
                                    <span className="font-bold text-green-600">₹{settlementResult?.discountApplied?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-gray-500">
                                    <span>Commission Earned</span>
                                    <span className="font-bold text-gray-900">₹{settlementResult?.commissionEarned?.toFixed(2)}</span>
                                </div>
                                {settlementResult?.tierUpgrade && (
                                    <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-md p-3 text-xs font-bold text-center mt-3 animate-bounce">
                                        🎉 Partner Upgraded to {settlementResult.tierUpgrade.newTier}! (Bonus: ₹{settlementResult.tierUpgrade.bonusAwarded})
                                    </div>
                                )}
                            </div>

                            <Button onClick={handleReset} className="w-full py-6 rounded-xl text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg border-none">
                                Scan Next Referral
                            </Button>
                        </motion.div>
                    )}

                    {/* ERROR / BLOCKED STATE */}
                    {scanStatus === "error" && (
                        <motion.div
                            key="step-error"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 w-full text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Referral Blocked</h3>
                            <p className="text-sm text-red-600 font-bold mb-8 px-4 leading-relaxed">{errorMsg}</p>
                            <Button onClick={handleReset} variant="outline" className="w-full py-6 rounded-xl text-lg font-bold border-red-200 text-red-600 hover:bg-red-50">
                                Try Another Standee / QR
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
