"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Download, Plus, X, CheckCircle, XCircle,
    Building2, Phone, Mail, MapPin, Calendar, Clock,
    ShieldCheck, Percent, MinusCircle, PlusCircle,
    User, ChevronDown, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const BUSINESS_TYPES = [
    { value: "homestay", label: "Homestays & Guest Houses" },
    { value: "resort", label: "Resorts & Boutique Stays" },
    { value: "hostel", label: "Hostels & Backpacker Lodges" },
    { value: "taxi", label: "Taxi & Car Rentals" },
    { value: "bike", label: "Bike & Scooter Rentals" },
    { value: "travel_agency", label: "Tour & Travel Agencies" },
    { value: "guide", label: "Local Travel Guides" },
    { value: "wellness", label: "Yoga & Wellness Centers" },
    { value: "adventure", label: "Adventure Activity Centers" },
    { value: "water_sports", label: "Water Sports Centers" },
    { value: "events", label: "Event Organizers" },
    { value: "freelance", label: "Freelance Guide" },
    { value: "others", label: "Others" },
];

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
    commissionSlab: number;
    guestDiscountSlab?: number;
    walletBalance?: number;
    createdAt: string;
}

type FilterTab = "all" | "approved" | "pending";

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        ACTIVE: "bg-green-100 text-green-700 border-green-200",
        PENDING: "bg-amber-100 text-amber-700 border-amber-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
    };
    const dots: Record<string, string> = {
        ACTIVE: "bg-green-500",
        PENDING: "bg-amber-500",
        REJECTED: "bg-red-500",
    };
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-300", styles[status] || "bg-gray-100 text-gray-600")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", dots[status] || "bg-gray-400")} />
            {status}
        </span>
    );
};

