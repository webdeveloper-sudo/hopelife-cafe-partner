"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    User, 
    Building2, 
    CreditCard, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function PartnerSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        contactName: "",
        email: "",
        mobile: "",
        address: "",
        city: "",
        pincode: "",
        bankName: "",
        accountHolderName: "",
        bankAccount: "",
        ifsc: "",
        upiId: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/partner/stats");
                const data = await res.json();
                if (data.success) {
                    const p = data.partnerDetails;
                    setFormData({
                        name: p.name || "",
                        contactName: p.contactName || p.name || "",
                        email: p.email || "",
                        mobile: p.mobile || "",
                        address: p.address || "",
                        city: p.city || "",
                        pincode: p.pincode || "",
                        bankName: p.bankName || "",
                        accountHolderName: p.accountHolderName || "",
                        bankAccount: p.bankAccount || "",
                        ifsc: p.ifsc || "",
                        upiId: p.upiId || ""
                    });
                }
            } catch {
                toast.error("Failed to load profile details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/partner/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully! ✨");
            } else {
                toast.error(data.error || "Update failed.");
            }
        } catch {
            toast.error("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-hope-purple animate-spin" />
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Partner Profile</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your personal and payout information.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-12 bg-hope-purple hover:bg-hope-purple/90 text-white px-8 font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-hope-purple/20"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All Changes
                </Button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Personal Information */}
                <motion.div variants={item} className="space-y-6">
                    <Card className="border border-gray-300 rounded-md shadow-sm overflow-hidden h-full">
                        <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-300">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-hope-purple" />
                                <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-widest">Personal Details</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner/Business Name</label>
                                    <Input name="name" value={formData.name} onChange={handleChange} className="h-12 border-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Person</label>
                                    <Input name="contactName" value={formData.contactName} onChange={handleChange} className="h-12 border-gray-300" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email (Login)</label>
                                        <Input value={formData.email} disabled className="h-12 bg-gray-50 border-gray-200 text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                                        <Input name="mobile" value={formData.mobile} onChange={handleChange} className="h-12 border-gray-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address Line</label>
                                    <Input name="address" value={formData.address} onChange={handleChange} className="h-12 border-gray-300" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                                        <Input name="city" value={formData.city} onChange={handleChange} className="h-12 border-gray-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pincode</label>
                                        <Input name="pincode" value={formData.pincode} onChange={handleChange} className="h-12 border-gray-300" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Settlement Information */}
                <motion.div variants={item} className="space-y-6">
                    <Card className="border border-gray-300 rounded-md shadow-sm overflow-hidden h-full">
                        <CardHeader className="bg-gray-50/50 p-6 border-b border-gray-300">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-hope-purple" />
                                <CardTitle className="text-sm font-black text-gray-900 uppercase tracking-widest">Payout & Settlement</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Bank Transfer Details</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Holder Name</label>
                                    <Input name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="h-12 border-gray-300" placeholder="e.g. Grand Hope Cafe Ltd" />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Name</label>
                                        <Input name="bankName" value={formData.bankName} onChange={handleChange} className="h-12 border-gray-300" placeholder="e.g. HDFC Bank" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Number</label>
                                            <Input name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="h-12 border-gray-300" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IFSC Code</label>
                                            <Input name="ifsc" value={formData.ifsc} onChange={handleChange} className="h-12 border-gray-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 pt-4">Direct UPI Transfer</p>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">UPI ID (VPA)</label>
                                <div className="relative">
                                    <Input name="upiId" value={formData.upiId} onChange={handleChange} className="h-12 border-gray-300 pl-10" placeholder="e.g. example@okaxis" />
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium">Payouts will prioritize UPI if available for faster settlement.</p>
                            </div>

                            <div className="mt-8 p-6 bg-blue-50/50 rounded-md border border-blue-100 space-y-3">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Financial Accuracy Notice</p>
                                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed mt-1">
                                            Please ensure these details are verified. Incorrect banking information may lead to payment reversals or delays in your settlement cycle.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </form>

        </motion.div>
    );
}
