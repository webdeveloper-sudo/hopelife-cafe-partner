"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, IndianRupee, TrendingUp, Building2, ArrowUpRight, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";



export default function MarketingDashboardPage() {
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/marketing/stats");
                const json = await res.json();
                if (json.success) {
                    setData(json);
                }
            } catch (err) {
                toast.error("Failed to load executive stats.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const copyLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/p/${id}`);
        toast.success("Guest registration link copied to clipboard!");
    };

    if (loading || !data) {
        return (
            <div className="space-y-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-40 rounded-[2rem]" />
                    <Skeleton className="h-40 rounded-[2rem]" />
                    <Skeleton className="h-40 md:col-span-2 rounded-[2rem]" />
                </div>
                <Skeleton className="h-[400px] rounded-[2rem]" />
            </div>
        );
    }

    const { metrics, managedPartners } = data;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 font-medium mt-2">Track your partner onboardings and generated revenue.</p>
                </div>
                <Link href="/marketing/onboard">
                    <Button className="h-12 bg-hope-purple hover:bg-purple-700 shadow-lg shadow-hope-purple/20 px-6">
                        + Onboard New Partner
                    </Button>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
                    <Card className="h-full border-none shadow-xl shadow-gray-200/40 rounded-[2rem] bg-white overflow-hidden relative group hover:shadow-gray-300/60 hover:-translate-y-1.5 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-hope-purple/5 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-110" />
                        <CardContent className="p-8 relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 bg-hope-purple/10 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                                <Building2 className="w-7 h-7 text-hope-purple" />
                            </div>
                            <div className="mt-auto">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Lifetime Onboards</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">{metrics.totalPartners}</h3>
                                    <div className="flex items-center text-green-500 text-[10px] font-black uppercase tracking-wider mb-2 bg-green-50 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> +{metrics.activeThisWeek}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
                    <Card className="h-full border-none shadow-xl shadow-gray-200/40 rounded-[2rem] bg-white overflow-hidden relative group hover:shadow-gray-300/60 hover:-translate-y-1.5 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-110" />
                        <CardContent className="p-8 relative z-10 h-full flex flex-col">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                                    <Users className="w-7 h-7 text-green-600" />
                                </div>
                                <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">Active Mode</span>
                            </div>
                            <div className="mt-auto">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Currently Active Partners</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">{metrics.activePartnersCount} / {metrics.totalPartners}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Portfolio Table */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100 mt-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Your Managed Partners</h2>
                        <p className="text-sm text-gray-500 mt-1">Partners and agencies you have successfully onboarded.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs uppercase tracking-widest text-gray-400">
                                <th className="pb-4 font-bold pl-4">Partner Name</th>
                                <th className="pb-4 font-bold">Partner ID</th>
                                <th className="pb-4 font-bold">Contact Info</th>
                                <th className="pb-4 font-bold">Status</th>
                                <th className="pb-4 font-bold text-right pr-4">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {managedPartners.map((partner: any, i: number) => (
                                <motion.tr
                                    key={partner.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="py-5 pl-4">
                                        <p className="font-bold text-gray-900">{partner.name}</p>
                                        <p className="text-xs text-gray-500">Joined {partner.joined}</p>
                                    </td>
                                    <td className="py-5 font-mono text-gray-500">#{partner.id.slice(-6)}</td>
                                    <td className="py-5">
                                        <p className="font-bold text-gray-900">{partner.contactName || "N/A"}</p>
                                        <p className="text-xs text-gray-500">{partner.mobile || "N/A"}</p>
                                    </td>
                                    <td className="py-5">
                                        <StatusBadge status={partner.status} />
                                    </td>
                                    <td className="py-5 pr-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs bg-white"
                                            onClick={() => copyLink(partner.id)}
                                        >
                                            <Copy className="w-3 h-3 mr-2" />
                                            Guest Link
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
