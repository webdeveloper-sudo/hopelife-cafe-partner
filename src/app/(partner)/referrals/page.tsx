"use client";

import React, { useEffect, useState } from "react";
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
    Loader2
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
    const [loading, setLoading] = useState(true);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    
    // New Guest Form State
    const [newName, setNewName] = useState("");
    const [newMobile, setNewMobile] = useState("");
    const [submitting, setSubmitting] = useState(false);

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
        fetchReferrals();
    }, []);

    const handleAddGuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMobile.length !== 10 || !newName.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/guest/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    mobile: newMobile,
                    partnerId: "session" // API now derives from session
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Guest referral generated! Pass sent to ${newMobile}`);
                setIsAdding(false);
                setNewName("");
                setNewMobile("");
                fetchReferrals();
            } else {
                toast.error(data.error || "Failed to add guest.");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

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
                        onClick={() => setIsAdding(true)}
                        className="gap-2 h-11 px-6 bg-hope-green hover:bg-hope-green/90 shadow-lg shadow-hope-green/10 border-none"
                    >
                        <UserPlus className="w-4 h-4" /> Refer Guest
                    </Button>
                    <Button variant="secondary" className="gap-2 h-11" onClick={() => toast.success("Exporting report...")}>
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
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

            {/* Add Guest Modal Overlay */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-md border border-gray-300 shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Direct Referral</h2>
                                        <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Onboard a guest immediately</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200">
                                        <XCircle className="w-6 h-6 text-gray-400" />
                                    </Button>
                                </div>

                                <form onSubmit={handleAddGuest} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Guest Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-300" />
                                            </div>
                                            <Input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="block w-full pl-14 h-16 bg-gray-50 border border-gray-300 rounded-md text-lg font-bold text-gray-900 focus:ring-2 focus:ring-hope-green shadow-inner"
                                                placeholder="e.g. Johnathan Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">WhatsApp Mobile Number</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <Smartphone className="h-5 w-5 text-gray-300" />
                                            </div>
                                            <Input
                                                type="tel"
                                                maxLength={10}
                                                value={newMobile}
                                                onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                                                className="block w-full pl-14 h-16 bg-gray-50 border border-gray-300 rounded-md text-lg font-bold text-gray-900 tracking-[0.1em] focus:ring-2 focus:ring-hope-green shadow-inner"
                                                placeholder="99999 99999"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={newMobile.length !== 10 || !newName.trim() || submitting}
                                            className="w-full h-16 text-lg bg-hope-green hover:bg-hope-green/90 shadow-xl shadow-hope-green/20 border border-gray-300 rounded-md font-black uppercase tracking-widest gap-3"
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <>Generate Live Pass <ArrowRight className="w-5 h-5" /></>
                                            )}
                                        </Button>
                                    </div>
                                    
                                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        Valid for 24 hours • One-time use discount
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
