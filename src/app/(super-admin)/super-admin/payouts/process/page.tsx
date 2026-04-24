"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
    ChevronLeft, 
    QrCode, 
    Copy, 
    Smartphone, 
    CheckCircle2, 
    ArrowLeft,
    Wallet,
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-hope-purple" />
            </div>
        );
    }

    if (!partner) return null;

    const upiID = partner.upiId;
    const amount = partner.walletBalance;
    // UPI Deep Link Format: upi://pay?pa=upiid@bank&pn=NAME&am=100.00&cu=INR
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
        <div className="max-w-2xl mx-auto py-10 px-6">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 font-bold uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Queue
            </button>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Process Payout</h1>
                    <p className="text-gray-500 mt-1 font-medium">Follow the steps to complete manual UPI settlement.</p>
                </div>

                <Card className="border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white">
                    <CardContent className="p-10">
                        {/* Partner & Amount Info */}
                        <div className="text-center space-y-4 mb-10 pb-10 border-b border-gray-100">
                            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto text-3xl font-black text-white border-4 border-white shadow-xl">
                                {partner.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{partner.name}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{partner.partnerCode}</p>
                            </div>
                            <div className="pt-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                                <p className="text-5xl font-black text-hope-green tracking-tighter">₹{amount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Payout Details */}
                        <div className="bg-gray-50 rounded-md border border-gray-300 p-6 mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified UPI ID</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[8px] font-black rounded uppercase">Active</span>
                            </div>
                            <p className="text-xl font-black text-gray-900 tracking-tight break-all">{upiID}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                                onClick={() => setShowQR(!showQR)}
                                variant="outline"
                                className="h-16 gap-3 border-gray-300 hover:border-hope-purple hover:text-hope-purple"
                            >
                                <QrCode className="w-5 h-5" /> 
                                <span className="font-black uppercase tracking-widest text-[10px]">Generate QR to Pay</span>
                            </Button>
                            
                            <Button 
                                onClick={handleCopyUPI}
                                variant="outline"
                                className="h-16 gap-3 border-gray-300"
                            >
                                <Copy className="w-5 h-5" />
                                <span className="font-black uppercase tracking-widest text-[10px]">Copy UPI ID</span>
                            </Button>

                            <Button 
                                onClick={handleMobilePay}
                                className="md:col-span-2 h-16 gap-3 bg-gray-900 text-white hover:bg-black font-black uppercase tracking-widest text-xs shadow-xl"
                            >
                                <Smartphone className="w-5 h-5" /> Pay via UPI (Mobile App)
                            </Button>
                        </div>

                        {/* QR Code Display */}
                        {showQR && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-8 bg-white border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center"
                            >
                                <div className="p-4 bg-white rounded-md shadow-inner border border-gray-100">
                                    <QRCode value={upiLink} size={200} />
                                </div>
                                <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center max-w-[200px]">
                                    Scan with any GPay, PhonePe, or Paytm app to pay exactly ₹{amount.toLocaleString()}
                                </p>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {/* Final Settlement Confirmation */}
                <div className="pt-6">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-md border border-amber-200 text-amber-800">
                        <Info className="w-5 h-5 shrink-0" />
                        <p className="text-[10px] font-black uppercase leading-relaxed"> Confirm only after you have successfully completed the payment through your UPI application. This action is irreversible.</p>
                    </div>

                    <Button 
                        onClick={handleMarkSettled}
                        disabled={settling}
                        className="w-full h-16 bg-hope-green hover:bg-hope-green/90 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-hope-green/20"
                    >
                        {settling ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> Mark as Settled</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PayoutProcessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-hope-purple" /></div>}>
            <PayoutProcessContent />
        </Suspense>
    );
}
