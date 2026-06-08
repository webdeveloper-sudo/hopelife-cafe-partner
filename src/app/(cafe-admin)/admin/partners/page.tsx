"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Users, Search, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface Partner {
    id: string;
    name: string;
    partnerCode: string;
    contactName?: string;
    mobile: string;
    email?: string;
    status: string;
    businessType?: string;
    address?: string;
    city?: string;
    pincode?: string;
    createdAt: string;
    referredBy?: string;
}

type FilterTab = "all" | "approved" | "pending";

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        ACTIVE: "bg-green-100 text-green-700 border-green-200",
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
        RESTRICTED: "bg-gray-100 text-gray-500 border-gray-200",
    };
    const dots: Record<string, string> = {
        ACTIVE: "bg-green-500",
        PENDING: "bg-amber-500",
        REJECTED: "bg-red-500",
        RESTRICTED: "bg-gray-400",
    };
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-300", styles[status] || "bg-gray-100 text-gray-600")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", dots[status] || "bg-gray-400")} />
            {status}
        </span>
    );
};

export default function CafeAdminPartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");

    const fetchPartners = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/partners");
            const data = await res.json();
            if (res.ok) {
                setPartners(data);
            } else {
                toast.error("Failed to load partners");
            }
        } catch { 
            toast.error("Failed to load partners"); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { 
        fetchPartners(); 
    }, [fetchPartners]);

    const filtered = partners.filter(p => {
        const matchesFilter = filter === "all" ? true : filter === "approved" ? p.status === "ACTIVE" : p.status === "PENDING";
        const q = search.toLowerCase();
        const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.partnerCode.toLowerCase().includes(q) || (p.mobile || "").includes(q) || (p.email || "").toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
    });

    const counts = {
        all: partners.length,
        approved: partners.filter(p => p.status === "ACTIVE").length,
        pending: partners.filter(p => p.status === "PENDING").length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Registered Partners</h1>
                <p className="text-gray-500 mt-1">Directory of hospitality partners registered with the network.</p>
            </div>

            {/* List */}
            <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/40 rounded-md overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Filter tabs */}
                        <div className="flex bg-gray-100 rounded-md border border-gray-300 p-1 gap-1">
                            {(["all", "approved", "pending"] as FilterTab[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={cn(
                                        "px-5 py-2 rounded-md border border-gray-300 text-sm font-black uppercase tracking-wider transition-all",
                                        filter === tab
                                            ? "bg-white text-gray-900 shadow-sm border-gray-300"
                                            : "text-gray-400 hover:text-gray-600 border-transparent"
                                    )}
                                >
                                    {tab} <span className="ml-1 opacity-60">({counts[tab]})</span>
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-md border-gray-300 bg-white" placeholder="Search partners..." />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50/30 border-b border-gray-100">
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Partner</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest hidden md:table-cell">Business</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Referred By</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center  hidden md:table-cell">Status</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300 mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-gray-300 text-sm font-bold">No partners found</td></tr>
                                ) : filtered.map((p, i) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-900 rounded-md border border-gray-300 flex items-center justify-center text-white font-black text-sm shrink-0 group-hover:scale-110 transition-transform">
                                                    {p.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{p.partnerCode} · {p.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 hidden md:table-cell">
                                            <span className="text-[10px] font-black text-gray-400 border border-gray-300 px-3 py-1 rounded-md uppercase">
                                                {p.businessType?.replace(/_/g, " ") || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            <span className="text-xs font-bold text-gray-600">
                                                {p.referredBy || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-center hidden lg:table-cell"><StatusBadge status={p.status} /></td>
                                        <td className="px-4 py-5 text-center ">
                                            <p className="text-xs text-gray-400 font-medium">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
