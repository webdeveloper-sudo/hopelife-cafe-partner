"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Building, Phone, Percent, Receipt, ChevronRight, CheckCircle2, UserCheck, ArrowRight, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

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

export default function AddPartnerPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [config, setConfig] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        partnerName: "",
        contactName: "",
        mobile: "",
        email: "",
        businessType: "",
        address: "",
        city: "Pondicherry",
        pincode: "",
        commissionSlab: "7.5",
        upiId: "",
        referredBySelect: "",
        referredByCustom: "",
    });

    useEffect(() => {
        fetch("/api/admin/config")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConfig(data.config);
                    setFormData(prev => ({ ...prev, commissionSlab: data.config.baseCommission.toString() }));
                }
            })
            .catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            const cleanMobile = formData.mobile.replace(/\D/g, "");
            if (!formData.partnerName.trim() || !formData.contactName.trim() || cleanMobile.length !== 10 || !formData.businessType) {
                toast.error("Please fill business name, contact person, 10-digit mobile number, and business type.");
                return;
            }
            if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
                toast.error("Please enter a valid email address or leave it blank.");
                return;
            }
            setStep(2);
            return;
        }

        if (step === 2) {
            const cleanPin = formData.pincode.replace(/\D/g, "");
            if (!formData.address.trim() || !formData.city.trim() || cleanPin.length !== 6) {
                toast.error("Please fill complete address, city, and valid 6-digit pincode.");
                return;
            }
            setStep(3);
            return;
        }

        if (step === 3) {
            const isValidUpi = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId.trim());
            if (!formData.upiId || !isValidUpi) {
                toast.error("Please enter a strictly valid UPI ID (e.g. number@bank).");
                return;
            }
            setStep(4);
            return;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let finalReferredBy = "marketing_rep";
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
                    referredBy: finalReferredBy
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Registration failed.");
                return;
            }

            toast.success("Partner onboarded! Redirecting to WhatsApp OTP verification...");
            router.push(`/verify-partner?mobile=${encodeURIComponent(cleanMobile)}`);
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-hope-purple/10 border border-gray-300 rounded-md mb-4">
                    <UserCheck className="w-4 h-4 text-hope-purple" />
                    <span className="text-xs font-bold text-hope-purple uppercase tracking-widest">Marketing Portal</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Onboard New Partner</h1>
                <p className="text-gray-500 font-medium mt-2">Register a partner business and proceed to WhatsApp authorization.</p>
            </div>

            {/* Progress Track */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((num) => (
                    <React.Fragment key={num}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= num ? 'bg-hope-purple text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                            {num}
                        </div>
                        {num < 4 && <div className={`h-1 flex-1 rounded-md transition-colors ${step > num ? 'bg-hope-purple' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="bg-white rounded-md shadow-xl shadow-gray-200/50 border border-gray-300 p-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Basic Details */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building className="w-5 h-5 text-hope-purple" /> Partner & Business Info
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Business Name *</label>
                                    <input
                                        type="text"
                                        name="partnerName"
                                        value={formData.partnerName}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                        placeholder="e.g. Grand Hope Cafe & Suites"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Contact Person *</label>
                                         <input
                                             type="text"
                                             name="contactName"
                                             value={formData.contactName}
                                             onChange={handleChange}
                                             className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                             placeholder="Jane Doe"
                                             required
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Mobile Number (WhatsApp) *</label>
                                         <div className="relative">
                                             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                 <Phone className="h-4 w-4 text-gray-400" />
                                                 <span className="ml-2 text-gray-900 font-bold text-sm">+91</span>
                                             </div>
                                             <input
                                                 type="tel"
                                                 maxLength={10}
                                                 name="mobile"
                                                 value={formData.mobile}
                                                 onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                                                 className="block w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                                 placeholder="99999 99999"
                                                 required
                                             />
                                         </div>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address (Optional)</label>
                                         <input
                                             type="email"
                                             name="email"
                                             value={formData.email}
                                             onChange={handleChange}
                                             className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                             placeholder="partner@example.com (optional)"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Business Category *</label>
                                         <select
                                             name="businessType"
                                             value={formData.businessType}
                                             onChange={handleChange}
                                             className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                             required
                                         >
                                             <option value="">Select category</option>
                                             {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                                         </select>
                                     </div>
                                </div>
                            </div>
 
                            <div className="pt-6 flex justify-end">
                                <Button onClick={nextStep} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.partnerName || !formData.contactName || formData.mobile.length !== 10 || !formData.businessType}>
                                    Next: Address Details <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Address & Referral */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-hope-purple" /> Location & Referral Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Business Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                        placeholder="Street name, Area, Building"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                            placeholder="Pondicherry"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            maxLength={6}
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                            placeholder="605001"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 border border-gray-300 rounded-md bg-gray-50/50">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Referred By (Optional)</label>
                                        <select
                                            name="referredBySelect"
                                            value={formData.referredBySelect}
                                            onChange={(e) => setFormData({ ...formData, referredBySelect: e.target.value, referredByCustom: "" })}
                                            className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                        >
                                            <option value="">Select Referral Source (Optional)</option>
                                            <option value="Hope Cafe (White Town)">Hope Cafe (White Town)</option>
                                            <option value="Hope Cafe (Auroville)">Hope Cafe (Auroville)</option>
                                            <option value="Hope Partner">Hope Partner</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    {formData.referredBySelect === "Hope Partner" && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Hope Partner Name</label>
                                            <input
                                                type="text"
                                                name="referredByCustom"
                                                value={formData.referredByCustom}
                                                onChange={handleChange}
                                                placeholder="Enter the hope partner name"
                                                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                            />
                                        </div>
                                    )}

                                    {formData.referredBySelect === "Others" && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Name of Person</label>
                                            <input
                                                type="text"
                                                name="referredByCustom"
                                                value={formData.referredByCustom}
                                                onChange={handleChange}
                                                placeholder="Enter the name of the person"
                                                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(1)} variant="outline" className="h-12 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={nextStep} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.address || !formData.city || formData.pincode.length !== 6}>
                                    Next: Settlement Details <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Settlement Details */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-hope-purple" /> Settlement Details
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                                    <h4 className="text-amber-800 font-bold text-sm mb-1 uppercase tracking-widest">⚠️ Critical Settlement Setup</h4>
                                    <p className="text-amber-700 text-xs leading-relaxed font-medium">All commission payouts are automatically processed to this UPI ID. Ensure the UPI ID is valid and active.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Partner Settlement UPI ID *</label>
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={formData.upiId}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-md font-bold focus:ring-2 focus:ring-hope-purple font-mono tracking-widest text-lg"
                                        placeholder="e.g. mobilenumber@bank"
                                        required
                                    />
                                    {formData.upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId) && (
                                        <p className="text-red-500 font-bold text-xs mt-2 ml-1 flex items-center gap-1">
                                            Invalid UPI format. Must contain '@' (e.g. name@bank).
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(2)} variant="outline" className="h-12 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={nextStep} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)}>
                                    Review & Agreement <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Review & Submit */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-hope-purple" /> Agreement & Commission
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div
                                    onClick={() => setFormData({ ...formData, commissionSlab: (config?.baseCommission || 7.5).toString() })}
                                    className={`p-4 rounded-md border-2 cursor-pointer transition-all ${formData.commissionSlab === (config?.baseCommission || 7.5).toString() ? 'border-hope-purple bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Standard</span>
                                        {formData.commissionSlab === (config?.baseCommission || 7.5).toString() && <CheckCircle2 className="w-4 h-4 text-hope-purple" />}
                                    </div>
                                    <span className="text-3xl font-black text-gray-900">{config?.baseCommission || 7.5}%</span>
                                </div>

                                <div
                                    onClick={() => setFormData({ ...formData, commissionSlab: "10.0" })}
                                    className={`p-4 rounded-md border-2 cursor-pointer transition-all ${formData.commissionSlab === "10.0" ? 'border-hope-purple bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-hope-purple">Premium</span>
                                        {formData.commissionSlab === "10.0" && <CheckCircle2 className="w-4 h-4 text-hope-purple" />}
                                    </div>
                                    <span className="text-3xl font-black text-gray-900">10%</span>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-md p-6 text-white shadow-xl border border-gray-300">
                                <h4 className="font-bold mb-4 border-b border-gray-800 pb-2">Onboarding Summary</h4>
                                <div className="space-y-2 text-sm font-medium">
                                    <div className="flex justify-between"><span className="text-gray-400">Partner:</span> <span>{formData.partnerName}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Contact Person:</span> <span>{formData.contactName}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">WhatsApp Mobile:</span> <span>+91 {formData.mobile}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Email:</span> <span>{formData.email || "Not specified"}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Settlement UPI:</span> <span className="font-mono text-emerald-400">{formData.upiId}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Commission Slab:</span> <span className="text-hope-purple font-bold">{formData.commissionSlab}%</span></div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(3)} variant="outline" className="h-14 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} className="h-14 px-8 bg-black hover:bg-gray-800 text-white" isLoading={isSubmitting}>
                                    Submit & Authorize via WhatsApp <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
