"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Download, Plus, X, CheckCircle, XCircle,
    Building2, Phone, Mail, MapPin, Calendar, Clock,
    ShieldCheck, Percent, MinusCircle, PlusCircle,
    User, ChevronDown, Loader2, Trash2
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

interface SlabInputProps {
    partnerId: string;
    type: "commission" | "discount";
    initialValue: number;
    onSave: (id: string, type: "commission" | "discount", val: number) => Promise<void>;
    disabled?: boolean;
}

const SlabInput = ({ partnerId, type, initialValue, onSave, disabled }: SlabInputProps) => {
    const [inputValue, setInputValue] = useState<string>(initialValue.toString());
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setInputValue(initialValue.toString());
        }
    }, [initialValue, isEditing]);

    const handleCommit = async (valStr: string) => {
        let val = parseFloat(valStr);
        if (isNaN(val)) {
            setInputValue(initialValue.toString());
            return;
        }
        val = Math.round(val * 10) / 10;
        if (val < 1) val = 1;
        if (val > 40) val = 40;
        
        setInputValue(val.toString());
        if (val !== initialValue) {
            await onSave(partnerId, type, val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            setInputValue(initialValue.toString());
            e.currentTarget.blur();
        }
    };

    const adjust = async (amount: number) => {
        let current = parseFloat(inputValue);
        if (isNaN(current)) current = initialValue;
        let next = current + amount;
        next = Math.round(next * 10) / 10;
        if (next < 1) next = 1;
        if (next > 40) next = 40;
        setInputValue(next.toString());
        await onSave(partnerId, type, next);
    };

    return (
        <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
            <button
                type="button"
                onClick={async (e) => { e.stopPropagation(); await adjust(-0.5); }}
                disabled={disabled || parseFloat(inputValue) <= 1}
                className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-all hover:scale-110 p-1"
            >
                <MinusCircle className="w-4 h-4" />
            </button>
            <div className="relative flex items-center justify-center w-16 bg-gray-50 border border-gray-300 rounded-md focus-within:border-black transition-all">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => {
                        setIsEditing(false);
                        handleCommit(inputValue);
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="w-10 text-center text-sm font-black text-gray-900 bg-transparent border-0 outline-none p-1.5 pr-0.5"
                />
                <span className="text-[10px] font-bold text-gray-400 select-none pr-1.5">%</span>
            </div>
            <button
                type="button"
                onClick={async (e) => { e.stopPropagation(); await adjust(0.5); }}
                disabled={disabled || parseFloat(inputValue) >= 40}
                className="text-gray-300 hover:text-green-500 disabled:opacity-20 transition-all hover:scale-110 p-1"
            >
                <PlusCircle className="w-4 h-4" />
            </button>
        </div>
    );
};

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
    const [config, setConfig] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [newPartner, setNewPartner] = useState({
        partnerName: "", contactName: "", email: "", mobile: "",
        businessType: "", address: "", city: "", pincode: "", commissionSlab: 7.5,
        referredBySelect: "", referredByCustom: "",
    });
    const [isOnboarding, setIsOnboarding] = useState(false);

    const fetchPartners = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/partners");
            const data = await res.json();
            if (res.ok) {
                // Fetch config for fallbacks
                const configRes = await fetch('/api/admin/config');
                const configData = await configRes.json();
                const baseComm = configData.config?.baseCommission || 7.5;
                const baseDisc = configData.config?.baseGuestDiscount || 7.5;
                
                setPartners(data.map((p: any) => ({ 
                    ...p, 
                    guestDiscountSlab: p.guestDiscountSlab ?? baseDisc
                })));
            }
        } catch { toast.error("Failed to load partners"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        fetchPartners(); 
        fetch('/api/admin/config')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConfig(data.config);
                    setNewPartner(p => ({ ...p, commissionSlab: data.config.baseCommission }));
                }
            });
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

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
        setUpdatingId(`${id}-status`);
        try {
            const res = await fetch(`/api/admin/partner/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setPartners(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            toast.success(`Partner ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeletePartner = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to completely remove partner "${name}" and all their data? This action cannot be undone.`)) return;
        
        setUpdatingId(`${id}-delete`);
        try {
            const res = await fetch(`/api/admin/partner/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Partner removed successfully.");
            setPartners(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdatingId(null);
        }
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
            let finalReferredBy = "volunteer";
            if (newPartner.referredBySelect) {
                if (newPartner.referredBySelect === "Hope Partner") {
                    finalReferredBy = newPartner.referredByCustom ? `Hope Partner: ${newPartner.referredByCustom}` : "Hope Partner";
                } else if (newPartner.referredBySelect === "Others") {
                    finalReferredBy = newPartner.referredByCustom ? `Others: ${newPartner.referredByCustom}` : "Others";
                } else {
                    finalReferredBy = newPartner.referredBySelect;
                }
            }

            const res = await fetch("/api/admin/partner/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newPartner,
                    referredBy: finalReferredBy
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error && data.error.toLowerCase().includes("email")) {
                    setErrors(er => ({ ...er, email: data.error }));
                    setTimeout(() => {
                        document.getElementById("email")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 50);
                } else if (data.error && data.error.toLowerCase().includes("mobile")) {
                    setErrors(er => ({ ...er, mobile: data.error }));
                    setTimeout(() => {
                        document.getElementById("mobile")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 50);
                }
                throw new Error(data.error || "Failed to onboard partner");
            }
            toast.success("Partner onboarded! Welcome email sent. ✅");
            setShowOnboard(false);
            setErrors({});
            setNewPartner({ partnerName: "", contactName: "", email: "", mobile: "", businessType: "", address: "", city: "", pincode: "", commissionSlab: config?.baseCommission || 7.5, referredBySelect: "", referredByCustom: "" });
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
        id: key,
        value: newPartner[key] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setNewPartner(f => ({ ...f, [key]: e.target.value }));
            setErrors(er => ({ ...er, [key]: "" }));
        },
        error: !!errors[key],
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
{/* <Button variant="outline" className="gap-2 h-11 border border-gray-300 rounded-md" onClick={exportCSV}>
                        <Download className="w-4 h-4" /> Export CSV
                    </Button> */}
                    <Button className="gap-2 h-11 bg-gray-900 hover:bg-black text-white px-6 rounded-md border border-gray-300" onClick={() => { setErrors({}); setShowOnboard(true); }}>
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
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50/30 border-b border-gray-100">
                                    <th className="px-8 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest">Partner</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest hidden md:table-cell">Business</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Commission</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Discount</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Referred By</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Login Access</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center">Delete</th>
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center hidden lg:table-cell">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={9} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-300 mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={9} className="py-20 text-center text-gray-300 text-sm font-bold">No partners found</td></tr>
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
                                            <SlabInput
                                                partnerId={p.id}
                                                type="commission"
                                                initialValue={p.commissionSlab}
                                                onSave={updateSlab}
                                                disabled={updatingId === `${p.id}-commission`}
                                            />
                                        </td>
                                        <td className="px-4 py-5">
                                            <SlabInput
                                                partnerId={p.id}
                                                type="discount"
                                                initialValue={p.guestDiscountSlab ?? 7.5}
                                                onSave={updateSlab}
                                                disabled={updatingId === `${p.id}-discount`}
                                            />
                                        </td>
                                        <td className="px-4 py-5 text-center">
                                            <span className="text-xs font-bold text-gray-600">
                                                {p.referredBy || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 text-center"><StatusBadge status={p.status} /></td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(p.id, p.status); }}
                                                    disabled={updatingId === `${p.id}-status` || (p.status !== "ACTIVE" && p.status !== "RESTRICTED")}
                                                    className={cn(
                                                        "relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 outline-none border border-gray-300 shadow-inner",
                                                        p.status === "ACTIVE" ? "bg-green-500" : "bg-gray-200"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300",
                                                            p.status === "ACTIVE" ? "translate-x-5.5" : "translate-x-1"
                                                        )}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePartner(p.id, p.name); }}
                                                    disabled={updatingId === `${p.id}-delete`}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    {updatingId === `${p.id}-delete` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-center hidden lg:table-cell">
                                            <p className="text-xs text-gray-400 font-medium">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>


            {/* ── ONBOARD SLIDE-OVER ── */}
            <AnimatePresence>
                {showOnboard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setErrors({}); setShowOnboard(false); }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10">
 
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Onboard Partner</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Added immediately as Active</p>
                                </div>
                                <button onClick={() => { setErrors({}); setShowOnboard(false); }} className="w-10 h-10 bg-gray-100 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors">
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
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile *</label>
                                        <Input required type="tel" placeholder="98765 43210" {...np("mobile")} />
                                        {errors.mobile && <p className="text-[10px] text-red-500 font-bold">{errors.mobile}</p>}
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
                                        <p className="text-xs text-gray-400">Standard rate is {config?.baseCommission || 7.5}%</p>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 border border-gray-300 rounded-md bg-gray-50/50">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Referred By (Optional)</label>
                                        <select
                                            value={newPartner.referredBySelect}
                                            onChange={e => setNewPartner(f => ({ ...f, referredBySelect: e.target.value, referredByCustom: "" }))}
                                            className="flex h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm focus:border-[#1a6b3a] outline-none transition-all"
                                        >
                                            <option value="">Select Referral Source (Optional)</option>
                                            <option value="Hope Cafe (White Town)">Hope Cafe (White Town)</option>
                                            <option value="Hope Cafe (Auroville)">Hope Cafe (Auroville)</option>
                                            <option value="Hope Partner">Hope Partner</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    {newPartner.referredBySelect === "Hope Partner" && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Hope Partner Name</label>
                                            <Input
                                                type="text"
                                                value={newPartner.referredByCustom}
                                                onChange={e => setNewPartner(f => ({ ...f, referredByCustom: e.target.value }))}
                                                placeholder="Enter the hope partner name"
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                    )}

                                    {newPartner.referredBySelect === "Others" && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Name of Person</label>
                                            <Input
                                                type="text"
                                                value={newPartner.referredByCustom}
                                                onChange={e => setNewPartner(f => ({ ...f, referredByCustom: e.target.value }))}
                                                placeholder="Enter the name of the person"
                                                required
                                                className="h-12"
                                            />
                                        </div>
                                    )}
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
