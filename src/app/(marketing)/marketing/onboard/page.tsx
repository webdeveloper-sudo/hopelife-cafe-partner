"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Building, Phone, Percent, Receipt, ChevronRight, CheckCircle2, UserCheck, ArrowRight, Loader2 } from "lucide-react";
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

// Marketing Executive Add Partner Flow
export default function AddPartnerPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // OTP State
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [verificationToken, setVerificationToken] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = async () => {
        if (step === 1) {
            if (!formData.partnerName || !formData.contactName || formData.mobile.length !== 10 || !formData.email || !formData.businessType || !formData.address || !formData.city || !formData.pincode) {
                toast.error("Please fill all business and contact details.");
                return;
            }
            // Trigger send OTP
            setIsVerifyingOtp(true);
            try {
                const res = await fetch("/api/partner/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email, type: "partner-registration" })
                });
                if (!res.ok) {
                    const data = await res.json();
                    toast.error(data.error || "Failed to send OTP.");
                    setIsVerifyingOtp(false);
                    return;
                }
                toast.success("OTP sent to " + formData.email);
            } catch {
                toast.error("Network error.");
                setIsVerifyingOtp(false);
                return;
            }
            setIsVerifyingOtp(false);
        }
        
        const isValidUpi = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId);
        if (step === 3 && (!formData.upiId || !isValidUpi)) {
            toast.error("Please enter a strictly valid UPI ID (e.g. number@bank).");
            return;
        }
        setStep(step + 1);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const digits = [...otpDigits];
        digits[index] = value;
        setOtpDigits(digits);
        setOtpError("");
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (text.length === 6) {
            setOtpDigits(text.split(""));
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpDigits.join("");
        if (otp.length < 6) { 
            setOtpError("Verify all 6 digits");
            return; 
        }
        setIsVerifyingOtp(true);
        try {
            const res = await fetch("/api/partner/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp, purpose: "partner-registration" })
            });
            const data = await res.json();
            if (res.ok && data.success && data.verificationToken) {
                setVerificationToken(data.verificationToken);
                setStep(3);
                toast.success("OTP verified!");
            } else {
                setOtpError(data.error || "Invalid OTP code.");
            }
        } catch {
            toast.error("Network error verifying OTP.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, verificationToken }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Registration failed.");
                return;
            }
            setIsSuccess(true);
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 bg-green-50 rounded-full border border-gray-300 flex items-center justify-center mb-6 shadow-sm"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Invitation Sent Successfully!</h2>
                <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                    We've emailed <span className="font-bold text-gray-900">{formData.email}</span> with a secure link to set their password and login to the automated Partner Portal.
                </p>

                <div className="bg-amber-50 border border-amber-200 p-6 rounded-md w-full max-w-md mb-8 text-left shadow-sm">
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-3">Next Steps</h3>
                    <ul className="text-sm text-amber-700 space-y-3 font-medium">
                        <li className="flex gap-2">
                            <span className="font-bold">1.</span> Partner sets their password via the email link.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">2.</span> Partner logs into their Portal instantly.
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">3.</span> Partner generates and prints their own dynamic QR code.
                        </li>
                    </ul>
                </div>

                <Button onClick={() => window.location.reload()} size="lg" className="h-14 px-8" variant="primary">
                    Onboard Another Partner
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-hope-purple/10 border border-gray-300 rounded-md mb-4">
                    <UserCheck className="w-4 h-4 text-hope-purple" />
                    <span className="text-xs font-bold text-hope-purple uppercase tracking-widest">Marketing Portal</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Onboard New Partner</h1>
                <p className="text-gray-500 font-medium mt-2">Instantly activate a business or agency and issue their QR Standee link.</p>
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
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building className="w-5 h-5 text-hope-purple" /> Basic Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Business Name (Partner / Agency)</label>
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
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Contact Person</label>
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
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
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
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                         <input
                                             type="email"
                                             name="email"
                                             value={formData.email}
                                             onChange={handleChange}
                                             className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md font-medium focus:ring-2 focus:ring-hope-purple"
                                             placeholder="partner@example.com"
                                             required
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Business Category</label>
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
                                     <div className="md:col-span-2">
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Business Address</label>
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
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">City</label>
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
                                         <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Pincode</label>
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
                             </div>
 
                             <div className="pt-6 flex justify-end">
                                 <Button onClick={nextStep} isLoading={isVerifyingOtp} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.partnerName || !formData.contactName || formData.mobile.length !== 10 || !formData.email || !formData.businessType || !formData.address || !formData.pincode}>
                                     Next Step (OTP) <ChevronRight className="w-4 h-4 ml-1" />
                                 </Button>
                             </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-hope-purple" /> Partner Verification
                            </h3>

                            <div className="space-y-6 text-center">
                                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                                    We've sent a 6-digit confirmation code to <br /><span className="font-bold text-gray-900">{formData.email}</span>
                                </p>
                                
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Enter Security Code</label>
                                    
                                    <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                                        {otpDigits.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => { otpRefs.current[i] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className={`w-12 h-14 text-center text-2xl font-black rounded-md border-2 border-gray-300 outline-none transition-all ${
                                                    otpError ? "border-red-400 bg-red-50 text-red-600 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" :
                                                    digit ? "border-hope-purple bg-purple-50 text-hope-purple" :
                                                    "focus:border-hope-purple focus:shadow-lg focus:shadow-purple-500/10"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    
                                    {otpError && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: -10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            className="text-xs font-bold text-red-500 mt-4 bg-red-50 py-2 px-4 rounded-md inline-block"
                                        >
                                            {otpError}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 flex justify-between border-t border-gray-100">
                                <Button onClick={() => setStep(1)} variant="outline" className="h-12 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button 
                                    onClick={handleVerifyOtp} 
                                    isLoading={isVerifyingOtp} 
                                    className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" 
                                    disabled={otpDigits.some(d => !d) || isVerifyingOtp}
                                >
                                    Verify Code <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

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
                                    <h4 className="text-amber-800 font-bold text-sm mb-1 uppercase tracking-widest">⚠️ Critical Information</h4>
                                    <p className="text-amber-700 text-xs leading-relaxed font-medium">This is the most important step. Your earnings will be settled automatically to this UPI ID ONLY. Please double check and ensure the UPI ID is perfectly active and capable of receiving payments.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Partner UPI ID</label>
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
                                            Invalid UPI format. Must contain '@'.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(2)} variant="outline" className="h-12 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={nextStep} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)}>
                                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Percent className="w-5 h-5 text-hope-purple" /> Agreement & Activation
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div
                                    onClick={() => setFormData({ ...formData, commissionSlab: "7.5" })}
                                    className={`p-4 rounded-md border-2 cursor-pointer transition-all ${formData.commissionSlab === "7.5" ? 'border-hope-purple bg-purple-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Standard</span>
                                        {formData.commissionSlab === "7.5" && <CheckCircle2 className="w-4 h-4 text-hope-purple" />}
                                    </div>
                                    <span className="text-3xl font-black text-gray-900">7.5%</span>
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
                                <h4 className="font-bold mb-4 border-b border-gray-800 pb-2">Activation Summary</h4>
                                <div className="space-y-2 text-sm font-medium">
                                    <div className="flex justify-between"><span className="text-gray-400">Partner:</span> <span>{formData.partnerName}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Contact:</span> <span>+91 {formData.mobile}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Commission Rate:</span> <span className="text-hope-purple font-bold">{formData.commissionSlab}%</span></div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(3)} variant="outline" className="h-14 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} className="h-14 px-8 bg-black hover:bg-gray-800 text-white" isLoading={isSubmitting}>
                                    Send Email Invitation <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
