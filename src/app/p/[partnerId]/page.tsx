"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CheckCircle2, Copy, ExternalLink, ImageDown, Sparkles } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";

export default function GuestRegistrationPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const unwrappedParams = React.use(params);
    const [partnerData, setPartnerData] = useState<{ name: string, discount: number } | null>(null);
    const [partnerError, setPartnerError] = useState<string | null>(null);
    const [partnerLoading, setPartnerLoading] = useState(true);

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

    return (
        <AuthLayout>
            <div className="mx-auto w-full max-w-md">
                {/* Header Branding */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-gray-300 overflow-hidden p-2 transition-transform hover:scale-105 duration-500">
                        <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-fit" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter">HOPE Cafe</h1>
                    <p className="text-white/70 font-medium text-sm mt-1">
                        {partnerLoading ? "Validating Referrer..." : partnerError ? "Invalid Referral Link" : `Referral Pass via ${partnerName}`}
                    </p>
                </div>

                {partnerError && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-md shadow-2xl border border-red-100 text-center mb-8">
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
                            className="bg-white p-8 rounded-md shadow-2xl shadow-black/20 border border-gray-300 text-center"
                        >
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-4 border border-green-100">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">You Have Been Referred!</h2>
                                <p className="text-sm text-gray-500 font-medium">Claim your {discountSlab}% discount at HOPE Cafe.</p>
                            </div>

                            {/* QR Code */}
                            <div className="bg-gray-50 p-6 rounded-md border border-gray-200 inline-block mb-6 shadow-inner">
                                <div id="guest-partner-qr-svg" className="bg-white p-4 rounded-md border border-gray-300">
                                    <QRCode
                                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${unwrappedParams.partnerId}`}
                                        size={200}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox="0 0 256 256"
                                        fgColor="#1a6b3a"
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-md text-left mb-6">
                                <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                    👉 <strong>HOW TO USE:</strong> Save this QR code (screenshot or download) and present it to the Cafe Cashier during checkout to claim your discount.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Button 
                                    onClick={downloadQR}
                                    className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest gap-2 shadow-xl shadow-green-600/10"
                                >
                                    <ImageDown className="w-5 h-5" /> Download Pass QR
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => {
                                        const url = `${window.location.origin}/p/${unwrappedParams.partnerId}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Referral link copied!");
                                    }}
                                    className="w-full h-14 border-gray-300 font-black uppercase tracking-widest gap-2"
                                >
                                    <Copy className="w-5 h-5" /> Copy Pass Link
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
