"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ArrowLeftRight,
    Search,
    Filter,
    Download,
    CheckCircle2,
    Calendar,
    ArrowUpRight,
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

export default function PartnerTransactionsPage() {
    const transactions = [
        { id: "TXN-7731", guest: "Rahul Sharma", amount: "₹1,200", comm: "₹90.00", date: "Oct 24, 2026", type: "Referral Commission", status: "Settled" },
        { id: "TXN-7730", guest: "Priya Patel", amount: "₹3,500", comm: "₹262.50", date: "Oct 24, 2026", type: "Referral Commission", status: "Pending" },
        { id: "TXN-7729", guest: "Anita Devi", amount: "₹4,500", comm: "₹337.50", date: "Oct 23, 2026", type: "Referral Commission", status: "Settled" },
        { id: "TXN-7728", guest: "System", amount: "₹500", comm: "₹500.00", date: "Oct 23, 2026", type: "Welcome Bonus", status: "Settled" },
        { id: "TXN-7727", guest: "Marc Spencer", amount: "₹8,900", comm: "₹667.50", date: "Oct 22, 2026", type: "Referral Commission", status: "Settled" },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Earning History</h1>
                    <p className="text-gray-500 mt-1 font-medium">Audit all commissions and bonus payouts in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="gap-2 h-11 px-6 rounded-2xl" onClick={() => toast.success("Detailed earning statement downloaded.")}>
                        <Download className="w-4 h-4" /> Download Statement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Settled</p>
                            <p className="text-3xl font-black text-gray-900">₹42,840.50</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-14 h-14 bg-hope-green/10 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-hope-green" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Projected (This Week)</p>
                            <p className="text-3xl font-black text-gray-900">₹8,450.00</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <motion.div variants={item}>
                <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="p-8 border-b border-gray-50 bg-gray-50/10">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input className="pl-14 h-14 border-transparent focus:bg-white bg-gray-50/50 rounded-3xl text-sm" placeholder="Search by Guest Name, Transaction ID..." />
                            </div>
                            <Button variant="secondary" className="gap-2 h-14 px-8 rounded-3xl bg-white border border-gray-100 font-bold shrink-0">
                                <Filter className="w-4 h-4" /> Filters
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/30">
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Transaction Log</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Type</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Earning</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((txn, i) => (
                                        <tr key={i} className="group hover:bg-gray-50 transition-all cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-950 rounded-2xl flex items-center justify-center font-bold text-white text-xs">
                                                        TX
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-gray-900 text-sm">{txn.guest}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{txn.id} • {txn.date}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-lg">
                                                    {txn.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                                                    txn.status === "Settled" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-800"
                                                )}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-hope-green text-lg">
                                                {txn.comm}
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