export default function SuperAdminPartnersPage() {
    const router = useRouter();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [showOnboard, setShowOnboard] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [newPartner, setNewPartner] = useState({
        partnerName: "", contactName: "", email: "", mobile: "",
        businessType: "", address: "", city: "", pincode: "", commissionSlab: 7.5,
    });
    const [isOnboarding, setIsOnboarding] = useState(false);

    const fetchPartners = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/partners");
            const data = await res.json();
            if (res.ok) setPartners(data.map((p: any) => ({ ...p, guestDiscountSlab: p.guestDiscountSlab || p.commissionSlab || 7.5 })));
        } catch { toast.error("Failed to load partners"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPartners(); }, [fetchPartners]);

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

    const handleApprove = async (id: string) => {
        setActionLoading(`approve-${id}`);
        try {
            const res = await fetch(`/api/admin/partner/${id}/approve`, { method: "PATCH" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Partner approved! Welcome email sent. ✅");
            setPartners(prev => prev.map(p => p.id === id ? { ...p, status: "ACTIVE" } : p));
            if (selectedPartner?.id === id) setSelectedPartner(p => p ? { ...p, status: "ACTIVE" } : null);
        } catch (err: any) { toast.error(err.message); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (id: string) => {
        setActionLoading(`reject-${id}`);
        try {
            const res = await fetch(`/api/admin/partner/${id}/reject`, { method: "PATCH" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Partner rejected.");
            setPartners(prev => prev.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
            if (selectedPartner?.id === id) setSelectedPartner(p => p ? { ...p, status: "REJECTED" } : null);
        } catch (err: any) { toast.error(err.message); }
        finally { setActionLoading(null); }
    };

    const updateSlab = async (id: string, type: "commission" | "discount", val: number) => {
        if (val < 1 || val > 40) return;
        setUpdatingId(`${id}-${type}`);
        try {
            const body = type === "commission" ? { commissionSlab: val } : { guestDiscountSlab: val };
            const res = await fetch(`/api/admin/partner/${id}/commission`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setPartners(prev => prev.map(p => p.id === id ? { ...p, ...body } : p));
                toast.success(`${type === "commission" ? "Commission" : "Discount"} updated to ${val}%`);
            }
        } catch { toast.error("Update failed"); }
        finally { setUpdatingId(null); }
    };

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsOnboarding(true);
        try {
            const res = await fetch("/api/admin/partner/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPartner),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Partner onboarded! Welcome email sent. ✅");
            setShowOnboard(false);
            setNewPartner({ partnerName: "", contactName: "", email: "", mobile: "", businessType: "", address: "", city: "", pincode: "", commissionSlab: 7.5 });
            fetchPartners();
        } catch (err: any) { toast.error(err.message); }
        finally { setIsOnboarding(false); }
    };

    const exportCSV = () => {
        const headers = ["Name", "Code", "Type", "Mobile", "Email", "Status", "Commission%", "City", "Joined"];
        const rows = partners.map(p => [p.name, p.partnerCode, p.businessType || "N/A", p.mobile, p.email || "N/A", p.status, `${p.commissionSlab}%`, p.city || "N/A", new Date(p.createdAt).toLocaleDateString()]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `hopecafe_partners_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        toast.success("Exported.");
    };

    const np = (key: keyof typeof newPartner) => ({
        value: newPartner[key] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewPartner(f => ({ ...f, [key]: e.target.value })),
        className: "h-12 rounded-md border border-gray-300 focus:border-[#1a6b3a]",
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Partner Network</h1>
                    <p className="text-gray-500 mt-1">Approve applications and manage the partner directory.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 h-11 border border-gray-300 rounded-md" onClick={exportCSV}>
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button className="gap-2 h-11 bg-gray-900 hover:bg-black text-white px-6 rounded-md border border-gray-300" onClick={() => setShowOnboard(true)}>
                        <Plus className="w-4 h-4" /> New Partner
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Partners", value: counts.all, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Approved", value: counts.approved, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Pending Review", value: counts.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Avg Commission", value: partners.length > 0 ? `${(partners.filter(p => p.status === "ACTIVE").reduce((a, p) => a + p.commissionSlab, 0) / (counts.approved || 1)).toFixed(1)}%` : "0%", icon: Percent, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="border border-gray-300 bg-white shadow-lg shadow-gray-200/40 rounded-md">
                            <CardContent className="p-6">
                                <div className={cn("w-12 h-12 rounded-md border border-gray-300 flex items-center justify-center mb-4", s.bg)}>
                                    <s.icon className={cn("w-6 h-6", s.color)} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div> */}

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
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/30 border-b border-gray-100">
                                <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Partner</th>
                                <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest hidden md:table-cell">Business</th>
                                <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Commission</th>
                                <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center hidden lg:table-cell">Joined</th>
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
                                    onClick={() => router.push(`/super-admin/partners/${p.id}`)}
                                    className="group hover:bg-gray-50 transition-colors cursor-pointer"
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
                                    <td className="px-4 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={e => { e.stopPropagation(); updateSlab(p.id, "commission", p.commissionSlab - 0.5); }}
                                                disabled={updatingId === `${p.id}-commission` || p.commissionSlab <= 1}
                                                className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-all hover:scale-110">
                                                <MinusCircle className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm font-black text-gray-900 w-14 text-center bg-gray-50 py-1.5 rounded-md border border-gray-300">{p.commissionSlab}%</span>
                                            <button onClick={e => { e.stopPropagation(); updateSlab(p.id, "commission", p.commissionSlab + 0.5); }}
                                                disabled={updatingId === `${p.id}-commission` || p.commissionSlab >= 40}
                                                className="text-gray-300 hover:text-green-500 disabled:opacity-20 transition-all hover:scale-110">
                                                <PlusCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-center"><StatusBadge status={p.status} /></td>
                                    <td className="px-4 py-5 text-center hidden lg:table-cell">
                                        <p className="text-xs text-gray-400 font-medium">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>


            {/* ── ONBOARD SLIDE-OVER ── */}
            <AnimatePresence>
                {showOnboard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowOnboard(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10">

                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Onboard Partner</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Added immediately as Active</p>
                                </div>
                                <button onClick={() => setShowOnboard(false)} className="w-10 h-10 bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleOnboard} className="flex-1 overflow-y-auto p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Name *</label>
                                        <Input required placeholder="Grand Hope Resort" {...np("partnerName")} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Person *</label>
                                        <Input required placeholder="Owner / Manager name" {...np("contactName")} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email *</label>
                                        <Input required type="email" placeholder="partner@email.com" {...np("email")} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile *</label>
                                        <Input required type="tel" placeholder="98765 43210" {...np("mobile")} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Type *</label>
                                    <select required value={newPartner.businessType} onChange={e => setNewPartner(f => ({ ...f, businessType: e.target.value }))}
                                        className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm focus:border-[#1a6b3a] outline-none transition-all">
                                        <option value="">Select category</option>
                                        {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</label>
                                    <Input placeholder="Street, area name" {...np("address")} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                                        <Input placeholder="Pondicherry" {...np("city")} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode</label>
                                        <Input placeholder="605001" {...np("pincode")} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission Slab (%)</label>
                                    <div className="flex items-center gap-3">
                                        <Input type="number" min="1" max="40" step="0.5"
                                            value={newPartner.commissionSlab}
                                            onChange={e => setNewPartner(f => ({ ...f, commissionSlab: parseFloat(e.target.value) }))}
                                            className="h-12 rounded-md border border-gray-300 text-center font-bold w-28" />
                                        <p className="text-xs text-gray-400">Standard rate is 7.5%</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="bg-green-50 border border-gray-300 rounded-md p-4 mb-5">
                                        <p className="text-xs text-green-700 font-bold">
                                            ✅ This partner will be saved as <strong>Active</strong> immediately. A welcome email with a set-password link will be sent to the email above.
                                        </p>
                                    </div>
                                    <Button type="submit" className="w-full h-13 font-black text-base rounded-md border border-gray-300" isLoading={isOnboarding}>
                                        Onboard Partner
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
