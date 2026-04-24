"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Copy,
    CreditCard,
    DollarSign,
    ExternalLink,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    TrendingUp,
    Users,
    Wallet,
    History,
    Zap,
    IndianRupee,
    ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import PerformanceInsights from "@/components/PerformanceInsights";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function PartnerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<"overview" | "guests" | "payouts">("overview");

    const [actionLoading, setActionLoading] = React.useState<string | null>(null);
    const [showRejectDialog, setShowRejectDialog] = React.useState(false);
    const [rejectReason, setRejectReason] = React.useState("");

    const [showSlabsModal, setShowSlabsModal] = React.useState(false);
    const [slabValues, setSlabValues] = React.useState({ commission: 7.5, discount: 7.5 });

    const fetchPartnerDetails = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/partner/${params.id}/details`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            } else {
                toast.error(json.error || "Failed to load partner details");
            }
        } catch (err) {
            toast.error("Network error fetching analytics");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    React.useEffect(() => {
        fetchPartnerDetails();
    }, [fetchPartnerDetails]);

    const handleApprove = async () => {
        setActionLoading("approving");
        try {
            const res = await fetch(`/api/admin/partner/${params.id}/approve`, { method: "PATCH" });
            const json = await res.json();
            if (json.success) {
                toast.success("Partner approved and welcome email sent!");
                fetchPartnerDetails();
            } else {
                toast.error(json.error || "Failed to approve partner");
            }
        } catch (err) {
            toast.error("Network error during approval");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setActionLoading("rejecting");
        try {
            const res = await fetch(`/api/admin/partner/${params.id}/reject`, { 
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: rejectReason })
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Partner application rejected and email sent.");
                setShowRejectDialog(false);
                fetchPartnerDetails();
            } else {
                toast.error(json.error || "Failed to reject partner");
            }
        } catch (err) {
            toast.error("Network error during rejection");
        } finally {
            setActionLoading(null);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const handleUpdateSlabs = async () => {
        setActionLoading("slabs");
        try {
            const res = await fetch(`/api/admin/partner/${params.id}/commission`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commissionSlab: slabValues.commission,
                    guestDiscountSlab: slabValues.discount
                })
            });
            if (res.ok) {
                toast.success("Individual partner slabs updated.");
                setShowSlabsModal(false);
                fetchPartnerDetails();
            }
        } catch (err) {
            toast.error("Failed to update partner architecture.");
        } finally {
            setActionLoading(null);
        }
    };

    React.useEffect(() => {
        if (data && data.partner) {
            setSlabValues({
                commission: data.partner.commissionSlab,
                discount: data.partner.guestDiscountSlab
            });
        }
    }, [data]);

    if (loading) {
        return (
            <div className="space-y-10 p-2">
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-md border border-gray-300" />
                    <Skeleton className="h-10 w-64 rounded-md border border-gray-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-md border border-gray-300" />)}
                </div>
                <Skeleton className="h-[600px] rounded-md border border-gray-300" />
            </div>
        );
    }

    if (!data) return null;

    const { partner, metrics, guestActivity, payoutHistory } = data;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 pb-20">
            {/* Review Action Banner */}
            {partner.status === "PENDING" && (
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-amber-50 border border-gray-300 rounded-md p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-900/5"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-200/50 rounded-md border border-gray-300 flex items-center justify-center text-amber-700">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-amber-900 leading-tight uppercase tracking-tight">Pending Review</h3>
                            <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mt-1">Application submitted on {new Date(partner.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowRejectDialog(true)}
                            className="bg-white border border-gray-300 text-amber-700 hover:bg-amber-100 h-14 px-8 rounded-md font-black uppercase tracking-widest text-xs flex-1 md:flex-none"
                        >
                            Decline
                        </Button>
                        <Button 
                            onClick={handleApprove}
                            isLoading={actionLoading === "approving"}
                            className="bg-amber-600 hover:bg-amber-700 text-white h-14 px-10 rounded-md border border-gray-300 font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-700/20 flex-1 md:flex-none"
                        >
                            Approve Partner
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Nav & Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Directory
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-900 text-white rounded-md border border-gray-300 flex items-center justify-center text-3xl font-black shadow-2xl shadow-gray-900/20">
                            {partner.name ? partner.name[0] : "H"}
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{partner.name || "Untitled Partner"}</h1>
                                <StatusBadge status={partner.status} />
                            </div>
                            <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-hope-green" /> 
                                {partner.partnerCode || "TEMP-CODE"} • {partner.businessType?.replace('_', ' ') || "Retail"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
{/* <Button variant="outline" className="h-12 border-gray-100 font-bold px-6">
                        Export Report
                    </Button> */}
                    <Button 
                        disabled={partner.status === "PENDING"}
                        onClick={() => setShowSlabsModal(true)}
                        className="h-12 bg-hope-green hover:bg-hope-green/90 text-white font-bold px-8 shadow-xl shadow-hope-green/20"
                    >
                        Adjust Slabs
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Referrals Generated", value: metrics.totalReferrals, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Sales Converted", value: metrics.salesConverted, icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Total Business", value: `₹${metrics.totalBusinessVolume}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Earned Commission", value: `₹${metrics.totalEarnedCommission}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((s, i) => (
                    <motion.div key={i} variants={item}>
                        <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/30 rounded-md group hover:-translate-y-1 transition-all">
                            <CardContent className="p-6">
                                <div className={cn("w-12 h-12 rounded-md border border-gray-300 flex items-center justify-center mb-4 transition-transform group-hover:scale-110", s.bg)}>
                                    <s.icon className={cn("w-6 h-6", s.color)} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{s.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile & Financials Column */}
                <div className="space-y-8">
                    {/* Partner Profile */}
                    <motion.div variants={item}>
                        <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/40 rounded-md overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-300 bg-gray-50/30">
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Partner Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Entity Name</p>
                                            <p className="font-bold text-gray-900 mt-1">{partner.name || "-"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Primary Mobile</p>
                                            <p className="font-bold text-gray-900 mt-1">{partner.mobile || "-"}</p>
                                        </div>
                                        {partner.mobile && (
                                            <button onClick={() => copyToClipboard(partner.mobile, "Mobile")} className="text-gray-300 hover:text-gray-900 transition-colors">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Email Address</p>
                                            <p className="font-bold text-gray-900 mt-1 truncate">{partner.email || "-"}</p>
                                        </div>
                                    </div>
                                    {partner.registeredByMarketingRep && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-purple-50 rounded-md border border-purple-200 flex items-center justify-center text-purple-500">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest leading-none">Registered By (Marketing)</p>
                                                <p className="font-bold text-gray-900 mt-1 truncate">{partner.registeredByMarketingRep.name}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4 pt-2">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Operation Base</p>
                                            <p className="font-bold text-gray-900 mt-1 text-sm">{partner.address || "-"}</p>
                                            <p className="text-xs text-gray-500 font-medium">{partner.city || ""} {partner.pincode || ""}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-300 flex items-center justify-between text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Joined {new Date(partner.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button variant="ghost" className="h-8 px-3 rounded-md border border-gray-300 text-[10px] font-black uppercase tracking-widest text-hope-green hover:bg-hope-green/5">
                                        Edit Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Summary */}
                    <motion.div variants={item}>
                        <Card className={cn(
                            "border border-gray-300 text-white shadow-2xl rounded-md overflow-hidden relative",
                            partner.status === "ACTIVE" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black" : "bg-gray-100 text-gray-400"
                        )}>
                            {partner.status === "ACTIVE" && <div className="absolute top-0 right-0 w-32 h-32 bg-hope-green/10 rounded-full blur-3xl -mr-10 -mt-10" />}
                            <CardContent className="p-10 space-y-10">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <Wallet className={cn("w-5 h-5", partner.status === "ACTIVE" ? "text-hope-green" : "text-gray-300")} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Total Settlement Balance</p>
                                        </div>
                                        {partner.status === "ACTIVE" && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Live Sync</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={cn("text-6xl font-black tracking-tighter", partner.status === "ACTIVE" ? "text-white" : "text-gray-300")}>
                                        ₹{metrics.walletTotal?.toLocaleString() || "0.00"}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-6 text-[11px] font-bold uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-md border border-white/5">
                                            <span className="text-gray-500">Bonus Carry:</span>
                                            <span className="text-hope-green">₹{metrics.bonusAmount?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-md border border-white/5">
                                            <span className="text-gray-500">Comm. Earned:</span>
                                            <span className="text-blue-400">₹{metrics.earnedCommission?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className={cn("grid grid-cols-2 gap-4")}>
                                        <div className={cn("p-6 rounded-md border border-gray-300 backdrop-blur-sm", partner.status === "ACTIVE" ? "bg-white/5 border-white/5" : "bg-white")}>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Commission Slab</p>
                                            <p className={cn("text-2xl font-black", partner.status === "ACTIVE" ? "text-hope-green" : "text-gray-400")}>{partner.commissionSlab || "0"}%</p>
                                        </div>
                                        <div className={cn("p-6 rounded-md border border-gray-300 backdrop-blur-sm", partner.status === "ACTIVE" ? "bg-white/5 border-white/5" : "bg-white")}>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Lifetime Payouts</p>
                                            <p className={cn("text-2xl font-black", partner.status === "ACTIVE" ? "text-purple-400" : "text-gray-400")}>₹{metrics.totalPayoutAmount}</p>
                                        </div>
                                    </div>
                                    <div className={cn("flex items-center justify-between p-6 rounded-md border border-gray-300 backdrop-blur-sm", partner.status === "ACTIVE" ? "bg-white/5 border-white/5" : "bg-white")}>
                                        <div className="flex items-center gap-2">
                                            <History className="w-4 h-4 text-gray-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Last Activity Date</span>
                                        </div>
                                        <span className={cn("text-xs font-bold uppercase tracking-widest", partner.status === "ACTIVE" ? "text-gray-300" : "text-gray-400")}>
                                            {metrics.lastActiveDate ? new Date(metrics.lastActiveDate).toLocaleDateString() : "No Activity"}
                                        </span>
                                    </div>
                                </div>

                                <Button 
                                    disabled={partner.status !== "ACTIVE"}
                                    className={cn(
                                        "w-full h-14 rounded-md border border-gray-300 font-black uppercase tracking-widest text-xs shadow-xl",
                                        partner.status === "ACTIVE" ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-200 text-gray-400"
                                    )}
                                >
                                    Process Settlement
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Payout Configuration */}
                    <motion.div variants={item}>
                        <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/30 rounded-md">
                            <CardHeader className="p-8 border-b border-gray-300">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-gray-400" />
                                        Payout Account
                                    </CardTitle>
                                    <StatusBadge status={partner.status === "ACTIVE" ? "ACTIVE" : partner.status} className="h-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-md border border-gray-300">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Direct UPI ID</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-gray-900 text-lg tracking-tight truncate">{partner.upiId || "-"}</p>
                                            <button 
                                                disabled={!partner.upiId}
                                                onClick={() => copyToClipboard(partner.upiId, "UPI ID")} 
                                                className="text-gray-300 hover:text-gray-900"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Settlements are processed exclusively via UPI to the ID above.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-md border border-gray-300 w-fit shadow-inner">
                        <button 
                            onClick={() => setActiveTab("overview")}
                            className={cn(
                                "px-8 h-12 rounded-md border border-gray-300 text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === "overview" ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600 border-transparent"
                            )}
                        >
                            Overview
                        </button>
                        <button 
                            disabled={partner.status === "PENDING"}
                            onClick={() => setActiveTab("guests")}
                            className={cn(
                                "px-8 h-12 rounded-md border border-gray-300 text-xs font-black uppercase tracking-widest transition-all",
                                partner.status === "PENDING" ? "opacity-30 cursor-not-allowed" : "",
                                activeTab === "guests" ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600 border-transparent"
                            )}
                        >
                            Guest Network <span className="ml-2 py-0.5 px-2 bg-gray-100 rounded-md border border-gray-300 text-[10px]">{guestActivity?.length || 0}</span>
                        </button>
                        <button 
                            disabled={partner.status === "PENDING"}
                            onClick={() => setActiveTab("payouts")}
                            className={cn(
                                "px-8 h-12 rounded-md border border-gray-300 text-xs font-black uppercase tracking-widest transition-all",
                                partner.status === "PENDING" ? "opacity-30 cursor-not-allowed" : "",
                                activeTab === "payouts" ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600 border-transparent"
                            )}
                        >
                            Payout Logs
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/40 rounded-md overflow-hidden">
                                    <CardHeader className="p-10 border-b border-gray-300 flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-black uppercase tracking-tight">Recent Activity Momentum</CardTitle>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Growth trends for this partner</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-md border border-gray-300 text-blue-600">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">+12% vs last Week</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 h-[450px]">
                                        {partner.status === "PENDING" ? (
                                            <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md border border-gray-300 border-dashed text-center p-8">
                                                <History className="w-10 h-10 text-gray-200 mb-4" />
                                                <p className="font-black uppercase tracking-widest text-xs text-gray-400">Waiting for first scan</p>
                                                <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase tracking-widest">Analytics will activate after partner is approved</p>
                                            </div>
                                        ) : (
                                            <PerformanceInsights data={data.weeklyPerformance || []} />
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/30 rounded-md p-8 flex items-center gap-6 group hover:border-hope-green transition-all">
                                        <div className="w-16 h-16 rounded-md border border-gray-300 bg-hope-green/10 flex items-center justify-center shrink-0">
                                            <Users className="w-8 h-8 text-hope-green" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Ticket Value</p>
                                            <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{(metrics.totalBusinessVolume / (metrics.salesConverted || 1)).toFixed(0)}</p>
                                        </div>
                                    </Card>
                                    <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/30 rounded-md p-8 flex items-center gap-6 group hover:border-blue-500 transition-all">
                                        <div className="w-16 h-16 rounded-md border border-gray-300 bg-blue-50 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trust Score</p>
                                            <p className="text-3xl font-black text-gray-900 tracking-tighter">9.8/10</p>
                                        </div>
                                    </Card>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "guests" && (
                            <motion.div
                                key="guests"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/40 rounded-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest Name</th>
                                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Visits</th>
                                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Spends</th>
                                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Last Visit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {!guestActivity || guestActivity.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">No guests registered yet</td>
                                                    </tr>
                                                ) : (
                                                    guestActivity.map((guest: any) => (
                                                        <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-10 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 font-bold">
                                                                        {guest.name ? guest.name[0] : "G"}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-gray-900">{guest.name || "Unknown guest"}</p>
                                                                        <p className="text-[10px] text-gray-400 font-black tracking-widest">+91 {guest.mobile}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-6 text-center">
                                                                <span className="px-3 py-1 bg-gray-100 rounded-md border border-gray-300 text-[10px] font-black text-gray-600">
                                                                    {guest.scanCount} {guest.scanCount === 1 ? 'Visit' : 'Visits'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-6 text-right font-black text-gray-900">
                                                                ₹{guest.totalBill ? guest.totalBill.toFixed(2) : "0.00"}
                                                            </td>
                                                            <td className="px-10 py-6 text-right text-xs text-gray-400 font-medium">
                                                                {guest.joinDate ? new Date(guest.joinDate).toLocaleDateString() : "-"}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "payouts" && (
                            <motion.div
                                key="payouts"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/40 rounded-md overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {!payoutHistory || payoutHistory.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">No payout history found</td>
                                                    </tr>
                                                ) : (
                                                    payoutHistory.map((payout: any) => (
                                                        <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-10 py-6 font-black text-xs text-gray-900 tracking-tight">
                                                                #{payout.id.slice(0, 8).toUpperCase()}
                                                            </td>
                                                            <td className="px-6 py-6">
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{payout.method?.replace('_', ' ') || "-"}</p>
                                                                <p className="text-[10px] text-gray-300 font-medium mt-0.5">{new Date(payout.createdAt).toLocaleDateString()}</p>
                                                            </td>
                                                            <td className="px-6 py-6 text-center">
                                                                <span className="px-3 py-1 bg-green-50 text-green-700 border border-gray-300 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                                    {payout.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-10 py-6 text-right font-black text-xl tracking-tighter text-gray-900">
                                                                ₹{payout.amount ? payout.amount.toLocaleString() : "0"}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Rejection Reason Modal */}
            <AnimatePresence>
                {showRejectDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !actionLoading && setShowRejectDialog(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-md border border-gray-300 shadow-2xl overflow-hidden p-10"
                        >
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-14 h-14 bg-red-50 rounded-md border border-gray-300 flex items-center justify-center text-red-600">
                                    <AlertCircle className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Reject Application</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Provide feedback to the partner</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Reason for rejection</label>
                                    <textarea 
                                        rows={4}
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="e.g. Incomplete business details or unsupported region..."
                                        className="w-full bg-gray-50 rounded-md border border-gray-300 p-6 font-bold text-gray-900 focus:border-red-500/10 focus:outline-none transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 italic px-2">This reason will be sent to the partner via email.</p>
                                </div>

                                <div className="flex gap-4">
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setShowRejectDialog(false)} 
                                        className="flex-1 h-14 rounded-md border border-gray-300 font-black uppercase tracking-widest text-[10px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        isLoading={actionLoading === "rejecting"}
                                        className="flex-1 h-14 rounded-md border border-gray-300 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/20"
                                    >
                                        Confirm Rejection
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Adjust Slabs Modal */}
            {showSlabsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        onClick={() => setShowSlabsModal(false)}
                        className="absolute inset-0 bg-gray-950/40 backdrop-blur-md" 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-md bg-white rounded-md border border-gray-300 shadow-2xl p-10"
                    >
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-hope-green" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Partner Architecture</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Override Global Defaults</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Partner Commission</label>
                                    <span className="text-xl font-black text-hope-green">{slabValues.commission}%</span>
                                </div>
                                <input 
                                    type="range" min="1" max="40" step="0.5"
                                    value={slabValues.commission}
                                    onChange={(e) => setSlabValues(v => ({ ...v, commission: parseFloat(e.target.value) }))}
                                    className="w-full accent-hope-green"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Guest Referral Discount</label>
                                    <span className="text-xl font-black text-blue-500">{slabValues.discount}%</span>
                                </div>
                                <input 
                                    type="range" min="1" max="40" step="0.5"
                                    value={slabValues.discount}
                                    onChange={(e) => setSlabValues(v => ({ ...v, discount: parseFloat(e.target.value) }))}
                                    className="w-full accent-blue-500"
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <Button variant="ghost" className="flex-1 h-14 rounded-md border border-gray-300 font-black uppercase tracking-widest text-[10px]" onClick={() => setShowSlabsModal(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleUpdateSlabs}
                                    isLoading={actionLoading === "slabs"}
                                    className="flex-1 h-14 bg-gray-900 text-white rounded-md border border-gray-300 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-gray-900/20"
                                >
                                    Apply Overrides
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}
