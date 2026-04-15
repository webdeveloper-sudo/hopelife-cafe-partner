"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Wallet,
    BarChart2,
    Download,
    ExternalLink,
    QrCode,
    CheckCircle2,
    Copy
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
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function PartnerDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats for demo partner (GHS1092) - in prod, get real partnered from session cookie
                const res = await fetch("/api/partner/stats?partnerId=demo");
                const data = await res.json();
                if (data.success) {
                    setStats(data);
                }
            } catch (err) {
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
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-48 rounded-[2rem]" />
                    <Skeleton className="h-48 rounded-[2rem]" />
                    <Skeleton className="h-48 rounded-[2rem]" />
                </div>
                <Skeleton className="h-[400px] rounded-[2rem]" />
            </div>
        );
    }

    const metrics = [
        { label: "Total Generated Leads", value: stats.metrics.totalLeads.toString(), icon: TrendingUp, change: "Live", color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Total Cafe Sales", value: `₹${stats.metrics.totalSales.toFixed(2)}`, icon: BarChart2, change: "All Time", color: "text-green-500", bg: "bg-green-50" },
        { label: "Net Earned Commission", value: `₹${stats.metrics.totalCommission.toFixed(2)}`, icon: Wallet, change: `${stats.partnerDetails.slab}% Slab`, color: "text-hope-green", bg: "bg-hope-green/5" },
        { label: "Total Paid", value: `₹${stats.metrics.totalPaid.toFixed(2)}`, icon: CheckCircle2, change: "Settled", color: "text-green-600", bg: "bg-green-100" },
        { label: "Total Owed", value: `₹${stats.metrics.totalOwed.toFixed(2)}`, icon: Wallet, highlight: stats.metrics.totalOwed > 0, change: "Pending", color: "text-hope-green", bg: "bg-hope-green/10" },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-8 space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Partner Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium">Welcome back, {stats.partnerDetails.name}! Monitoring your live hospitality referrals.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="flex items-center justify-center gap-2.5 h-11" aria-label="Export partner data as CSV" onClick={() => toast.success("Exporting data...")}>
                        <Download className="w-4 h-4 shrink-0" /> <span className="translate-y-[0.5px]">Export Data</span>
                    </Button>
                    <Button className="flex items-center justify-center gap-2.5 h-11" aria-label="Get partner support" onClick={() => toast.info("Opening support channel...")}>
                        <ExternalLink className="w-4 h-4 shrink-0" /> <span className="translate-y-[0.5px]">Get Support</span>
                    </Button>
                </div>
            </div>

            {/* Milestone Tracker Section */}
            <motion.div variants={item}>
                <MilestoneTracker 
                    current={stats.partnerDetails.totalLeads} 
                    goal={stats.partnerDetails.referralGoal} 
                    tier={stats.partnerDetails.currentTier} 
                />
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                {metrics.map((m, idx) => (
                    <motion.div key={idx} variants={item} className="h-full">
                        <Card className="h-full glass-card hover:-translate-y-1.5 border-none cursor-default group">
                            <CardContent className="p-8 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110", m.bg)}>
                                        <m.icon className={cn("w-7 h-7 font-black", m.color.replace('600', '500'))} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest",
                                        idx === 2 ? 'bg-hope-green/10 text-hope-green' : 'bg-gray-100 text-gray-600'
                                    )}>
                                        {m.change}
                                    </span>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest min-h-[20px]">{m.label}</h3>
                                    <p className="text-4xl font-extrabold text-gray-900 mt-2 flex items-baseline gap-1">
                                        {m.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                <motion.div variants={item} className="lg:col-span-2 h-full">
                    <Card className="border-none h-full glass">
                        <CardHeader>
                            <CardTitle>Recent Settled Referrals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="pb-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Date</th>
                                            <th className="pb-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Customer</th>
                                            <th className="pb-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Bill Amount</th>
                                            <th className="pb-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                                            <th className="pb-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats.recentReferrals.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-sm font-medium text-gray-400">
                                                    No settled referrals yet. Start sharing your QR code!
                                                </td>
                                            </tr>
                                        ) : (
                                            stats.recentReferrals.map((row: any, i: number) => (
                                                <tr key={i} className="group hover:bg-gray-50/50 transition-all">
                                                    <td className="py-6 text-sm font-bold text-gray-500">{row.date}</td>
                                                    <td className="py-6">
                                                        <p className="text-sm font-extrabold text-gray-900">{row.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">#{row.id.slice(-6)}</p>
                                                    </td>
                                                    <td className="py-6 text-sm font-medium text-gray-600 font-mono">₹{row.bill.toFixed(2)}</td>
                                                    <td className="py-6">
                                                        <StatusBadge status={row.status} />
                                                    </td>
                                                    <td className="py-6 text-lg font-black text-hope-green text-right">
                                                        <span className="group-hover:mr-2 transition-all">+₹{row.commission.toFixed(2)}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="space-y-6 flex flex-col h-full">
                    <Card className="border-none bg-white shadow-xl shadow-gray-200/50 flex-1 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest text-gray-500">Recent Payouts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            {stats.payouts.length === 0 ? (
                                <p className="text-center py-6 text-xs font-bold text-gray-400">No payouts received yet.</p>
                            ) : (
                                stats.payouts.map((p: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div>
                                            <p className="text-sm font-black text-gray-900">₹{p.amount.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-hope-green text-white border-none shadow-xl shadow-hope-green/20 overflow-hidden relative shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-0" />
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-white text-center">Your Live Standee</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center relative z-10 pb-14">
                            <div className="bg-white p-7 rounded-[2.5rem] inline-block mb-6 shadow-2xl shadow-purple-950/20 group-hover:scale-105 transition-transform duration-500">
                                <Link target="_blank" href={`/p/${stats.partnerDetails.code}`}>
                                    <div className="w-32 h-32 bg-white flex items-center justify-center cursor-pointer">
                                        <QRCode
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${stats.partnerDetails.code}`}
                                            size={128}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                            fgColor="#f97316"
                                        />
                                    </div>
                                </Link>
                            </div>
                            <p className="text-sm font-medium text-white/90 px-4 mb-6">Click the QR Code to open your public registration page and see the flow.</p>

                            <div
                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer group/link"
                                onClick={() => {
                                    const url = `${window.location.origin}/p/${stats.partnerDetails.code}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success("Referral link copied!");
                                }}
                            >
                                <p className="text-[10px] text-white font-black uppercase tracking-widest">
                                    {typeof window !== 'undefined' ? window.location.host : 'hopecafe.com'}/p/{stats.partnerDetails.code}
                                </p>
                                <Copy className="w-3.5 h-3.5 text-white/40 group-hover/link:text-white transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
