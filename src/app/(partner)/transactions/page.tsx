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
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/partner/stats");
                const json = await res.json();
                if (json.success) setData(json);
            } catch {
                toast.error("Failed to load earning records.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return (
            <div className="space-y-8 p-4">
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-4">
                        <div className="h-8 w-64 bg-gray-100 animate-pulse rounded-md" />
                        <div className="h-4 w-48 bg-gray-50 animate-pulse rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-32 bg-gray-50 animate-pulse rounded-md" />
                    <div className="h-32 bg-gray-50 animate-pulse rounded-md" />
                </div>
                <div className="h-96 bg-gray-50 animate-pulse rounded-md" />
            </div>
        );
    }

    const { metrics, receivingHistory } = data;

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Earning Transparency</h1>
                    <p className="text-gray-500 mt-1 font-medium">Full audit logs of all wallet credit events and milestone bonuses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="gap-2 h-11 px-6 rounded-md border border-gray-300 shadow-sm" onClick={() => toast.success("Earning statement compiled successfully.")}>
                        <Download className="w-4 h-4" /> Download Statement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-14 h-14 bg-green-50 rounded-md border border-gray-300 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Available</p>
                            <p className="text-3xl font-black text-gray-900">₹{metrics.availableBalance?.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-md border border-gray-300 flex items-center justify-center">
                            <ArrowUpRight className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Earned Commission</p>
                            <p className="text-3xl font-black text-gray-900">₹{metrics.totalCommission?.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-14 h-14 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-hope-green" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Bonus</p>
                            <p className="text-3xl font-black text-gray-900">₹{metrics.welcomeBonus?.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <motion.div variants={item}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-hope-green rounded-full" />
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Amount Receiving History</h2>
                </div>
                <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden rounded-md transition-all">
                    <CardHeader className="p-8 border-b border-gray-300 bg-gray-50/10">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input className="pl-14 h-14 border border-gray-300 focus:bg-white bg-gray-50/50 rounded-md text-sm font-medium" placeholder="Search rewards or commissions..." />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Transaction Log</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest">Type</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Earning</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                    {receivingHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center font-black text-xs text-gray-300 uppercase tracking-widest">
                                                No credits recorded in your history yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        receivingHistory.map((txn: any, i: number) => (
                                            <tr key={i} className="group hover:bg-gray-50 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-gray-900 rounded-md border border-gray-300 flex items-center justify-center font-bold text-white text-[10px] shadow-lg">
                                                            LOG
                                                        </div>
                                                        <div>
                                                            <h4 className="font-extrabold text-gray-900 text-sm tracking-tight">{txn.type}</h4>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{txn.id} • {txn.date}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border border-gray-300 shadow-sm",
                                                        txn.type.includes("Bonus") ? "bg-amber-50 text-amber-700" : 
                                                        txn.type.includes("Reward") ? "bg-purple-50 text-purple-700" :
                                                        "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {txn.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-300 text-[10px] font-black uppercase tracking-widest",
                                                        txn.status === "Settled" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-800 shadow-pulse"
                                                    )}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-hope-green text-xl tracking-tighter">
                                                    +₹{txn.amount.toFixed(2)}
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
        </motion.div>
    );
}
