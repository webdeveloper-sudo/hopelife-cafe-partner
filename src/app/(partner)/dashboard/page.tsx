"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Wallet,
    BarChart2,
    Download,
    ExternalLink,
    CheckCircle2,
    Copy,
    ImageDown,
    ChevronRight,
    Share2,
    MessageSquare,
    Sparkles,
    QrCode as QrIcon
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import MilestoneTracker from "@/components/MilestoneTracker";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

/** Downloads the partner QR code as a branded PNG (512×512 + footer) */
function downloadQR(partnerCode: string, partnerName: string) {
    const svgEl = document.getElementById("partner-qr-svg")?.querySelector("svg");
    if (!svgEl) { toast.error("QR code not found"); return; }

    const qrSize   = 512;
    const padding  = 48;
    const footerH  = 80;
    const canvasW  = qrSize + padding * 2;
    const canvasH  = qrSize + padding * 2 + footerH;

    const canvas = document.createElement("canvas");
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Light card shadow behind QR
    ctx.shadowColor   = "rgba(0,0,0,0.07)";
    ctx.shadowBlur    = 28;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle     = "#ffffff";
    ctx.fillRect(padding - 8, padding - 8, qrSize + 16, qrSize + 16);
    ctx.shadowColor   = "transparent";

    // Serialize SVG → Blob URL → Image → draw on canvas
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl  = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, padding, padding, qrSize, qrSize);
        URL.revokeObjectURL(svgUrl);

        // Green footer bar
        ctx.fillStyle = "#1a6b3a";
        ctx.fillRect(0, canvasH - footerH, canvasW, footerH);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";
        ctx.font      = "bold 22px Poppins, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("HOPE Cafe Partner", canvasW / 2, canvasH - footerH + 30);

        ctx.font      = "16px Poppins, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.fillText(partnerName || partnerCode, canvasW / 2, canvasH - footerH + 56);

        const link      = document.createElement("a");
        link.download   = `hopecafe-qr-${partnerCode}.png`;
        link.href       = canvas.toDataURL("image/png");
        link.click();
        toast.success("QR code downloaded! 🎉");
    };
    img.onerror = () => toast.error("Failed to render QR image.");
    img.src = svgUrl;
}

