"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Wallet,
    Search as SearchIcon,
    Clock,
    ExternalLink,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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

type Tab = "queue" | "monthly" | "history";

export default function AdminPayoutsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("queue");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Data states
    const [eligiblePartners, setEligiblePartners] = useState<any[]>([]);
    const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const fetchEligible = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/payouts/eligible");
            const data = await res.json();
            if (data.success) setEligiblePartners(data.partners);
        } catch { toast.error("Failed to load payout queue"); }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/payouts");
            const data = await res.json();
            if (data.success) setPayoutHistory(data.payouts);
        } catch { toast.error("Failed to load payout history"); }
    }, []);

    const fetchConfig = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            if (data.success) setConfig(data.config);
        } catch { console.error("Failed to load config"); }
    }, []);

    const fetchMonthly = useCallback(async (month: string) => {
        try {
            const res = await fetch(`/api/admin/payouts/monthly-preview?month=${month}`);
            const data = await res.json();
            if (data.success) setMonthlyData(data.data);
        } catch { toast.error("Failed to load monthly preview"); }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchEligible(), fetchHistory(), fetchConfig()]).finally(() => setLoading(false));
    }, [fetchEligible, fetchHistory, fetchConfig]);

    useEffect(() => {
        if (activeTab === "monthly") {
            fetchMonthly(selectedMonth);
        }
    }, [activeTab, selectedMonth, fetchMonthly]);

    const handleDispense = (partnerId: string) => {
        router.push(`/super-admin/payouts/process?partnerId=${partnerId}`);
    };

    const handleUpdateThreshold = async (val: string) => {
        const threshold = parseFloat(val);
        if (isNaN(threshold)) return;
        
        try {
            const res = await fetch("/api/admin/config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ minPayoutAmount: threshold })
            });
            if (res.ok) {
                toast.success(`Threshold updated to ₹${threshold}`);
                fetchConfig();
            }
        } catch { toast.error("Failed to update threshold"); }
    };

    const totalInQueue = eligiblePartners.reduce((sum, p) => sum + p.walletBalance, 0);

    const filteredQueue = eligiblePartners.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.partnerCode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Manual Payouts</h1>
                    <p className="text-gray-500 mt-1 font-medium">Verify earnings and dispense partner commissions via UPI.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total in Queue", value: `₹${totalInQueue.toLocaleString()}`, sub: `${eligiblePartners.length} partners`, icon: Wallet, color: "text-hope-green", bg: "bg-hope-green/5" },
                    { label: "Monthly Disbursed", value: `₹${(payoutHistory.reduce((s, p) => s + (p.status === "COMPLETED" ? p.amount : 0), 0) / 1000).toFixed(1)}K`, sub: "Completed payouts", icon: ExternalLink, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Pending Payouts", value: `${eligiblePartners.filter(p => (p.walletBalance >= (config?.minPayoutAmount || 100))).length}`, sub: "Above threshold", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                ].map((s, i) => (
                    <motion.div key={i} variants={item}>
                        <Card className="border-none bg-white shadow-xl shadow-gray-200/50 rounded-md">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn("w-12 h-12 rounded-md border border-gray-200 flex items-center justify-center", s.bg)}>
                                        <s.icon className={cn("w-6 h-6", s.color)} />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{s.sub}</span>
                                </div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none">{s.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{s.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1 bg-gray-50 rounded-md border border-gray-200 w-full max-w-2xl">
                {(["queue", "monthly", "history"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-md text-[10px] font-semibold uppercase tracking-widest transition-all",
                            activeTab === t ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {t === "queue" ? "Payout Queue" : t === "monthly" ? "Monthly Review" : "Audit History"}
                    </button>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)}
                        className="pl-12 h-12 border-gray-200 focus:bg-white bg-white shadow-sm rounded-md" 
                        placeholder="Search by partner name, code..." 
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white px-4 h-12 rounded-md border border-gray-200 shadow-sm shrink-0">
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap">Min Threshold</span>
                        <input 
                            type="number" 
                            className="w-16 border-none focus:ring-0 text-sm font-bold text-hope-purple" 
                            defaultValue={config?.minPayoutAmount || 100}
                            onBlur={(e) => handleUpdateThreshold(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <Card className="border border-gray-100 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden rounded-md">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {activeTab === "queue" && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Partner</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Wallet Balance</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Payout Details</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredQueue.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-gray-300 font-medium uppercase tracking-widest text-[10px]">No partners eligible for payout</td></tr>
                                    ) : filteredQueue.map((p) => {
                                        const minAmount = config?.minPayoutAmount || 100;
                                        const isBelowThreshold = p.walletBalance < minAmount;

                                        return (
                                        <tr key={p.id} className={cn("group transition-all cursor-default", isBelowThreshold ? "opacity-50 grayscale-[0.5]" : "hover:bg-gray-50/80")}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0">{p.name[0]}</div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{p.partnerCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-lg">₹{p.walletBalance.toLocaleString()}</p>
                                                {isBelowThreshold && <p className="text-[8px] font-semibold text-amber-600 uppercase">Below Threshold (Min ₹{minAmount})</p>}
                                            </td>
                                            <td className="px-8 py-6">
                                                {p.upiId ? (
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status="UPI" className="bg-white border-gray-200" />
                                                        <span className="text-[10px] text-gray-500 font-medium">{p.upiId}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span className="text-[10px] font-medium uppercase tracking-widest">No UPI ID Set</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button 
                                                    disabled={!p.upiId || isBelowThreshold}
                                                    onClick={() => handleDispense(p.id)}
                                                    className="h-9 px-4 text-[10px] font-semibold uppercase tracking-widest bg-white text-gray-900 border border-gray-200 hover:bg-hope-green hover:text-white hover:border-hope-green rounded-md"
                                                >
                                                    Dispense Payout
                                                </Button>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "monthly" && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Partner</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Month Sales</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Month Earnings</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Available Balance</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest text-center">Visits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {monthlyData.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-gray-300 font-medium uppercase tracking-widest text-[10px]">No data for this month</td></tr>
                                    ) : monthlyData.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-all cursor-default">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase">{m.partnerCode}</p>
                                            </td>
                                            <td className="px-8 py-6 font-semibold text-gray-600">₹{m.monthlySales.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-bold text-hope-green">₹{m.monthlyCommission.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-bold text-gray-900">₹{m.currentWalletBalance.toLocaleString()}</td>
                                            <td className="px-8 py-6 text-center font-medium text-gray-400 text-sm">{m.scanCount} Scans</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "history" && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Transaction / Date</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest">Partner</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 font-semibold text-[10px] text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payoutHistory.length === 0 ? (
                                        <tr><td colSpan={4} className="py-20 text-center text-gray-300 font-medium uppercase tracking-widest text-[10px]">No payout history found</td></tr>
                                    ) : payoutHistory.map((pay) => (
                                        <tr key={pay.id} className="group hover:bg-gray-50/80 transition-all cursor-default">
                                            <td className="px-8 py-6">
                                                <p className="text-[10px] font-medium text-gray-900 uppercase tracking-widest">{pay.id}</p>
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">{pay.date}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-900 text-sm">{pay.partner}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-100 text-[10px] font-medium uppercase tracking-widest",
                                                    pay.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                                                    pay.status === "PENDING" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                                                )}>
                                                    {pay.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                                                    {pay.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-gray-900 text-lg">
                                                ₹{pay.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Add simple AlertCircle icon if missing in imports
// function AlertCircle(props: any) {
//     return (
//         <svg
//             {...props}
//             xmlns="http://www.w3.org/2000/svg"
//             width="24"
//             height="24"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="12" />
//             <line x1="12" y1="16" x2="12.01" y2="16" />
//         </svg>
//     );
// }
