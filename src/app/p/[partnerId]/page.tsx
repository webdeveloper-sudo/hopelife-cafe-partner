"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Copy, ImageDown, Sparkles, Share2, MessageSquare, Check } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";

export default function GuestReferralQRPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const unwrappedParams = React.use(params);
    const [partnerData, setPartnerData] = useState<{ name: string, discount: number } | null>(null);
    const [partnerError, setPartnerError] = useState<string | null>(null);
    const [partnerLoading, setPartnerLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    React.useEffect(() => {
        const fetchPartner = async () => {
            setPartnerLoading(true);
            try {
                const res = await fetch(`/api/partner/details?code=${unwrappedParams.partnerId}`);
                const data = await res.json();
                if (data.success) {
                    setPartnerData({ name: data.name, discount: data.discount });
                } else {
                    setPartnerError(data.error || "Partner not found");
                }
            } catch (e) {
                console.error("Failed to fetch partner info");
                setPartnerError("Unable to load partner information");
            } finally {
                setPartnerLoading(false);
            }
        };
        fetchPartner();
    }, [unwrappedParams.partnerId]);

    const partnerName = partnerData?.name || (unwrappedParams.partnerId === "demo" ? "Grand Hope Cafe" : `Partner #${unwrappedParams.partnerId}`);
    const discountSlab = partnerData?.discount || 7.5;

    const downloadQR = () => {
        const svgEl = document.getElementById("guest-partner-qr-svg")?.querySelector("svg");
        if (!svgEl) { toast.error("QR code not found"); return; }

        const qrSize = 512;
        const padding = 48;
        const footerH = 80;
        const canvasW = qrSize + padding * 2;
        const canvasH = qrSize + padding * 2 + footerH;

        const canvas = document.createElement("canvas");
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext("2d")!;

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);

        // Light card shadow behind QR
        ctx.shadowColor = "rgba(0,0,0,0.07)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(padding - 8, padding - 8, qrSize + 16, qrSize + 16);
        ctx.shadowColor = "transparent";

        // Serialize SVG → Blob URL → Image → draw on canvas
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, padding, padding, qrSize, qrSize);
            URL.revokeObjectURL(svgUrl);

            // Green footer bar
            ctx.fillStyle = "#1a6b3a";
            ctx.fillRect(0, canvasH - footerH, canvasW, footerH);

            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px Poppins, -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillText("HOPE Cafe Referral Pass", canvasW / 2, canvasH - footerH + 30);

            ctx.font = "16px Poppins, -apple-system, BlinkMacSystemFont, sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.72)";
            ctx.fillText(`Via Partner: ${partnerName}`, canvasW / 2, canvasH - footerH + 56);

            const link = document.createElement("a");
            link.download = `hopecafe-referral-${unwrappedParams.partnerId}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            toast.success("Referral QR downloaded! 🎉");
        };
        img.onerror = () => toast.error("Failed to render QR image.");
        img.src = svgUrl;
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/p/${unwrappedParams.partnerId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Referral link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/p/${unwrappedParams.partnerId}`;
        const title = `HOPE Cafe Discount Pass - ${discountSlab}% OFF`;
        const text = `Claim your exclusive ${discountSlab}% discount at HOPE Cafe using this referral pass! 🌴🌺`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    handleCopyLink();
                }
            }
        } else {
            handleCopyLink();
        }
    };

    const handleWhatsAppShare = () => {
        const url = `${window.location.origin}/p/${unwrappedParams.partnerId}`;
        const text = encodeURIComponent(`Hey! Here is your exclusive ${discountSlab}% discount referral pass for HOPE Cafe 🌴🌺:\n${url}\n\nShow this QR code at the counter during billing.`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    };

    return (
        <AuthLayout>
            <div className="mx-auto w-full max-w-md">
                {/* Header Branding */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-gray-300 overflow-hidden p-2 transition-transform hover:scale-105 duration-500">
                        <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">HOPE Cafe</h1>
                    <p className="text-white/70 font-medium text-sm mt-1">
                        {partnerLoading ? "Validating Referrer..." : partnerError ? "Invalid Referral Link" : `Referral Pass via ${partnerName}`}
                    </p>
                </div>

                {partnerError && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 text-center mb-8">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                        <p className="text-sm text-gray-500 mb-6">{partnerError}</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full">Retry Connection</Button>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {!partnerLoading && !partnerError && (
                        <motion.div
                            key="referral-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-2xl shadow-2xl shadow-black/20 border border-gray-200 text-center"
                        >
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-4 border border-green-100">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Your Referral Pass</h2>
                                <p className="text-sm text-gray-500 font-medium">Claim your {discountSlab}% discount at HOPE Cafe.</p>
                            </div>

                            {/* QR Code */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 inline-block mb-6 shadow-inner">
                                <div id="guest-partner-qr-svg" className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <QRCode
                                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${unwrappedParams.partnerId}`}
                                        size={220}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox="0 0 256 256"
                                        fgColor="#1a6b3a"
                                    />
                                </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-xl text-left mb-6">
                                <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                                    📱 <strong>HOW TO USE:</strong> Show this QR to the cafe admin while completing your bill to get your instant discount.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button 
                                    onClick={downloadQR}
                                    className="w-full h-13 py-4 bg-hope-green hover:bg-hope-green/90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-hope-green/10"
                                >
                                    <ImageDown className="w-5 h-5" /> Download Pass QR
                                </Button>
                                
                                <div className="grid grid-cols-2 gap-2.5">
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={handleWhatsAppShare}
                                        className="h-12 border-gray-200 text-gray-700 font-bold rounded-xl gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                    >
                                        <MessageSquare className="w-4 h-4 text-[#25D366]" /> WhatsApp
                                    </Button>

                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={handleShare}
                                        className="h-12 border-gray-200 text-gray-700 font-bold rounded-xl gap-2"
                                    >
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                </div>

                                <Button 
                                    type="button"
                                    variant="ghost"
                                    onClick={handleCopyLink}
                                    className="w-full h-10 text-xs text-gray-500 hover:text-gray-900 font-semibold gap-1.5"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Link Copied!" : "Copy Pass Link"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
