"use client";

import React from "react";
import { motion } from "framer-motion";
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
    ArrowDownRight,
    Search as SearchIcon
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

export default function AdminPayoutsPage() {
    const payouts = [
        { id: "PAY-4512", partner: "Sea Side Rentals", amount: "₹42,500", date: "Oct 24, 2026", method: "IMPS / Axis", status: "Processed" },
        { id: "PAY-4511", partner: "Grand Continental", amount: "₹1,12,800", date: "Oct 24, 2026", method: "NEFT / HDFC", status: "Pending" },
        { id: "PAY-4510", partner: "Pondy Guides", amount: "₹8,900", date: "Oct 23, 2026", method: "UPI", status: "Processed" },
        { id: "PAY-4509", partner: "Olive Garden", amount: "₹15,400", date: "Oct 23, 2026", method: "IMPS / Axis", status: "Processed" },
        { id: "PAY-4508", partner: "Paradise Tours", amount: "₹4,200", date: "Oct 22, 2026", method: "UPI", status: "Flagged" },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Partner Payouts</h1>
                    <p className="text-gray-500 mt-1 font-medium">Audit and authorize weekly commission settlements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 h-11" onClick={() => toast.success("Settlement report ready for download.")}>
                        <Download className="w-4 h-4" /> Download Statement
                    </Button>
                    <Button className="gap-2 h-11 bg-hope-green hover:bg-purple-700 text-white px-6">
                        <TrendingUp className="w-4 h-4" /> Batch Settlement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item}>
                    <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 bg-hope-green/10 rounded-2xl flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-hope-green" />
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                                    <ArrowUpRight className="w-3 h-3" /> 14% Inc
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Total Payouts (MTD)</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">₹12.84L</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Due in 2 days</span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Pending Approval</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">₹2.45L</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                                <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                                    <ArrowDownRight className="w-3 h-3" /> 2% Dec
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Avg Settlement Time</p>
                            <p className="text-3xl font-black text-gray-900 mt-2">14.2 Hrs</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={item}>
                <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/20">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input className="pl-12 h-12 border-transparent focus:bg-white bg-white shadow-sm rounded-2xl" placeholder="Search by payment ID, partner name or date..." />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button variant="secondary" className="gap-2 h-12 px-6 flex-1 md:flex-none bg-white border border-gray-100 rounded-2xl font-bold">
                                    <Filter className="w-4 h-4" /> Filters
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Transaction / ID</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Settlement Method</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Amount</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Audit Log</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payouts.map((pay, i) => (
                                        <tr key={i} className="group hover:bg-gray-50/80 transition-all cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-sm">{pay.partner}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{pay.id} • {pay.date}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <CreditCard className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{pay.method}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                                    pay.status === "Processed" ? "bg-green-100 text-green-700" :
                                                        pay.status === "Pending" ? "bg-blue-100 text-blue-700" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    {pay.status === "Processed" && <CheckCircle2 className="w-3 h-3" />}
                                                    {pay.status === "Pending" && <Clock className="w-3 h-3" />}
                                                    {pay.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-gray-900 text-lg">
                                                {pay.amount}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button variant="ghost" className="text-xs font-black text-gray-400 hover:text-hope-green uppercase tracking-widest h-8 px-3 rounded-xl gap-2">
                                                    View Receipt <ArrowUpRight className="w-3 h-3" />
                                                </Button>
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
