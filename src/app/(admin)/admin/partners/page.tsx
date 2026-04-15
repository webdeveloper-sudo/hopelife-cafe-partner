"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    MapPin,
    ShieldCheck,
    Percent,
    PlusCircle,
    MinusCircle
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
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

interface Partner {
    id: string;
    name: string;
    partnerCode: string;
    mobile: string;
    email?: string;
    status: string;
    businessType?: string;
    commissionSlab: number;
    guestDiscountSlab?: number;
}

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddPartner, setShowAddPartner] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for new partner
    const [newPartner, setNewPartner] = useState({
        partnerName: "",
        contactName: "",
        mobile: "",
        email: "",
        businessType: "",
        commissionSlab: 7.5
    });

    const fetchPartners = async () => {
        try {
            const res = await fetch("/api/admin/partners");
            const data = await res.json();
            if (res.ok) {
                setPartners(data.map((p: any) => ({
                    ...p,
                    guestDiscountSlab: p.guestDiscountSlab || p.commissionSlab || 7.5
                })));
            }
        } catch (error) {
            toast.error("Failed to load partners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const updateSlab = async (id: string, type: 'commission' | 'discount', newValue: number) => {
        if (newValue < 1 || newValue > 40) return;
        setUpdatingId(`${id}-${type}`);
        try {
            const body = type === 'commission' ? { commissionSlab: newValue } : { guestDiscountSlab: newValue };
            const res = await fetch(`/api/admin/partner/${id}/commission`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                setPartners(prev => prev.map(p => p.id === id ? { ...p, ...body } : p));
                toast.success(`${type === 'commission' ? 'Commission' : 'Discount'} updated to ${newValue}%`);
            } else {
                toast.error(data.error || "Update failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPartner),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Partner Onboarded Successfully!");
                setShowAddPartner(false);
                setNewPartner({
                    partnerName: "",
                    contactName: "",
                    mobile: "",
                    email: "",
                    businessType: "",
                    commissionSlab: 7.5
                });
                fetchPartners();
            } else {
                toast.error(data.error || "Failed to add partner");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const exportToCSV = () => {
        const headers = ["Partner Name", "ID", "Type", "Mobile", "Email", "Status", "Commission %", "Discount %"];
        const rows = partners.map(p => [
            p.name,
            p.partnerCode,
            p.businessType || "N/A",
            p.mobile,
            p.email || "N/A",
            p.status,
            `${p.commissionSlab}%`,
            `${p.guestDiscountSlab}%`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `hopecafe_partners_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Partner directory exported.");
    };

    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partnerCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Partner Network</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage commission slabs and audit partners.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 h-11 border-gray-100 hover:bg-gray-50" onClick={exportToCSV}>
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                    <Button className="gap-2 h-11 bg-gray-900 hover:bg-black text-white px-8 rounded-2xl" onClick={() => setShowAddPartner(true)}>
                        <Plus className="w-4 h-4" /> New Partner
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Partners", value: partners.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Audit Requests", value: "0", icon: ShieldCheck, color: "text-hope-green", bg: "bg-hope-green/10" },
                    { label: "Avg Commission", value: partners.length > 0 ? `${(partners.reduce((acc, p) => acc + p.commissionSlab, 0) / partners.length).toFixed(1)}%` : "0%", icon: Percent, color: "text-green-500", bg: "bg-green-50" },
                    { label: "Total Partners", value: partners.length.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={item}>
                        <Card className="border-none bg-white shadow-xl shadow-gray-200/50 rounded-[2rem]">
                            <CardContent className="p-8">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
                                    <stat.icon className={cn("w-7 h-7", stat.color)} />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={item}>
                <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-14 h-14 bg-white border-transparent focus:border-hope-green rounded-2xl shadow-sm text-sm"
                                    placeholder="Search partners by name, ID or location..."
                                />
                            </div>
                            <Button variant="secondary" className="gap-2 h-14 px-8 bg-white border border-gray-100 rounded-2xl font-bold">
                                <Filter className="w-4 h-4" /> Filters
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/30">
                                        <th className="px-10 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest">Partner Identity</th>
                                        <th className="px-4 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Business Type</th>
                                        <th className="px-4 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Partner Comm %</th>
                                        <th className="px-4 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Guest Discount %</th>
                                        <th className="px-4 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-10 py-6 font-black text-[10px] text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-xs opacity-50">Loading partners...</td>
                                        </tr>
                                    ) : filteredPartners.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-16 text-center text-gray-300 font-black uppercase tracking-widest text-xs italic">No partners found in directory</td>
                                        </tr>
                                    ) : filteredPartners.map((p, i) => (
                                        <tr key={i} className="group hover:bg-gray-50/80 transition-all cursor-pointer">
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-gray-950 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-black/10 overflow-hidden shrink-0 transition-transform group-hover:scale-110">
                                                        {p.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-gray-900 text-base leading-tight">{p.name}</h4>
                                                        <p className="text-[11px] font-bold text-gray-400 mt-1 flex items-center gap-2 uppercase tracking-wide">
                                                            CODE: {p.partnerCode} • {p.mobile}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-7 text-center">
                                                <span className="text-[10px] font-black text-gray-400 border border-gray-100 px-3 py-1 rounded-full uppercase whitespace-nowrap">
                                                    {p.businessType ? p.businessType.replace(/_/g, " ") : "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-7">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateSlab(p.id, 'commission', p.commissionSlab - 0.5); }}
                                                        disabled={updatingId === `${p.id}-commission` || p.commissionSlab <= 1}
                                                        className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-all hover:scale-125"
                                                    >
                                                        <MinusCircle className="w-5 h-5" />
                                                    </button>
                                                    <div className="w-16 text-center font-black text-gray-900 text-sm bg-gray-50 py-2 rounded-xl border border-gray-100">
                                                        {p.commissionSlab}%
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateSlab(p.id, 'commission', p.commissionSlab + 0.5); }}
                                                        disabled={updatingId === `${p.id}-commission` || p.commissionSlab >= 40}
                                                        className="text-gray-300 hover:text-green-500 disabled:opacity-20 transition-all hover:scale-125"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-7">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateSlab(p.id, 'discount', (p.guestDiscountSlab || p.commissionSlab) - 0.5); }}
                                                        disabled={updatingId === `${p.id}-discount` || (p.guestDiscountSlab || p.commissionSlab) <= 1}
                                                        className="text-gray-300 hover:text-red-500 disabled:opacity-20 transition-all hover:scale-125"
                                                    >
                                                        <MinusCircle className="w-5 h-5" />
                                                    </button>
                                                    <div className="w-16 text-center font-black text-hope-green text-sm bg-hope-green/5 py-2 rounded-xl border border-hope-green/10">
                                                        {p.guestDiscountSlab || p.commissionSlab}%
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateSlab(p.id, 'discount', (p.guestDiscountSlab || p.commissionSlab) + 0.5); }}
                                                        disabled={updatingId === `${p.id}-discount` || (p.guestDiscountSlab || p.commissionSlab) >= 40}
                                                        className="text-gray-300 hover:text-green-500 disabled:opacity-20 transition-all hover:scale-125"
                                                    >
                                                        <PlusCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-7 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest",
                                                    p.status === "ACTIVE" ? "bg-green-100 text-green-700 shadow-sm shadow-green-100" : "bg-red-100 text-red-700 shadow-sm shadow-red-100"
                                                )}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", p.status === "ACTIVE" ? "bg-green-500" : "bg-red-500")} />
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-gray-100 w-12 h-12">
                                                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
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

            {/* Add Partner Overlay */}
            {showAddPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddPartner(false)}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col"
                    >
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Onboard Partner</h3>
                                <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest leading-none">Adding to HOPE Cafe Network</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowAddPartner(false)} className="rounded-2xl">
                                <Plus className="w-6 h-6 text-gray-300 rotate-45" />
                            </Button>
                        </div>

                        <form onSubmit={handleAddPartner} className="flex-1 overflow-y-auto p-10 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                                <Input
                                    required
                                    placeholder="e.g. Grand Hope Resort"
                                    className="h-14 rounded-2xl border-gray-100 focus:border-hope-purple"
                                    value={newPartner.partnerName}
                                    onChange={(e) => setNewPartner({ ...newPartner, partnerName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Person</label>
                                <Input
                                    required
                                    placeholder="Name of the manager/owner"
                                    className="h-14 rounded-2xl border-gray-100 focus:border-hope-purple"
                                    value={newPartner.contactName}
                                    onChange={(e) => setNewPartner({ ...newPartner, contactName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <Input
                                        required
                                        placeholder="98765 43210"
                                        className="h-14 rounded-2xl border-gray-100 focus:border-hope-purple"
                                        value={newPartner.mobile}
                                        onChange={(e) => setNewPartner({ ...newPartner, mobile: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                    <Input
                                        placeholder="Optional"
                                        className="h-14 rounded-2xl border-gray-100 focus:border-hope-purple"
                                        value={newPartner.email}
                                        onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Type</label>
                                <select
                                    required
                                    className="w-full h-14 rounded-2xl border-2 bg-white px-4 py-2 text-sm transition-all border-gray-100 focus:border-hope-purple outline-none"
                                    value={newPartner.businessType}
                                    onChange={(e) => setNewPartner({ ...newPartner, businessType: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    <option value="homestay">Homestays & Guest Houses</option>
                                    <option value="resort">Resorts & Boutique Stays</option>
                                    <option value="hostel">Hostels & Backpacker Lodges</option>
                                    <option value="taxi">Taxi & Car Rentals</option>
                                    <option value="bike">Bike & Scooter Rentals</option>
                                    <option value="travel_agency">Tour & Travel Agencies</option>
                                    <option value="guide">Local Travel Guides</option>
                                    <option value="wellness">Yoga & Wellness Centers</option>
                                    <option value="adventure">Adventure Activity Centers</option>
                                    <option value="water_sports">Water Sports Centers</option>
                                    <option value="events">Event Organizers</option>
                                    <option value="freelance">Freelance Guide</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Commission Slab (%)</label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="40"
                                        step="0.5"
                                        className="h-14 rounded-2xl border-gray-100 focus:border-hope-purple font-bold text-center"
                                        value={newPartner.commissionSlab}
                                        onChange={(e) => setNewPartner({ ...newPartner, commissionSlab: parseFloat(e.target.value) })}
                                    />
                                    <p className="text-xs text-gray-400 font-medium">Standard is 7.5%. Can be adjusted later.</p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 text-sm font-black uppercase tracking-widest rounded-3xl mt-6 shadow-2xl shadow-hope-purple/30"
                                isLoading={isSubmitting}
                            >
                                Process Registration
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}