/** Returns a dynamic greeting based on the current hour */
function getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export default function PartnerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats,   setStats]   = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res  = await fetch("/api/partner/stats?partnerId=demo");
                const data = await res.json();

                if (res.status === 403 && data.error === "RESTRICTED") {
                    toast.error(data.message || "Your account has been restricted.");
                    sessionStorage.removeItem("hopecafe_partner_session");
                    try {
                        await fetch("/api/auth/logout", { method: "POST" });
                    } catch (e) {
                        console.error("Logout error:", e);
                    }
                    router.push("/login");
                    return;
                }

                if (data.success) setStats(data);
            } catch {
                toast.error("Failed to load dashboard metrics.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <div className="p-4 sm:p-8 space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-56 rounded-2xl border border-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48 rounded-md border border-gray-300" />
                    <Skeleton className="h-48 rounded-md border border-gray-300" />
                    <Skeleton className="h-48 rounded-md border border-gray-300" />
                </div>
                <Skeleton className="h-[400px] rounded-md border border-gray-300" />
            </div>
        );
    }

    const metrics = [
        { label: "Total Generated Leads",   value: stats.metrics.totalLeads.toString(),              icon: TrendingUp,  change: "Live",                             color: "text-blue-500",       bg: "bg-blue-50" },
        { label: "Total Cafe Sales",         value: `₹${stats.metrics.totalSales.toFixed(2)}`,       icon: BarChart2,   change: "All Time",                         color: "text-green-500",      bg: "bg-green-50" },
        { label: "Net Earned Commission",    value: `₹${stats.metrics.totalCommission.toFixed(2)}`,  icon: Wallet,      change: `${stats.partnerDetails.effectiveSlab}% Effective Slab`,color: "text-hope-green",     bg: "bg-hope-green/5" },
        { label: "Total Paid",               value: `₹${stats.metrics.totalPaid.toFixed(2)}`,        icon: CheckCircle2,change: "Settled",                          color: "text-green-600",      bg: "bg-green-100" },
        { label: "Available Balance",        value: `₹${(stats.partnerDetails.walletBalance ?? 0).toLocaleString()}`, icon: Wallet,      change: "Ready to Payout",                  color: "text-hope-purple",    bg: "bg-hope-purple/5", legend: `Threshold: ₹${stats.metrics.minPayoutAmount}` },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="p-4 sm:p-8 space-y-8 md:space-y-10">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                        {getTimeGreeting()}, {stats.partnerDetails.name}!
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Here is what&apos;s happening with your referrals and performance today.
                    </p>
                </div>
            </div>

            {/* ── TOP SECTION: My Referral QR & Quick Share ── */}
            <motion.div variants={item}>
                <Card className="border border-gray-200 rounded-2xl bg-white shadow-xl shadow-gray-200/40 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-hope-green/5 rounded-full blur-3xl pointer-events-none -z-0" />
                    <CardContent className="p-6 sm:p-8 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            {/* Left: QR Code & Details */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 shadow-inner inline-block shrink-0">
                                    <Link target="_blank" href={`/p/${stats.partnerDetails.code}`}>
                                        <div
                                            id="partner-qr-svg"
                                            className="w-36 h-36 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                            title="Click to view referral pass"
                                        >
                                            <QRCode
                                                value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${stats.partnerDetails.code}`}
                                                size={126}
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                viewBox="0 0 256 256"
                                                fgColor="#1a6b3a"
                                            />
                                        </div>
                                    </Link>
                                </div>

                                <div className="space-y-2.5 max-w-md">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-green-200">
                                        <Sparkles className="w-3.5 h-3.5 text-hope-green" /> My Referral QR
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Referral Pass & Link</h2>
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                                        Share this permanent QR or link with guests. Guests get <span className="font-bold text-green-700">{stats.partnerDetails.guestDiscountSlab || 7.5}% OFF</span> and you earn <span className="font-bold text-gray-900">{stats.partnerDetails.effectiveSlab}% commission</span>.
                                    </p>
                                    
                                    {/* URL badge with copy */}
                                    <div className="pt-1">
                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/p/${stats.partnerDetails.code}`;
                                                navigator.clipboard.writeText(url);
                                                toast.success("Referral link copied!");
                                            }}
                                            className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-gray-700 transition-all border border-gray-200 group"
                                        >
                                            <span>{typeof window !== "undefined" ? window.location.host : "hopecafe.com"}/p/{stats.partnerDetails.code}</span>
                                            <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action Buttons (Download PNG, WhatsApp, Share, Copy Link) */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-64 shrink-0">
                                <Button
                                    onClick={() => downloadQR(stats.partnerDetails.code, stats.partnerDetails.name)}
                                    className="w-full h-11 bg-hope-green hover:bg-hope-green/90 text-white font-bold rounded-xl gap-2 shadow-lg shadow-hope-green/10"
                                >
                                    <ImageDown className="w-4 h-4" /> Download QR as PNG
                                </Button>

                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const shareUrl = `${window.location.origin}/p/${stats.partnerDetails.code}`;
                                            const text = encodeURIComponent(`Hey! Use my referral link to get a special discount at HOPE Cafe 🌴🌺:\n${shareUrl}`);
                                            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
                                        }}
                                        className="h-10 border-gray-200 text-gray-700 font-bold rounded-xl gap-1.5 hover:bg-green-50 hover:text-green-700 hover:border-green-300 text-xs"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={async () => {
                                            const shareUrl = `${window.location.origin}/p/${stats.partnerDetails.code}`;
                                            if (navigator.share) {
                                                try {
                                                    await navigator.share({
                                                        title: "HOPE Cafe Referral",
                                                        text: `Get a special discount at HOPE Cafe! Use my referral code: ${stats.partnerDetails.code}`,
                                                        url: shareUrl,
                                                    });
                                                } catch (err: any) {
                                                    if (err.name !== "AbortError") {
                                                        navigator.clipboard.writeText(shareUrl);
                                                        toast.success("Link copied to clipboard!");
                                                    }
                                                }
                                            } else {
                                                navigator.clipboard.writeText(shareUrl);
                                                toast.success("Link copied to clipboard!");
                                            }
                                        }}
                                        className="h-10 border-gray-200 text-gray-700 font-bold rounded-xl gap-1.5 text-xs"
                                    >
                                        <Share2 className="w-3.5 h-3.5" /> Share
                                    </Button>
                                </div>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        const url = `${window.location.origin}/p/${stats.partnerDetails.code}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Referral link copied!");
                                    }}
                                    className="w-full h-10 border border-gray-200 font-bold rounded-xl gap-2 text-xs"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy Pass Link
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

          

            {/* ── Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                {metrics.map((m, idx) => (
                    <motion.div key={idx} variants={item} className="h-full">
                        <Card className="h-full glass-card hover:-translate-y-1.5 border border-gray-300 rounded-md cursor-default group transition-all">
                            <CardContent className="p-8 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("w-14 h-14 rounded-md border border-gray-300 flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110", m.bg)}>
                                        <m.icon className={cn("w-7 h-7", m.color)} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black px-3 py-1.5 rounded-md border border-gray-300 shadow-sm uppercase tracking-widest",
                                        idx === 4 ? "bg-hope-purple/10 text-hope-purple" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {m.change}
                                    </span>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.label}</h3>
                                    <p className="text-4xl font-extrabold text-gray-900 mt-2">{m.value}</p>
                                    {m.legend && <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mt-1 opacity-80">{m.legend}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

              {/* ── Milestone ── */}
            <motion.div variants={item}>
                <MilestoneTracker
                    current={stats.partnerDetails.totalLeads}
                    goal={stats.partnerDetails.referralGoal}
                    tier={stats.partnerDetails.currentTier}
                    baseCommission={stats.partnerDetails.slab}
                    discountRate={stats.partnerDetails.guestDiscountSlab}
                />
            </motion.div>

            {/* ── Earnings Transparency Breakdown ── */}
            <motion.div variants={item}>
                <Card className="border border-gray-300 rounded-md bg-white shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-300">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-hope-purple" />
                                <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Earnings Breakdown</h3>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-50 text-green-700 border border-green-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Synced with Ledger</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-300">
                            <div className="p-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Carryover Bonus</p>
                                <p className="text-2xl font-black text-gray-900">₹{(stats.partnerDetails.bonusAmount ?? 0).toLocaleString()}</p>
                                <p className="text-[10px] text-green-600 font-bold mt-1">Non-withdrawable Base</p>
                            </div>
                            <div className="p-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Commissions</p>
                                <p className="text-2xl font-black text-gray-900">₹{(stats.partnerDetails.earnedCommission ?? 0).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">From all referrals</p>
                            </div>
                            <div className="p-8">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Withdrawn</p>
                                <p className="text-2xl font-black text-gray-900">₹{(stats.metrics.totalWithdrawn ?? 0).toLocaleString()}</p>
                                <p className="text-[10px] text-red-500 font-bold mt-1">Processed Payouts</p>
                            </div>
                            <div className="p-8 bg-hope-purple/5">
                                <p className="text-[10px] font-black text-hope-purple uppercase tracking-widest mb-1">Net Available Funds</p>
                                <p className="text-4xl font-black text-gray-900">₹{(stats.partnerDetails.walletBalance ?? 0).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">Live Statement Balance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ── Lower Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

                {/* Referrals table */}
                <motion.div variants={item} className="lg:col-span-2 h-full">
                    <Card className="border border-gray-200 rounded-2xl bg-white shadow-xl shadow-gray-200/40 overflow-hidden h-full flex flex-col">
                        <CardHeader className="p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-hope-green">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-gray-900">Recent Settled Referrals</h3>
                                    <p className="text-xs text-gray-400 font-medium">Live guest redemptions at HOPE Cafe</p>
                                </div>
                            </div>
                            <Link 
                                href="/referrals" 
                                className="text-xs font-bold text-hope-green hover:text-hope-green/80 hover:underline flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100">
                                            <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Guest Profile</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Bill Amount</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-right">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stats.recentReferrals.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-14 text-center text-sm font-medium text-gray-400">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200">
                                                        <Sparkles className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    No settled referrals yet. Start sharing your QR code!
                                                </td>
                                            </tr>
                                        ) : stats.recentReferrals.map((row: any, i: number) => (
                                            <tr key={i} className="group hover:bg-gray-50/60 transition-all">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-hope-green/10 border border-green-200/60 flex items-center justify-center font-extrabold text-hope-green text-sm group-hover:scale-105 transition-transform">
                                                            {row.name ? row.name.charAt(0).toUpperCase() : "G"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{row.name || "Guest"}</p>
                                                            <p className="text-[11px] font-mono text-gray-400">#{row.id ? row.id.slice(-6).toUpperCase() : "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                                                    {row.date}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">
                                                    ₹{Number(row.bill || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <StatusBadge status={row.status || "SETTLED"} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-hope-green font-mono bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                                                        +₹{Number(row.commission || 0).toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right column: Recent Payouts */}
                <motion.div variants={item} className="space-y-6 flex flex-col h-full">
                    <Card className="border border-gray-200 rounded-2xl bg-white shadow-xl shadow-gray-200/40 flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-hope-purple">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-gray-900">Recent Payouts</h3>
                                    <p className="text-xs text-gray-400 font-medium">Bank settlement history</p>
                                </div>
                            </div>
                            <Link href="/payouts" className="text-xs font-bold text-hope-purple hover:underline flex items-center gap-1">
                                View History <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-1 p-6">
                            {stats.payouts.length === 0 ? (
                                <div className="py-14 text-center text-sm font-medium text-gray-400">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200">
                                        <Wallet className="w-5 h-5 text-gray-400" />
                                    </div>
                                    No payouts received yet.
                                </div>
                            ) : stats.payouts.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-black text-gray-900">₹{p.amount.toFixed(2)}</p>
                                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <StatusBadge status={p.status} className={cn(
                                        p.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                                        p.status === "PROCESSING" ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                        "bg-red-50 text-red-600 border-red-100"
                                    )} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
