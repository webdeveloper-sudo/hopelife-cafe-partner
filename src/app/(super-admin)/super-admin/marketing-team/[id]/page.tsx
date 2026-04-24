"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Building2,
    Calendar,
    ChevronRight,
    CreditCard,
    ExternalLink,
    Mail,
    Phone,
    ShieldCheck,
    TrendingUp,
    Users,
    UserPlus,
    Clock,
    UserCheck,
    Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import PerformanceInsights from "@/components/PerformanceInsights";

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

export default function MarketingRepDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "partners">("overview");

    const fetchDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/marketing-rep/${params.id}/details`);
            const json = await res.json();
            if (json.success) {
                setData(json);
            } else {
                toast.error(json.error || "Failed to load marketing rep details");
            }
        } catch (err) {
            toast.error("Network error fetching details");
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    if (loading) {
        return (
            <div className="space-y-10 p-2">
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-10 w-10 rounded-md border border-gray-300" />
                    <Skeleton className="h-10 w-64 rounded-md border border-gray-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-md border border-gray-300" />)}
                </div>
                <Skeleton className="h-[600px] rounded-md border border-gray-300" />
            </div>
        );
    }

    if (!data) return null;

    const { rep, metrics, partners, weeklyProgress, monthlyProgress } = data;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Team
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-600 text-white rounded-md border border-gray-300 flex items-center justify-center text-3xl font-black shadow-2xl shadow-amber-600/20">
                            {rep.name[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{rep.name}</h1>
                                <StatusBadge status={rep.status} />
                            </div>
                            <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-amber-600" /> 
                                Marketing Representative
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Partners Onboarded", value: metrics.totalPartners, icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Onboarded This Month", value: metrics.partnersThisMonth, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Onboarded This Week", value: metrics.partnersThisWeek, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
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
                {/* Profile Column */}
                <div className="space-y-8">
                    <motion.div variants={item}>
                        <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/40 rounded-md overflow-hidden">
                            <CardHeader className="p-8 border-b border-gray-300 bg-gray-50/30">
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Representative Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Full Name</p>
                                            <p className="font-bold text-gray-900 mt-1">{rep.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Email Address</p>
                                            <p className="font-bold text-gray-900 mt-1 truncate">{rep.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-md border border-gray-300 flex items-center justify-center text-gray-400">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Mobile Number</p>
                                            <p className="font-bold text-gray-900 mt-1">+91 {rep.mobile}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-300 flex items-center justify-between text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Joined {new Date(rep.createdAt).toLocaleDateString()}</p>
                                    </div>
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
                            onClick={() => setActiveTab("partners")}
                            className={cn(
                                "px-8 h-12 rounded-md border border-gray-300 text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === "partners" ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600 border-transparent"
                            )}
                        >
                            Onboarded Partners <span className="ml-2 py-0.5 px-2 bg-gray-100 rounded-md border border-gray-300 text-[10px]">{partners.length}</span>
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
                                            <CardTitle className="text-2xl font-black uppercase tracking-tight">Onboarding Momentum</CardTitle>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Weekly progress of new partners</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 h-[450px]">
                                        <PerformanceInsights data={weeklyProgress.map((p: any) => ({ name: p.name, referrals: p.count, revenue: 0 }))} />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "partners" && (
                            <motion.div
                                key="partners"
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
                                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Name</th>
                                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Onboarding Date</th>
                                                    <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {partners.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={4} className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">No partners onboarded yet</td>
                                                    </tr>
                                                ) : (
                                                    partners.map((partner: any) => (
                                                        <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-10 py-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center text-gray-500 font-bold">
                                                                        {partner.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <button 
                                                                            onClick={() => router.push(`/super-admin/partners/${partner.id}`)}
                                                                            className="font-bold text-gray-900 hover:text-amber-600 transition-colors text-left"
                                                                        >
                                                                            {partner.name}
                                                                        </button>
                                                                        <p className="text-[10px] text-gray-400 font-black tracking-widest">{partner.partnerCode}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-6 text-center">
                                                                <StatusBadge status={partner.status} />
                                                            </td>
                                                            <td className="px-10 py-6 text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                                        {new Date(partner.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight mt-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {new Date(partner.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-6 text-right">
                                                                <button 
                                                                    onClick={() => router.push(`/super-admin/partners/${partner.id}`)}
                                                                    className="p-2 bg-white border border-gray-300 rounded-md text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all shadow-sm"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </button>
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
        </motion.div>
    );
}
