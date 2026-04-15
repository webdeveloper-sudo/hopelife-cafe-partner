"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    Clock,
    BarChart3,
    Target,
    ShieldCheck,
    Zap,
    CheckCircle2,
    XCircle,
    Settings
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import PerformanceInsights from "@/components/PerformanceInsights";
import GlobalSearch from "@/components/GlobalSearch";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
};

export default function AdminDashboard() {
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<any>(null);
    const [showLogs, setShowLogs] = React.useState(false);
    const [systemLogs, setSystemLogs] = React.useState<any[]>([]);
    const [logsLoading, setLogsLoading] = React.useState(false);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const json = await res.json();
            if (json.success) {
                setData(json);
            }
        } catch (err) {
            toast.error("Failed to load system stats.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const res = await fetch("/api/admin/logs");
            const json = await res.json();
            if (json.success) {
                setSystemLogs(json.logs);
            }
        } catch (err) {
            toast.error("Failed to fetch system activity.");
        } finally {
            setLogsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    React.useEffect(() => {
        if (showLogs) fetchLogs();
    }, [showLogs]);

    const runPayouts = async () => {
        toast.promise(
            fetch("/api/admin/payouts/run", { method: "POST" })
                .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Payout failed");
                    fetchStats(); // Refresh dashboard
                    return data;
                }),
            {
                loading: 'Processing batch settlement...',
                success: (data) => data.message || 'Batch Settlement Complete',
                error: (err) => err.message || 'Error processing settlement'
            }
        );
    };

    const updatePartnerStatus = async (id: string, status: "ACTIVE" | "REJECTED") => {
        try {
            const res = await fetch(`/api/admin/partner/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchStats();
            } else {
                toast.error(data.error || "Update failed");
            }
        } catch (err) {
            toast.error("Network error updating status");
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center mb-10">
                    <Skeleton className="h-12 w-80 bg-gray-100" />
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-40 bg-gray-100 rounded-2xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[2rem] bg-gray-100" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[500px] rounded-[2rem] bg-gray-100" />
                    <Skeleton className="h-[500px] rounded-[2rem] bg-gray-100" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Failed to load Dashboard</h2>
                <p className="text-gray-500 max-w-sm">There was an error connecting to the management console. Please try refreshing the page.</p>
                <Button variant="primary" onClick={() => fetchStats()}>
                    Retry Connection
                </Button>
            </div>
        );
    }

    const { stats, recentApprovals } = data;

    const metrics = [
        { label: "Active Partners", value: stats.totalPartners, icon: Users, color: "text-gray-500" },
        { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-hope-green", highlight: parseInt(stats.pendingApprovals) > 0 },
        { label: "Monthly Revenue", value: stats.monthlyRevenue, icon: BarChart3, color: "text-green-500" },
        { label: "Avg Commission", value: stats.avgCommission, icon: Target, color: "text-gray-500" },
    ];

    return (
        <>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-10"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-4">
                            <ShieldCheck className="text-hope-green w-10 h-10" />
                            Management Hub
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Enterprise oversight for the HOPE Cafe Referral Network.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-gray-600 border border-gray-100 hover:bg-gray-50 h-11 px-6 rounded-2xl"
                            onClick={() => setShowLogs(true)}
                        >
                            <Settings className="w-4 h-4 mr-2" /> System Logs
                        </Button>
                        <Button
                            className="flex items-center justify-center gap-2.5 shadow-hope-green/20 h-11 px-8 rounded-2xl bg-hope-green hover:bg-hope-green/90 border-none"
                            aria-label="Process batch settlement for partners"
                            onClick={() => {
                                if (confirm("Proceed with batch settlement for all eligible partners?")) {
                                    runPayouts();
                                }
                            }}
                        >
                            <Zap className="w-4 h-4 shrink-0" /> <span className="translate-y-[0.5px]">Batch Settlement</span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                    {metrics.map((s: any, idx: number) => (
                        <motion.div key={idx} variants={item} className="h-full">
                            <Card className={cn(
                                "h-full border-none glass-card hover:-translate-y-2 cursor-pointer group",
                                s.highlight && "ring-2 ring-hope-purple/20"
                            )}>
                                <CardContent className="p-8 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                                            idx === 2 ? "bg-green-50" : "bg-gray-50")}>
                                            <s.icon className={cn("w-7 h-7 shrink-0", s.color)} />
                                        </div>
                                        {s.highlight && <span className="text-[10px] font-black text-hope-green uppercase tracking-[1px] bg-hope-green/10 px-3 py-1 rounded-full animate-pulse">Action Required</span>}
                                    </div>
                                    <div className="mt-auto">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest min-h-[20px]">{s.label}</h3>
                                        <p className="text-4xl font-extrabold text-gray-900 mt-2">{s.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* AI Performance Insights Section */}
                <motion.div variants={item}>
                    <PerformanceInsights />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Partner Approvals */}
                    <motion.div variants={item} className="lg:col-span-2">
                        <Card className="glass border-none rounded-[2.5rem]">
                            <CardHeader className="flex flex-row items-center justify-between p-10 pb-4">
                                <CardTitle className="text-2xl font-black text-gray-900 uppercase tracking-tight">Partner Approvals</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-hope-green hover:bg-hope-green/10 font-black uppercase tracking-widest text-[11px] h-9 px-4 rounded-xl"
                                    aria-label="View pending partner approval queue"
                                    onClick={() => toast.info("Partner Directory contains full audit details.")}
                                >
                                    View Directory
                                </Button>
                            </CardHeader>
                            <CardContent className="px-10 pb-10">
                                <div className="space-y-4">
                                    {recentApprovals.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                                            <ShieldCheck className="w-16 h-16 opacity-10 mb-6" />
                                            <p className="font-black uppercase tracking-widest text-xs">No pending approvals</p>
                                        </div>
                                    ) : (
                                        recentApprovals.map((partner: any, i: number) => (
                                            <motion.div
                                                key={partner.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 group hover:border-hope-purple/30 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-hope-green text-2xl border border-gray-50 transition-transform group-hover:scale-110">
                                                        {partner.name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-extrabold text-gray-900 text-lg">{partner.name}</h4>
                                                            <StatusBadge status="PENDING" className="h-5" />
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-500 mt-0.5">{partner.category} • Joined {partner.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        size="icon"
                                                        className="bg-hope-green shadow-lg shadow-hope-green/30 text-white rounded-2xl hover:bg-hope-green/90 border-none w-12 h-12 transition-transform hover:scale-110 active:scale-95"
                                                        onClick={() => updatePartnerStatus(partner.id, "ACTIVE")}
                                                        aria-label="Approve Partner"
                                                    >
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        className="bg-white text-gray-400 rounded-2xl border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200 w-12 h-12 transition-all"
                                                        onClick={() => updatePartnerStatus(partner.id, "REJECTED")}
                                                        aria-label="Decline Partner"
                                                    >
                                                        <XCircle className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Slab */}
                    <motion.div variants={item} className="space-y-6">
                        <Card className="bg-white border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Active Slabs</CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 space-y-4">
                                <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Standard Rate</span>
                                    <span className="text-2xl font-black text-hope-green">7.5%</span>
                                </div>
                                <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Welcome Bonus</span>
                                    <span className="text-xl font-black text-gray-900">₹500</span>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full mt-4 border-gray-100 text-gray-600 hover:bg-gray-50 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]"
                                    onClick={() => toast.info("Opening commission policy editor...")}
                                >
                                    Adjust Policy
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-hope-green border-none shadow-xl shadow-hope-green/20 rounded-[2.5rem] overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <CardContent className="p-10 text-center relative z-10">
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Owed</p>
                                <p className="text-5xl font-black text-white mb-8 drop-shadow-lg">{stats.totalOwed}</p>
                                <Button
                                    className="w-full bg-white text-hope-green hover:bg-white/90 border-none shadow-xl shadow-black/10 h-14 text-sm font-black uppercase tracking-widest rounded-2xl"
                                    onClick={() => {
                                        if (confirm("Send payout processing requests to all partners?")) {
                                            runPayouts();
                                        }
                                    }}
                                >
                                    Run Payouts
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>

            {/* System Logs Modal/Panel */}
            {showLogs && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLogs(false)}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col"
                    >
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">System Activity</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">Network Audit Feed</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowLogs(false)} className="rounded-xl">
                                <XCircle className="w-6 h-6 text-gray-300" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8">
                            {logsLoading ? (
                                <div className="space-y-6">
                                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-gray-50" />)}
                                </div>
                            ) : systemLogs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                    <BarChart3 className="w-16 h-16 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">No recent activity detected</p>
                                </div>
                            ) : (
                                systemLogs.map((log: any, i: number) => (
                                    <div key={log.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-32px] before:w-[2px] before:bg-gray-100 last:before:hidden">
                                        <div className={cn(
                                            "absolute left-0 top-1 w-[24px] h-[24px] rounded-full flex items-center justify-center z-10",
                                            log.type === "TRANSACTION" ? "bg-green-100 text-green-600" :
                                                log.type === "PARTNER" ? "bg-hope-purple/10 text-hope-purple" :
                                                    "bg-purple-100 text-purple-600"
                                        )}>
                                            <div className="w-2 h-2 rounded-full bg-current" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-gray-900 text-sm whitespace-nowrap">{log.title}</h4>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap ml-4">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{log.description}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}



