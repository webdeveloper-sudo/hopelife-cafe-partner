"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    CheckCircle2, ArrowRight, ShieldCheck, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";

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

interface FormData {
    partnerName: string;
    contactName: string;
    email: string;
    mobile: string;
    businessType: string;
    address: string;
    city: string;
    pincode: string;
    upiId: string;
    referredBySelect: string;
    referredByCustom: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        partnerName: "", contactName: "", email: "", mobile: "",
        businessType: "", address: "", city: "Pondicherry", pincode: "", upiId: "",
        referredBySelect: "", referredByCustom: ""
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        fetch("/api/config")
            .then(res => res.json())
            .then(data => {
                if (data.success) setConfig(data);
            })
            .catch(() => console.error("Failed to load global config"));
    }, []);

    const displayComm = config?.baseCommission ?? 7.5;
    const displayBonus = config?.welcomeBonus ?? 500;

    const validate = (): boolean => {
        const e: Partial<FormData> = {};
        if (!formData.partnerName.trim()) e.partnerName = "Business name is required";
        if (!formData.contactName.trim()) e.contactName = "Contact person name is required";
        
        // Email is optional, validate format only if entered
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            e.email = "Please enter a valid email address or leave blank";
        }
        
        // Mobile is strictly required (10 digits)
        const cleanMobile = formData.mobile.replace(/\D/g, "");
        if (!cleanMobile || cleanMobile.length !== 10) {
            e.mobile = "Valid 10-digit mobile number is required";
        }

        if (!formData.businessType) e.businessType = "Business type is required";
        if (!formData.address.trim()) e.address = "Address is required";
        if (!formData.city.trim()) e.city = "City is required";
        if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) e.pincode = "Valid 6-digit pincode is required";
        if (!formData.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) {
            e.upiId = "Valid UPI ID is required for settlements (e.g. name@bank)";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setIsSubmitting(true);
        try {
            let finalReferredBy = "volunteer";
            if (formData.referredBySelect) {
                if (formData.referredBySelect === "Hope Partner") {
                    finalReferredBy = formData.referredByCustom ? `Hope Partner: ${formData.referredByCustom}` : "Hope Partner";
                } else if (formData.referredBySelect === "Others") {
                    finalReferredBy = formData.referredByCustom ? `Others: ${formData.referredByCustom}` : "Others";
                } else {
                    finalReferredBy = formData.referredBySelect;
                }
            }

            const cleanMobile = formData.mobile.replace(/\D/g, "").slice(-10);

            const res = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    mobile: cleanMobile,
                    referredBy: finalReferredBy,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.error && data.error.toLowerCase().includes("email")) {
                    setErrors(er => ({ ...er, email: data.error }));
                } else if (data.error && data.error.toLowerCase().includes("mobile")) {
                    setErrors(er => ({ ...er, mobile: data.error }));
                }
                throw new Error(data.error || "Failed to register partner");
            }

            toast.success("Details saved! Redirecting to WhatsApp OTP verification...");
            // Redirect immediately to single partner verification page
            router.push(`/verify-partner?mobile=${encodeURIComponent(cleanMobile)}`);
        } catch (err: any) {
            toast.error(err.message || "Registration error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const field = (
        label: string,
        key: keyof FormData,
        placeholder: string,
        type = "text",
        className = ""
    ) => (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
            <Input
                id={key}
                type={type}
                value={formData[key]}
                onChange={e => {
                    let value = e.target.value;
                    if (key === "mobile") {
                        value = value.replace(/\D/g, "").slice(0, 10);
                    }
                    setFormData(f => ({ ...f, [key]: value }));
                    setErrors(er => ({ ...er, [key]: undefined }));
                }}
                placeholder={placeholder}
                error={!!errors[key]}
                className="h-12 border-gray-300 focus:border-[#1a6b3a]"
            />
            {errors[key] && <p className="text-[10px] text-red-500 font-medium">{errors[key]}</p>}
        </div>
    );

    return (
        <AuthLayout>
            <div className="w-full max-w-5xl">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="bg-white rounded-md border border-gray-300 shadow-2xl shadow-gray-200/60 overflow-hidden grid grid-cols-1 md:grid-cols-5">
                        {/* Left panel */}
                        <div className="md:col-span-2 bg-gradient-to-br from-[#1a6b3a] to-[#2aab5a] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-white rounded-full border border-gray-300 flex items-center justify-center mb-8 shadow-xl overflow-hidden">
                                    <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                </div>
                                <h2 className="text-3xl font-bold mb-3 leading-tight tracking-tight">Join the <br />Partner Network</h2>
                                <p className="text-white/70 text-sm mb-8">Access the collaborative ecosystem of Hope Cafe Puducherry.</p>
                                <div className="space-y-4">
                                    {[
                                        `Earn ${displayComm}% on every referred guest bill`,
                                        `₹${displayBonus} instant welcome bonus on activation`,
                                        "Instant WhatsApp OTP authorization",
                                        "Direct weekly payouts to your bank/UPI",
                                        "Dedicated partner support team",
                                    ].map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </div>
                                            <p className="text-sm font-medium">{benefit}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative z-10 mt-10 p-5 bg-white/10 rounded-md border border-gray-300 backdrop-blur-sm">
                                <p className="text-xs text-white/80 italic leading-relaxed">"Registering was seamless, and the weekly payouts never miss. Highly recommend!"</p>
                                <p className="text-xs font-bold mt-2 text-white/60">— Local Tour Operator, Puducherry</p>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="md:col-span-3 p-10">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Partner Registration</h1>
                                <p className="text-gray-500 text-sm mt-1">Join the community of Puducherry hospitality partners.</p>
                            </div>
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {field("Business Name *", "partnerName", "e.g. Sea Side Travels")}
                                    {field("Contact Person *", "contactName", "Your full name")}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {field("Mobile Number (WhatsApp) *", "mobile", "10-digit mobile number", "tel")}
                                    {field("Email Address (Optional)", "email", "you@business.com", "email")}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Business Type *</label>
                                    <select
                                        value={formData.businessType}
                                        onChange={e => { setFormData(f => ({ ...f, businessType: e.target.value })); setErrors(er => ({ ...er, businessType: undefined })); }}
                                        className={`flex h-12 w-full rounded-md border-2 bg-white px-4 text-sm transition-all outline-none ${errors.businessType ? "border-red-400" : "border-gray-300 focus:border-[#1a6b3a]"}`}
                                    >
                                        <option value="">Select your business type</option>
                                        {BUSINESS_TYPES.map(bt => (
                                            <option key={bt.value} value={bt.value}>{bt.label}</option>
                                        ))}
                                    </select>
                                    {errors.businessType && <p className="text-[10px] text-red-500 font-medium">{errors.businessType}</p>}
                                </div>

                                {field("Business Address *", "address", "Street address / Area")}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {field("City *", "city", "Pondicherry")}
                                    {field("Pincode *", "pincode", "605001")}
                                </div>

                                {field("Settlement UPI ID *", "upiId", "yourname@bank or 9876543210@paytm")}

                                {/* Referral Source Section */}
                                <div className="space-y-4 p-4 border border-gray-300 rounded-md bg-gray-50/50">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Referred By (Optional)</label>
                                        <select
                                            value={formData.referredBySelect}
                                            onChange={e => setFormData(f => ({ ...f, referredBySelect: e.target.value, referredByCustom: "" }))}
                                            className="flex h-12 w-full rounded-md border-2 bg-white px-4 text-sm transition-all outline-none border-gray-300 focus:border-[#1a6b3a]"
                                        >
                                            <option value="">Select Referral Source (Optional)</option>
                                            <option value="Hope Cafe (White Town)">Hope Cafe (White Town)</option>
                                            <option value="Hope Cafe (Auroville)">Hope Cafe (Auroville)</option>
                                            <option value="Hope Partner">Hope Partner</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    {formData.referredBySelect === "Hope Partner" && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Hope Partner Name</label>
                                            <Input
                                                type="text"
                                                value={formData.referredByCustom}
                                                onChange={e => setFormData(f => ({ ...f, referredByCustom: e.target.value }))}
                                                placeholder="Enter the hope partner name"
                                                className="h-12 border-2 border-gray-300 focus:border-[#1a6b3a]"
                                            />
                                        </div>
                                    )}

                                    {formData.referredBySelect === "Others" && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Name of Person</label>
                                            <Input
                                                type="text"
                                                value={formData.referredByCustom}
                                                onChange={e => setFormData(f => ({ ...f, referredByCustom: e.target.value }))}
                                                placeholder="Enter the name of the person"
                                                className="h-12 border-2 border-gray-300 focus:border-[#1a6b3a]"
                                            />
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" className="w-full h-13 text-base font-bold mt-2" isLoading={isSubmitting}>
                                    Continue to WhatsApp Verification <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <p className="text-center text-[11px] text-gray-400">Already registered? <a href="/login" className="text-[#1a6b3a] font-bold hover:underline">Login here</a></p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AuthLayout>
    );
}
