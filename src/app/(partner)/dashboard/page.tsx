"use client";

import React, { useEffect, useState } from "react";
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
    ChevronRight
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

export default function PartnerDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats,   setStats]   = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res  = await fetch("/api/partner/stats?partnerId=demo");
                const data = await res.json();
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
            <div className="p-8 space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
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
        { label: "Available Balance",        value: `₹${(stats.partnerDetails.walletTotal ?? 0).toLocaleString()}`, icon: Wallet,      change: "Ready to Payout",                  color: "text-hope-purple",    bg: "bg-hope-purple/5" },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="p-8 space-y-10">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Partner Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        Welcome back, {stats.partnerDetails.name}! Monitoring your live performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="gap-2.5 h-11 shadow-sm border border-gray-300" onClick={() => toast.success("Exporting data...")}>
                        <Download className="w-4 h-4" /> Export Data
                    </Button>
                </div>
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
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

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
                                <p className="text-4xl font-black text-gray-900">₹{(stats.partnerDetails.walletTotal ?? 0).toLocaleString()}</p>
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
                    <Card className="border border-gray-300 rounded-md h-full glass">
                        <CardHeader className="p-10 border-b border-gray-300">
                            <CardTitle>Recent Settled Referrals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-300">
                                            {["Date", "Customer", "Bill Amount", "Status", "Commission"].map((h, i) => (
                                                <th key={h} className={cn("pb-6 font-black text-[10px] text-gray-500 uppercase tracking-widest", i === 4 && "text-right")}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-300">
                                        {stats.recentReferrals.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-sm font-medium text-gray-400">
                                                    No settled referrals yet. Start sharing your QR code!
                                                </td>
                                            </tr>
                                        ) : stats.recentReferrals.map((row: any, i: number) => (
                                            <tr key={i} className="group hover:bg-gray-50/50 transition-all">
                                                <td className="py-6 text-sm font-bold text-gray-500">{row.date}</td>
                                                <td className="py-6">
                                                    <p className="text-sm font-extrabold text-gray-900">{row.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">#{row.id.slice(-6)}</p>
                                                </td>
                                                <td className="py-6 text-sm font-medium text-gray-600 font-mono">₹{row.bill.toFixed(2)}</td>
                                                <td className="py-6"><StatusBadge status={row.status} /></td>
                                                <td className="py-6 text-lg font-black text-hope-green text-right">
                                                    <span className="group-hover:mr-2 transition-all">+₹{row.commission.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right column */}
                <motion.div variants={item} className="space-y-6 flex flex-col h-full">

                    {/* Payouts */}
                    <Card className="border border-gray-300 rounded-md bg-white shadow-xl shadow-gray-200/50 flex-1 flex flex-col">
                        <CardHeader className="border-b border-gray-300 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm uppercase tracking-widest text-gray-500">Recent Payouts</CardTitle>
                            <Link href="/payouts" className="text-[10px] font-black text-hope-purple uppercase tracking-widest hover:underline flex items-center gap-1">
                                View History <ChevronRight className="w-3 h-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            {stats.payouts.length === 0 ? (
                                <p className="text-center py-6 text-xs font-bold text-gray-400">No payouts received yet.</p>
                            ) : stats.payouts.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-md border border-gray-300 hover:border-gray-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-black text-gray-900">₹{p.amount.toFixed(2)}</p>
                                        <p className="text-[10px] font-bold text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
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

                    {/* QR Standee Card */}
                    <Card className="bg-hope-green text-white border border-gray-300 rounded-md shadow-xl shadow-hope-green/20 overflow-hidden relative shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0" />
                        <CardHeader className="relative z-10 border-b border-white/20">
                            <CardTitle className="text-white text-center">Your Live Standee</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center relative z-10 pb-8">

                            {/* QR Code — id="partner-qr-svg" is used by downloadQR() */}
                            <div className="bg-white p-6 rounded-md border border-gray-300 inline-block mb-4 shadow-2xl shadow-black/20">
                                <Link target="_blank" href={`/p/${stats.partnerDetails.code}`}>
                                    <div
                                        id="partner-qr-svg"
                                        className="w-32 h-32 cursor-pointer hover:opacity-90 transition-opacity"
                                        title="Click to open referral page"
                                    >
                                        <QRCode
                                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${stats.partnerDetails.code}`}
                                            size={128}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox="0 0 256 256"
                                            fgColor="#f97316"
                                        />
                                    </div>
                                </Link>
                            </div>

                            <p className="text-sm font-medium text-white/80 px-4 mb-4">
                                Scan to open your referral page.
                            </p>

                            {/* ── Download button ── */}
                            <button
                                onClick={() => downloadQR(stats.partnerDetails.code, stats.partnerDetails.name)}
                                className="flex items-center gap-2 mx-auto mb-5 bg-white text-hope-green font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-md border border-gray-300 hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-black/10"
                            >
                                <ImageDown className="w-4 h-4" />
                                Download QR as PNG
                            </button>

                            {/* Copy link */}
                            <button
                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-md border border-gray-300 transition-all group/link"
                                onClick={() => {
                                    const url = `${window.location.origin}/p/${stats.partnerDetails.code}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success("Referral link copied!");
                                }}
                            >
                                <p className="text-[10px] text-white font-black uppercase tracking-widest">
                                    {typeof window !== "undefined" ? window.location.host : "hopecafe.com"}/p/{stats.partnerDetails.code}
                                </p>
                                <Copy className="w-3.5 h-3.5 text-white/40 group-hover/link:text-white transition-colors" />
                            </button>

                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
