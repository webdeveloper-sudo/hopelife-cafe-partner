"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
    QrCode, 
    Copy, 
    Smartphone, 
    CheckCircle2, 
    ArrowLeft,
    Info,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "sonner";
import QRCode from "react-qr-code";

function PayoutProcessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const partnerId = searchParams.get("partnerId");
    
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [settling, setSettling] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        if (!partnerId) {
            router.push("/super-admin/payouts");
            return;
        }

        const fetchPartner = async () => {
            try {
                const res = await fetch(`/api/admin/partners/${partnerId}`);
                const data = await res.json();
                if (data.success) {
                    setPartner(data.partner);
                } else {
                    toast.error("Partner not found");
                    router.push("/super-admin/payouts");
                }
            } catch (err) {
                toast.error("Error loading partner details");
            } finally {
                setLoading(false);
            }
        };

        fetchPartner();
    }, [partnerId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-hope-purple" />
            </div>
        );
    }

    if (!partner) return null;

    const upiID = partner.upiId;
    const amount = partner.walletBalance;
    const upiLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(partner.name)}&am=${amount.toFixed(2)}&cu=INR&tn=HOPE_Cafe_Payout`;

    const handleCopyUPI = () => {
        navigator.clipboard.writeText(upiID);
        toast.success("UPI ID copied to clipboard!");
    };

    const handleMobilePay = () => {
        window.location.href = upiLink;
    };

    const handleMarkSettled = async () => {
        setSettling(true);
        try {
            const res = await fetch("/api/admin/payouts/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    partnerId: partner.id,
                    manual: true 
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Payout marked as settled successfully!");
                router.push("/super-admin/payouts");
            } else {
                toast.error(data.error || "Failed to settle payout");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setSettling(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-16 px-6 bg-gray-50 min-h-screen">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-10 font-semibold uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
            </button>

            <div className="space-y-8">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Financial Settlement</h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm">Review the partner details and execute the UPI transfer.</p>
                </div>

                <Card className="border border-gray-200 shadow-2xl shadow-gray-200/40 relative overflow-hidden bg-white rounded-md">
                    <CardContent className="p-10">
                        {/* Partner & Amount Info */}
                        <div className="text-center space-y-4 mb-10 pb-10 border-b border-gray-100">
                            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto text-3xl font-black text-white border-4 border-gray-50 shadow-inner">
                                {partner.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{partner.name}</h2>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">{partner.partnerCode}</p>
                            </div>
                            <div className="pt-4">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
                                <p className="text-5xl font-black text-hope-green tracking-tighter">₹{amount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Payout Details */}
                        <div className="bg-gray-50 rounded-md border border-gray-200 p-6 mb-10 shadow-inner group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Recipient UPI ID</span>
                                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[8px] font-semibold rounded uppercase border border-green-100">Verified</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900 tracking-tight break-all">{upiID}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                                onClick={() => setShowQR(!showQR)}
                                variant="outline"
                                className="h-16 gap-3 border-gray-200 hover:border-hope-purple hover:bg-hope-purple/5 text-gray-600 hover:text-hope-purple transition-all rounded-md"
                            >
                                <QrCode className="w-5 h-5" /> 
                                <span className="font-semibold uppercase tracking-widest text-[10px]">Generate UPI QR</span>
                            </Button>
                            
                            <Button 
                                onClick={handleCopyUPI}
                                variant="outline"
                                className="h-16 gap-3 border-gray-200 hover:bg-gray-50 text-gray-600 rounded-md"
                            >
                                <Copy className="w-5 h-5" />
                                <span className="font-semibold uppercase tracking-widest text-[10px]">Copy ID</span>
                            </Button>

                            <Button 
                                onClick={handleMobilePay}
                                className="md:col-span-2 h-16 gap-3 bg-gray-900 text-white hover:bg-black font-semibold uppercase tracking-widest text-xs shadow-xl rounded-md transition-all hover:scale-[1.01]"
                            >
                                <Smartphone className="w-5 h-5" /> Open Mobile Payment App
                            </Button>
                        </div>

                        {/* QR Code Display */}
                        {showQR && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-10 bg-white border border-gray-100 rounded-md flex flex-col items-center shadow-inner"
                            >
                                <div className="p-4 bg-white rounded-md shadow-md border border-gray-100">
                                    <QRCode value={upiLink} size={180} />
                                </div>
                                <p className="mt-6 text-[10px] font-medium text-gray-400 uppercase tracking-widest text-center max-w-[240px] leading-loose">
                                    Scan with any UPI app to transfer <br /> ₹{amount.toLocaleString()} to {partner.name}
                                </p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {/* Final Settlement Confirmation */}
                <div className="pt-6 space-y-6">
                    <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-md border border-amber-100 text-amber-800">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-medium uppercase leading-loose tracking-wide"> 
                            Confirm only after the payment is successful in your bank records. 
                            This will atomically reset the partner's wallet balance.
                        </p>
                    </div>

                    <Button 
                        onClick={handleMarkSettled}
                        disabled={settling}
                        className="w-full h-16 bg-hope-green hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-hope-green/10 rounded-md transition-all active:scale-[0.98]"
                    >
                        {settling ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-3" /> Mark as Successfully Settled</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PayoutProcessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-hope-purple" /></div>}>
            <PayoutProcessContent />
        </Suspense>
    );
}
