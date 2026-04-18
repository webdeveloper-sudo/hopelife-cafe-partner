"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    ArrowLeftRight,
    TrendingUp,
    Wallet,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight,
    RefreshCw,
    Search as SearchIcon,
    Download,
    Calendar,
    ChevronRight,
    HelpCircle,
    Info
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function PartnerPayoutsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{
        walletBalance: number;
        lastPayout: number | null;
        totalWithdrawn: number;
    }>({
        walletBalance: 0,
        lastPayout: null,
        totalWithdrawn: 0
    });
    const [payouts, setPayouts] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/partner/payouts");
            const data = await res.json();
            if (data.success) {
                setPayouts(data.payouts);
                const last = data.payouts.find((p: any) => p.status === "COMPLETED");
                const total = data.payouts
                    .filter((p: any) => p.status === "COMPLETED")
                    .reduce((sum: number, p: any) => sum + p.amount, 0);
                
                setStats({
                    walletBalance: data.walletBalance,
                    lastPayout: last ? last.amount : null,
                    totalWithdrawn: total
                });
            }
        } catch (error) {
            toast.error("Failed to load payout history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredPayouts = payouts.filter(p => 
        p.razorpayPayoutId?.toLowerCase().includes(search.toLowerCase()) ||
        p.status.toLowerCase().includes(search.toLowerCase()) ||
        p.amount.toString().includes(search)
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Earnings & Payouts</h1>
                    <p className="text-gray-500 mt-1 font-medium">Track your commissions and withdrawal history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 h-11 border-gray-100 bg-white" onClick={() => fetchData()}>
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
                    </Button>
                    <Button className="gap-2 h-11 bg-hope-purple hover:bg-hope-purple/90 text-white px-6 font-black uppercase tracking-widest text-xs">
                        <Download className="w-4 h-4" /> Statement
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Available Balance", value: `₹${stats.walletBalance.toLocaleString()}`, sub: "Ready for next settlement", icon: Wallet, color: "text-hope-purple", bg: "bg-hope-purple/5" },
                    { label: "Last Payout", value: stats.lastPayout ? `₹${stats.lastPayout.toLocaleString()}` : "N/A", sub: "Most recent transfer", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Total Earnings", value: `₹${stats.totalWithdrawn.toLocaleString()}`, sub: "Lifetime disbursed", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((s, i) => (
                    <motion.div key={i} variants={item}>
                        <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", s.bg)}>
                                        <s.icon className={cn("w-6 h-6", s.color)} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.sub}</span>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{s.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{s.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Notice */}
            <motion.div variants={item} className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-black text-blue-900 text-sm">Settlement Information</h4>
                    <p className="text-xs text-blue-700 font-medium mt-1 leading-relaxed">
                        Your wallet balance represents commission earned from confirmed guest visits. Payouts are initiated by the HOPE Cafe admin team at the end of every settlement cycle. Funds are typically credited within 24 hours of initiation.
                    </p>
                </div>
            </motion.div>

            {/* History Table */}
            <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight">Payout History</h3>
                    <div className="relative w-full max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-10 text-xs border-gray-100" 
                            placeholder="Search payouts..." 
                        />
                    </div>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Reference ID</th>
                                    <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Method</th>
                                    <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold">Loading your history...</td></tr>
                                ) : filteredPayouts.length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No payouts found</td></tr>
                                ) : filteredPayouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="px-8 py-6 font-bold text-gray-600 text-sm">
                                            {new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono truncate max-w-[120px]">
                                                {p.razorpayPayoutId || p.id}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-gray-400" />
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{p.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1 items-start">
                                                <StatusBadge status={p.status} className={cn(
                                                    p.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                                                    p.status === "PROCESSING" ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                    "bg-red-50 text-red-600 border-red-100"
                                                )} />
                                                {p.failureReason && <span className="text-[8px] text-red-500 font-black uppercase max-w-[120px] truncate">{p.failureReason}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-gray-900 text-lg">
                                            ₹{p.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                <Card className="border border-gray-100 bg-white">
                    <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">Payout Support</h4>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            If you notice any discrepancy in your earnings or if a processed payout hasn't reached your account after 48 hours, please contact our finance team.
                        </p>
                        <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-gray-200 h-10">
                            Raise a Support Query
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-gray-100 bg-white">
                    <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">Payment Details</h4>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            Ensure your bank account or UPI information is always up to date in settings to avoid payment failures.
                        </p>
                        <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-gray-200 h-10" onClick={() => window.location.href = '/settings'}>
                            Update Settings <ArrowUpRight className="w-3 h-3 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
