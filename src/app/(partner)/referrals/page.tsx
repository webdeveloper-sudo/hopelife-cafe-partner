"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    UserPlus,
    Smartphone,
    User,
    ArrowRight,
    Loader2,
    Copy,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ReferralsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [partnerCode, setPartnerCode] = useState("");

    const fetchReferrals = async () => {
        try {
            const res = await fetch("/api/partner/guests");
            const data = await res.json();
            if (data.success) {
                setReferrals(data.guests);
            }
        } catch (err) {
            toast.error("Failed to load referral data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionRaw = sessionStorage.getItem("hopecafe_partner_session");
        if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session.partnerCode) setPartnerCode(session.partnerCode);
        }
        fetchReferrals();
    }, []);


    const filteredReferrals = referrals.filter(r => 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.mobile.includes(search)
    );

    const stats = [
        { label: "Total Active Referrals", value: referrals.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Settled Visits", value: referrals.filter(r => r.referralCount > 0).length, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
        { label: "High Frequency Guests", value: referrals.filter(r => r.referralCount >= 3).length, icon: Clock, color: "text-hope-green", bg: "bg-hope-green/5" },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Referral Intelligence</h1>
                    <p className="text-gray-500 mt-1 font-medium">Monitor your real-time guest registrations and visit frequency.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => router.push(`/p/${partnerCode}`)}
                        className="gap-2 h-11 px-6 bg-hope-green hover:bg-hope-green/90 shadow-lg shadow-hope-green/10 border-none"
                    >
                        <UserPlus className="w-4 h-4" /> Refer Guest
                    </Button>
{/* <Button variant="secondary" className="gap-2 h-11" onClick={() => toast.success("Exporting report...")}>
                        <Download className="w-4 h-4" /> Export Report
                    </Button> */}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div key={idx} variants={item}>
                        <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/40 hover:-translate-y-1 transition-transform cursor-default group rounded-md">
                            <CardContent className="p-8 flex items-center gap-6">
                                <div className={cn("w-16 h-16 rounded-md border border-gray-300 flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                                    <stat.icon className={cn("w-8 h-8", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-gray-900">{loading ? "..." : stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div variants={item}>
                <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/30 rounded-md">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                className="pl-14 h-14 bg-gray-50/50 border border-gray-300 rounded-md focus:bg-white text-base font-medium" 
                                placeholder="Search by name or mobile number..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" className="gap-2 h-14 px-8 rounded-md border border-gray-300">
                            <Filter className="w-4 h-4" /> Filters
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Table */}
            <motion.div variants={item}>
                <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden rounded-md">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-300">
                                        <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Guest Profile</th>
                                        <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">Referral Time/Date</th>
                                        <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">Visit Frequency</th>
                                        <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-right">Last Visit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                    {loading ? (
                                        [1,2,3].map(i => (
                                            <tr key={i}>
                                                <td colSpan={4} className="px-10 py-8 animate-pulse bg-gray-50/20" />
                                            </tr>
                                        ))
                                    ) : filteredReferrals.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-20 text-center">
                                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No referrals found matching your criteria</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReferrals.map((row, i) => (
                                            <tr key={i} className="group hover:bg-gray-50/40 transition-all">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center font-black text-hope-green text-xl transition-transform group-hover:scale-110">
                                                            {row.name[0]}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 text-lg">{row.name}</h4>
                                                            <p className="text-xs font-bold text-gray-400 tracking-widest mt-0.5">+91 {row.mobile.slice(0, 5)} {row.mobile.slice(5)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md border border-gray-300 text-xs font-bold text-gray-600">
                                                        <Clock className="w-3 h-3" /> {row.date}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className={cn(
                                                            "text-2xl font-black mb-0.5",
                                                            row.referralCount >= 3 ? "text-hope-green" : "text-gray-900"
                                                        )}>
                                                            {row.referralCount}
                                                        </span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Visits</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <p className="text-sm font-bold text-gray-600">{row.lastVisit}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Settled at Cashier</p>
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

            {/* Modal removed as per requirement */}
        </motion.div>
    );
}
