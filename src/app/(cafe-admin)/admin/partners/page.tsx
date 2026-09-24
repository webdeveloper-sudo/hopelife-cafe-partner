"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Loader2, Plus, X, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

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
    const router = useRouter();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>("all");
    const [search, setSearch] = useState("");

    // Onboard Modal State
    const [showOnboard, setShowOnboard] = useState(false);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newPartner, setNewPartner] = useState({
        partnerName: "",
        contactName: "",
        email: "",
        mobile: "",
        businessType: "",
        address: "",
        city: "Pondicherry",
        pincode: "",
        upiId: "",
        commissionSlab: 7.5,
        referredBySelect: "",
        referredByCustom: ""
    });

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

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errs: Record<string, string> = {};
        if (!newPartner.partnerName.trim()) errs.partnerName = "Business name is required";
        if (!newPartner.contactName.trim()) errs.contactName = "Contact person name is required";
        if (newPartner.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPartner.email.trim())) {
            errs.email = "Valid email is required or leave empty";
        }
        if (!newPartner.mobile || newPartner.mobile.replace(/\D/g, "").length < 10) {
            errs.mobile = "Valid 10-digit phone number is required";
        }
        if (!newPartner.businessType) errs.businessType = "Business type is required";
        if (!newPartner.address.trim()) errs.address = "Address is required";
        if (!newPartner.city.trim()) errs.city = "City is required";
        if (!newPartner.pincode || !/^\d{6}$/.test(newPartner.pincode)) {
            errs.pincode = "Valid 6-digit pincode is required";
        }
        if (!newPartner.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(newPartner.upiId)) {
            errs.upiId = "Valid UPI ID is required for settlements (e.g. name@bank)";
        }
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setIsOnboarding(true);
        try {
            let finalReferredBy = "cafe_admin";
            if (newPartner.referredBySelect) {
                if (newPartner.referredBySelect === "Hope Partner") {
                    finalReferredBy = newPartner.referredByCustom ? `Hope Partner: ${newPartner.referredByCustom}` : "Hope Partner";
                } else if (newPartner.referredBySelect === "Others") {
                    finalReferredBy = newPartner.referredByCustom ? `Others: ${newPartner.referredByCustom}` : "Others";
                } else {
                    finalReferredBy = newPartner.referredBySelect;
                }
            }

            const cleanMobile = newPartner.mobile.replace(/\D/g, "").slice(-10);

            const res = await fetch("/api/admin/partner/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newPartner,
                    mobile: cleanMobile,
                    referredBy: finalReferredBy
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error && data.error.toLowerCase().includes("email")) {
                    setErrors(er => ({ ...er, email: data.error }));
                } else if (data.error && data.error.toLowerCase().includes("mobile")) {
                    setErrors(er => ({ ...er, mobile: data.error }));
                } else if (data.error && data.error.toLowerCase().includes("upi")) {
                    setErrors(er => ({ ...er, upiId: data.error }));
                }
                throw new Error(data.error || "Failed to onboard partner");
            }

            toast.success("Partner onboarded! Redirecting to WhatsApp verification... 🚀");
            setShowOnboard(false);
            setErrors({});
            setNewPartner({ partnerName: "", contactName: "", email: "", mobile: "", businessType: "", address: "", city: "Pondicherry", pincode: "", upiId: "", commissionSlab: 7.5, referredBySelect: "", referredByCustom: "" });
            fetchPartners();
            router.push(`/verify-partner?mobile=${encodeURIComponent(cleanMobile)}`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsOnboarding(false);
        }
    };

    const np = (key: keyof typeof newPartner) => ({
        id: key,
        value: newPartner[key] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            let value = e.target.value;
            if (key === "mobile") {
                value = value.replace(/\D/g, "").slice(0, 10);
            } else if (key === "pincode") {
                value = value.replace(/\D/g, "").slice(0, 6);
            }
            setNewPartner(f => ({ ...f, [key]: value }));
            setErrors(er => ({ ...er, [key]: "" }));
        },
        error: !!errors[key],
        className: "h-12 rounded-md border border-gray-300 focus:border-[#1a6b3a]",
    });

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Registered Partners</h1>
                    <p className="text-gray-500 mt-1">Directory of hospitality partners registered with the network.</p>
                </div>
                <div>
                    <Button
                        className="gap-2 h-11 bg-gray-900 hover:bg-black text-white px-6 rounded-md border border-gray-300"
                        onClick={() => { setErrors({}); setShowOnboard(true); }}
                    >
                        <Plus className="w-4 h-4" /> Onboard Partner
                    </Button>
                </div>
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
                                    <th className="px-4 py-4 font-black text-[10px] text-gray-400 uppercase tracking-widest text-center hidden md:table-cell">Status</th>
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
                                        <td className="px-4 py-5 text-center">
                                            <p className="text-xs text-gray-400 font-medium">{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Slide-over Onboard Modal Drawer */}
            <AnimatePresence>
                {showOnboard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setErrors({}); setShowOnboard(false); }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">Onboard Partner</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Cafe Admin Onboarding</p>
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile *</label>
                                        <Input required type="tel" placeholder="98765 43210" {...np("mobile")} />
                                        {errors.mobile && <p className="text-[10px] text-red-500 font-bold">{errors.mobile}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email (Optional)</label>
                                        <Input type="email" placeholder="partner@email.com (optional)" {...np("email")} />
                                        {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
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
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address *</label>
                                    <Input required placeholder="Street, area name" {...np("address")} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City *</label>
                                        <Input required placeholder="Pondicherry" {...np("city")} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode *</label>
                                        <Input required placeholder="605001" {...np("pincode")} />
                                        {errors.pincode && <p className="text-[10px] text-red-500 font-bold">{errors.pincode}</p>}
                                    </div>
                                </div>

                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-[10px] font-semibold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Settlement Account
                                    </p>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UPI ID (For Settlements) *</label>
                                        <Input required placeholder="yourname@upi" {...np("upiId")} />
                                        {errors.upiId && <p className="text-[10px] text-red-500 font-bold">{errors.upiId}</p>}
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
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-5">
                                        <p className="text-xs text-emerald-800 font-bold">
                                            ✅ Upon onboard submission, you will be redirected to the WhatsApp OTP verification and password setup page for this partner.
                                        </p>
                                    </div>
                                    <Button type="submit" className="w-full h-13 font-black text-base rounded-md border border-gray-300" isLoading={isOnboarding}>
                                        Onboard Partner & Verify
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
