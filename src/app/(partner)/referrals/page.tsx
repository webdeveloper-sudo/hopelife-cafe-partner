"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    XCircle
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
    const referrals = [
        { id: "REF-001", name: "Rahul Sharma", email: "rahul@example.com", status: "Confirmed", bill: "₹1,200", comm: "₹90", date: "Oct 24, 2026" },
        { id: "REF-002", name: "Priya Patel", email: "priya@example.com", status: "Pending", bill: "₹3,500", comm: "₹262.5", date: "Oct 24, 2026" },
        { id: "REF-003", name: "Anita Devi", email: "anita@example.com", status: "Confirmed", bill: "₹4,500", comm: "₹337.5", date: "Oct 23, 2026" },
        { id: "REF-004", name: "Kevin Varkey", email: "kevin@example.com", status: "Cancelled", bill: "₹0", comm: "₹0", date: "Oct 23, 2026" },
        { id: "REF-005", name: "Marc Spencer", email: "marc@example.com", status: "Confirmed", bill: "₹8,900", comm: "₹667.5", date: "Oct 22, 2026" },
        { id: "REF-006", name: "Siddharth Rao", email: "sid@example.com", status: "Confirmed", bill: "₹1,500", comm: "₹112.5", date: "Oct 22, 2026" },
        { id: "REF-007", name: "Jessica Alba", email: "jessica@example.com", status: "Pending", bill: "₹12,400", comm: "₹930", date: "Oct 21, 2026" },
    ];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Referral Log</h1>
                    <p className="text-gray-500 mt-1 font-medium">Track and manage your guest registrations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="gap-2 h-11" onClick={() => toast.success("Exporting data...")}>
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Referrals", value: "1,248", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Confirmed", value: "982", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
                    { label: "Pending Review", value: "266", icon: Clock, color: "text-hope-green", bg: "bg-hope-green/5" },
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={item}>
                        <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div variants={item}>
                <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input className="pl-12 h-12 bg-gray-50 border-transparent focus:bg-white" placeholder="Search by name or referral ID..." />
                        </div>
                        <Button variant="secondary" className="gap-2 h-12 px-6">
                            <Filter className="w-4 h-4" /> Filters
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Table */}
            <motion.div variants={item}>
                <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Guest Details</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Bill Value</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Earning</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {referrals.map((row, i) => (
                                        <tr key={i} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-hope-green/10 rounded-full flex items-center justify-center font-bold text-hope-green">
                                                        {row.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-gray-900 text-sm">{row.name}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{row.id} • {row.date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    row.status === "Confirmed" ? "bg-green-100 text-green-700" :
                                                        row.status === "Pending" ? "bg-hope-green/10 text-hope-green" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    {row.status === "Confirmed" && <CheckCircle2 className="w-3 h-3" />}
                                                    {row.status === "Pending" && <Clock className="w-3 h-3" />}
                                                    {row.status === "Cancelled" && <XCircle className="w-3 h-3" />}
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-bold text-gray-600">{row.bill}</td>
                                            <td className="px-8 py-6 text-right font-black text-hope-green text-lg">
                                                {row.comm}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
