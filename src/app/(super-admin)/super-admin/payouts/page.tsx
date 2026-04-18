"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    Search as SearchIcon,
    Loader2,
    CheckSquare,
    Square,
    Info,
    AlertCircle,
    X,
    RefreshCw,
    Calendar,
    ChevronRight,
    ChevronDown,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    const [activeTab, setActiveTab] = useState<Tab>("queue");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Data states
    const [eligiblePartners, setEligiblePartners] = useState<any[]>([]);
    const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [rzpBalance, setRzpBalance] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    
    // selection state for bulk
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Modal state
    const [previewModal, setPreviewModal] = useState<{ show: boolean, data: any[] | null }>({ show: false, data: null });
    const [isSettling, setIsSettling] = useState(false);
    const [isReconciling, setIsReconciling] = useState(false);

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

    const fetchBalance = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/payouts/balance");
            const data = await res.json();
            if (data.success) setRzpBalance(data.balance);
        } catch { console.error("Failed to load balance"); }
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
        Promise.all([fetchEligible(), fetchHistory(), fetchConfig(), fetchBalance()]).finally(() => setLoading(false));
    }, [fetchEligible, fetchHistory, fetchConfig, fetchBalance]);

    useEffect(() => {
        if (activeTab === "monthly") {
            fetchMonthly(selectedMonth);
        }
    }, [activeTab, selectedMonth, fetchMonthly]);

    const handleReconcile = async () => {
        setIsReconciling(true);
        toast.info("Reconciling with Razorpay...");
        try {
            const res = await fetch("/api/admin/payouts/reconcile", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                toast.success(`Reconciliation complete. Checked ${data.totalChecked} payouts.`);
                fetchHistory();
                fetchEligible();
                fetchBalance();
            } else {
                toast.error(data.error || "Reconciliation failed");
            }
        } catch { toast.error("Network error during reconciliation"); }
        finally { setIsReconciling(false); }
    };

    const handleSettleIndividual = async (partnerId: string) => {
        const partner = eligiblePartners.find(p => p.id === partnerId);
        if (rzpBalance !== null && partner.walletBalance > rzpBalance) {
            toast.error("Insufficient gateway balance for this payout.");
            return;
        }
        setPreviewModal({ show: true, data: [partner] });
    };

    const handleSettleBulk = async () => {
        if (selectedIds.size === 0) {
            toast.error("Please select at least one partner");
            return;
        }
        const selectedPartners = eligiblePartners.filter(p => selectedIds.has(p.id));
        const total = selectedPartners.reduce((s, p) => s + p.walletBalance, 0);
        
        if (rzpBalance !== null && total > rzpBalance) {
            toast.error(`Insufficient gateway balance. Required: ₹${total}, Available: ₹${rzpBalance}`);
            return;
        }

        setPreviewModal({ show: true, data: selectedPartners });
    };

    const confirmPayout = async () => {
        if (!previewModal.data) return;
        setIsSettling(true);
        try {
            const partnerIds = previewModal.data.map(p => p.id);
            const total = previewModal.data.reduce((s, p) => s + p.walletBalance, 0);

            // Double check balance before emitting
            if (rzpBalance !== null && total > rzpBalance) {
                toast.error("Gateway balance dropped. Cannot proceed.");
                setIsSettling(false);
                return;
            }

            const endpoint = partnerIds.length === 1 ? "/api/admin/payouts/initiate" : "/api/admin/payouts/bulk";
            const body = partnerIds.length === 1 ? { partnerId: partnerIds[0] } : { partnerIds };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(partnerIds.length === 1 ? "Payout initiated successfully!" : "Bulk payout process started.");
                setPreviewModal({ show: false, data: null });
                setSelectedIds(new Set());
                fetchEligible();
                fetchHistory();
                fetchBalance();
            } else {
                toast.error(data.error || "Failed to process payout");
            }
        } catch {
            toast.error("Network error during payout initiation");
        } finally {
            setIsSettling(false);
        }
    };

    const handleRetry = async (payoutId: string) => {
        toast.info("Retrying payout...");
        try {
            const res = await fetch("/api/admin/payouts/retry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payoutId })
            });
            if (res.ok) {
                toast.success("Retry initiated!");
                fetchHistory();
                fetchBalance();
            } else {
                const data = await res.json();
                toast.error(data.error || "Retry failed");
            }
        } catch { toast.error("Network error"); }
    };

    const handleSimulate = async (rzpPayoutId: string, event: string) => {
        setIsReconciling(true);
        toast.info(`Simulating ${event}...`);
        try {
            const res = await fetch("/api/admin/payouts/simulate-webhook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event, rzpPayoutId })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Simulation sent: ${data.handlerResponse?.message || "Success"}`);
                fetchHistory();
                fetchEligible();
                fetchBalance();
            } else {
                toast.error(data.error || "Simulation failed");
            }
        } catch { toast.error("Simulation network error"); }
        finally { setIsReconciling(false); }
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

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        const minAmount = config?.minPayoutAmount || 100;
        if (selectedIds.size === eligiblePartners.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(
                eligiblePartners
                    .filter(p => p.hasPayoutDetails && !p.isProcessing && p.walletBalance >= minAmount)
                    .map(p => p.id)
            ));
        }
    };

    const totalInQueue = eligiblePartners.reduce((sum, p) => sum + p.walletBalance, 0);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Payout Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Verify earnings and dispense partner commissions securely via Razorpay.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        isLoading={isReconciling}
                        className="gap-2 h-11 border-gray-300" 
                        onClick={handleReconcile}
                    >
                        <RefreshCw className={cn("w-4 h-4", isReconciling && "animate-spin")} /> Reconcile Status
                    </Button>
                    <Button 
                        disabled={selectedIds.size === 0}
                        onClick={handleSettleBulk}
                        className="gap-2 h-11 bg-hope-green hover:bg-hope-green/90 text-white px-6 font-black uppercase tracking-widest text-xs"
                    >
                        <TrendingUp className="w-4 h-4" /> Settle Selected ({selectedIds.size})
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total in Queue", value: `₹${totalInQueue.toLocaleString()}`, sub: `${eligiblePartners.length} partners`, icon: Wallet, color: "text-hope-green", bg: "bg-hope-green/5" },
                    { label: "Gateway Balance", value: rzpBalance !== null ? `₹${rzpBalance?.toLocaleString()}` : "Fetching...", sub: "RazorpayX Balance", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Avg Settlement", value: "14.2 Hrs", sub: "Last 30 days", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Monthly Disbursed", value: `₹${(payoutHistory.reduce((s, p) => s + (p.status === "COMPLETED" ? p.rawAmount : 0), 0) / 1000).toFixed(1)}K`, sub: "Completed payouts", icon: ExternalLink, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((s, i) => (
                    <motion.div key={i} variants={item}>
                        <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn("w-12 h-12 rounded-md border border-gray-300 flex items-center justify-center", s.bg)}>
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

            {/* Tab Navigation */}
            <div className="flex p-1 bg-gray-100 rounded-md border border-gray-300 w-full max-w-2xl">
                {(["queue", "monthly", "history"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === t ? "bg-white text-gray-900 shadow-sm border border-gray-300" : "text-gray-400 hover:text-gray-600"
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
                        className="pl-12 h-12 border-gray-300 focus:bg-white bg-white shadow-sm rounded-md" 
                        placeholder="Search by partner name, code, or amount..." 
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white px-4 h-12 rounded-md border border-gray-300 shadow-sm shrink-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Min Threshold</span>
                        <input 
                            type="number" 
                            className="w-16 border-none focus:ring-0 text-sm font-black text-hope-purple" 
                            defaultValue={config?.minPayoutAmount || 100}
                            onBlur={(e) => handleUpdateThreshold(e.target.value)}
                        />
                    </div>
                    {activeTab === "monthly" && (
                        <div className="w-full md:w-auto">
                            <Input 
                                type="month" 
                                className="h-12 border-gray-300" 
                                value={selectedMonth} 
                                onChange={e => setSelectedMonth(e.target.value)} 
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        {activeTab === "queue" && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-center w-12">
                                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-hope-green">
                                                {selectedIds.size === eligiblePartners.length && eligiblePartners.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </button>
                                        </th>
                                        <th className="px-4 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Partner</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Wallet Balance</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Method</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {eligiblePartners.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No partners eligible for payout</td></tr>
                                    ) : eligiblePartners.map((p, i) => {
                                        const minAmount = config?.minPayoutAmount || 100;
                                        const isBelowThreshold = p.walletBalance < minAmount;

                                        return (
                                        <tr key={p.id} className={cn("group transition-all cursor-default", isBelowThreshold ? "opacity-50 grayscale-[0.5]" : "hover:bg-gray-50/80")}>
                                            <td className="px-8 py-6 text-center">
                                                <button 
                                                    disabled={!p.hasPayoutDetails || p.isProcessing || isBelowThreshold}
                                                    onClick={() => toggleSelect(p.id)} 
                                                    className={cn("transition-colors", (!p.hasPayoutDetails || p.isProcessing || isBelowThreshold) ? "opacity-20 cursor-not-allowed" : "text-gray-400 hover:text-hope-green")}
                                                >
                                                    {selectedIds.has(p.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </td>
                                            <td className="px-4 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-md border border-gray-300 flex items-center justify-center text-white font-black text-xs shrink-0">{p.name[0]}</div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm">{p.name}</p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.partnerCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-lg">₹{p.walletBalance.toLocaleString()}</p>
                                                {isBelowThreshold && <p className="text-[8px] font-black text-amber-600 uppercase">Min ₹{minAmount} Required</p>}
                                                {!isBelowThreshold && p.lastPayoutDate && <p className="text-[10px] font-bold text-gray-400">Last: {new Date(p.lastPayoutDate).toLocaleDateString()}</p>}
                                            </td>
                                            <td className="px-8 py-6">
                                                {p.hasPayoutDetails ? (
                                                    <div className="flex items-center gap-2">
                                                        <StatusBadge status={p.payoutMethod} className="bg-white" />
                                                        <span className="text-[10px] text-gray-500 font-bold">{p.payoutMethod === "BANK_TRANSFER" ? p.bankName : p.upiId}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-red-500">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Update Details</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {p.isProcessing ? (
                                                    <div className="flex items-center justify-end gap-2 text-blue-600">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
                                                    </div>
                                                ) : (
                                                    <Button 
                                                        disabled={!p.hasPayoutDetails || isBelowThreshold}
                                                        onClick={() => handleSettleIndividual(p.id)}
                                                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-white text-gray-900 border border-gray-300 hover:bg-hope-green hover:text-white hover:border-hope-green"
                                                    >
                                                        Dispense Payout
                                                    </Button>
                                                )}
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
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Partner</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Month Sales</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Month Earnings</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Available Balance</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Visits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {monthlyData.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No earnings data for this month</td></tr>
                                    ) : monthlyData.map((m) => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-sm">{m.name}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">{m.partnerCode}</p>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-gray-600">₹{m.monthlySales.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-black text-hope-green">₹{m.monthlyCommission.toLocaleString()}</td>
                                            <td className="px-8 py-6 font-black text-gray-900">₹{m.currentWalletBalance.toLocaleString()}</td>
                                            <td className="px-8 py-6 text-center font-bold text-gray-400">{m.scanCount} Scans</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === "history" && (
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Transaction / ID</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Settlement Method</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payoutHistory.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No payout history found</td></tr>
                                    ) : payoutHistory.map((pay) => (
                                        <tr key={pay.id} className="group hover:bg-gray-50/80 transition-all cursor-default">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-sm">
                                                        {pay.partner}
                                                        {pay.retryCount > 0 && <span className="ml-2 text-[8px] bg-amber-100 text-amber-700 px-1 rounded uppercase">Retry #{pay.retryCount}</span>}
                                                    </h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{pay.razorpayPayoutId || pay.id} • {pay.date}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center">
                                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">{pay.method}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold block">{pay.bankDetails}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-[10px] font-black uppercase tracking-widest",
                                                        pay.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                                        pay.status === "PROCESSING" ? "bg-blue-100 text-blue-700 animate-pulse" :
                                                        pay.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                                    )}>
                                                        {pay.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                                                        {pay.status === "PROCESSING" && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        {pay.status}
                                                    </span>
                                                    {pay.failureReason && <span className="text-[8px] text-red-500 font-bold uppercase max-w-[150px] truncate">{pay.failureReason}</span>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900 text-lg">
                                                {pay.amount}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {pay.status === "PROCESSING" && (
                                                        <div className="flex items-center gap-1">
                                                            <Button 
                                                                onClick={() => handleSimulate(pay.razorpayPayoutId, "payout.processed")}
                                                                variant="outline" 
                                                                className="h-8 px-2 text-[8px] font-black uppercase tracking-widest text-hope-green border-hope-green/20 hover:bg-hope-green/10"
                                                                title="Simulate Success"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            </Button>
                                                            <Button 
                                                                onClick={() => handleSimulate(pay.razorpayPayoutId, "payout.failed")}
                                                                variant="outline" 
                                                                className="h-8 px-2 text-[8px] font-black uppercase tracking-widest text-red-600 border-red-200 hover:bg-red-50"
                                                                title="Simulate Failure"
                                                            >
                                                                <AlertCircle className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {pay.status === "FAILED" && pay.retryCount < 3 && (
                                                        <Button 
                                                            onClick={(e) => { e.stopPropagation(); handleRetry(pay.id); }}
                                                            variant="outline" 
                                                            className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        >
                                                            <RefreshCw className="w-3 h-3 mr-1" /> Retry
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        variant="ghost" 
                                                        className="text-xs font-black text-gray-400 hover:text-hope-green uppercase tracking-widest h-8 px-3 rounded-md border border-gray-300 gap-2"
                                                        onClick={() => toast.info(`Razorpay Ref: ${pay.razorpayPayoutId || "N/A"}`)}
                                                    >
                                                        Details <ArrowUpRight className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {previewModal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={() => setPreviewModal({ show: false, data: null })}
                            className="absolute inset-0 bg-transparent/40 backdrop-blur-sm" 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-md shadow-2xl border border-gray-300 w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Confirm Settlement</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Review payout summary before execution</p>
                                </div>
                                <button onClick={() => setPreviewModal({ show: false, data: null })} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {previewModal.data?.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-300">
                                            <div>
                                                <p className="font-black text-sm text-gray-900">{p.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <StatusBadge status={p.payoutMethod} className="h-4 px-1.5 text-[8px]" />
                                                    <span className="text-[9px] text-gray-500 font-bold">{p.payoutMethod === "BANK_TRANSFER" ? p.bankName : p.upiId}</span>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-gray-900">₹{p.walletBalance.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payouts</p>
                                        <p className="text-3xl font-black text-hope-green">₹{previewModal.data?.reduce((s, p) => s + p.walletBalance, 0).toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setPreviewModal({ show: false, data: null })} className="h-12 px-6 border-gray-300">Cancel</Button>
                                        <Button 
                                            onClick={confirmPayout} 
                                            isLoading={isSettling}
                                            className="h-12 px-8 bg-hope-green hover:bg-hope-green/90 text-white font-black uppercase tracking-widest text-xs"
                                        >
                                            Confirm & Dispense
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
