"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    CheckCircle2, ArrowRight, Mail, ShieldCheck,
    Building2, Phone, MapPin, User, ChevronRight,
    Timer, RefreshCw, Loader2, Lock, ClockIcon
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

type Step = "form" | "otp" | "hold";

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
}

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("form");
    const [formData, setFormData] = useState<FormData>({
        partnerName: "", contactName: "", email: "", mobile: "",
        businessType: "", address: "", city: "Pondicherry", pincode: "", upiId: ""
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [verificationToken, setVerificationToken] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const validate = (): boolean => {
        const e: Partial<FormData> = {};
        if (!formData.partnerName.trim()) e.partnerName = "Business name is required";
        if (!formData.contactName.trim()) e.contactName = "Contact name is required";
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Valid email is required";
        if (!formData.mobile || formData.mobile.replace(/\D/g, "").length < 10) e.mobile = "Valid phone number is required";
        if (!formData.businessType) e.businessType = "Business type is required";
        if (!formData.address.trim()) e.address = "Address is required";
        if (!formData.city.trim()) e.city = "City is required";
        if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) e.pincode = "Valid 6-digit pincode required";
        if (!formData.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) e.upiId = "Valid UPI ID is required for settlements";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/partner/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");
            toast.success(`OTP sent to ${formData.email}`);
            setStep("otp");
            setResendTimer(60);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
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
        if (otp.length < 6) { setOtpError("Please enter all 6 digits"); return; }
        setIsVerifying(true);
        try {
            const res = await fetch("/api/partner/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "OTP verification failed");

            setVerificationToken(data.verificationToken);

            // Now register the partner
            const regRes = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, verificationToken: data.verificationToken }),
            });
            const regData = await regRes.json();
            if (!regRes.ok) throw new Error(regData.error || "Registration failed");

            setStep("hold");
        } catch (err: any) {
            setOtpError(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/partner/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("New OTP sent!");
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");
            setResendTimer(60);
            otpRefs.current[0]?.focus();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const field = (
        label: string,
        key: keyof FormData,
        placeholder: string,
        type = "text",
        className = ""
    ) => (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
            <Input
                type={type}
                value={formData[key]}
                onChange={e => { setFormData(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: undefined })); }}
                placeholder={placeholder}
                error={!!errors[key]}
                className="h-12"
            />
            {errors[key] && <p className="text-[10px] text-red-500">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl">
                <AnimatePresence mode="wait">

                    {/* ── STEP 1: FORM ── */}
                    {step === "form" && (
                        <motion.div key="form" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.4 }}>
                            <div className="bg-white rounded-md border border-gray-300 shadow-2xl shadow-gray-200/60 overflow-hidden grid grid-cols-1 md:grid-cols-5">
                                {/* Left panel */}
                                <div className="md:col-span-2 bg-gradient-to-br from-[#1a6b3a] to-[#2aab5a] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                                    <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/5 rounded-full" />
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-white rounded-md border border-gray-300 flex items-center justify-center mb-8 shadow-xl overflow-hidden">
                                            <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        </div>
                                        <h2 className="text-3xl font-black mb-3 leading-tight">Join the <br />Elite Network</h2>
                                        <p className="text-white/70 text-sm mb-8">Become a partner and earn commissions on every guest you refer.</p>
                                        <div className="space-y-4">
                                            {[
                                                `Earn ${displayComm}% on every referred guest bill`,
                                                `₹${displayBonus} instant welcome bonus on approval`,
                                                "Direct weekly payouts to your bank",
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
                                        <h1 className="text-3xl font-black text-gray-900">Partner Registration</h1>
                                        <p className="text-gray-400 text-sm mt-1">Fill in your details. We'll send an OTP to verify your email.</p>
                                    </div>
                                    <form onSubmit={handleFormSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {field("Business Name", "partnerName", "e.g. Sea Side Travels")}
                                            {field("Contact Person", "contactName", "Your full name")}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {field("Email Address", "email", "you@business.com", "email")}
                                            {field("Phone Number", "mobile", "+91 98765 43210", "tel")}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Type</label>
                                            <select
                                                value={formData.businessType}
                                                onChange={e => { setFormData(f => ({ ...f, businessType: e.target.value })); setErrors(er => ({ ...er, businessType: undefined })); }}
                                                className={`flex h-12 w-full rounded-md border-2 bg-white px-4 text-sm transition-all outline-none ${errors.businessType ? "border-red-400" : "border-gray-300 focus:border-[#1a6b3a]"}`}
                                            >
                                                <option value="">Select business category</option>
                                                {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                                            </select>
                                            {errors.businessType && <p className="text-[10px] text-red-500">{errors.businessType}</p>}
                                        </div>
                                        {field("Full Address", "address", "Street name, area", "text")}
                                        <div className="grid grid-cols-2 gap-4">
                                            {field("City", "city", "Pondicherry")}
                                            {field("Pincode", "pincode", "605001")}
                                        </div>

                                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> Critical Information</p>
                                            {field("UPI ID (For Settlements)", "upiId", "yourname@upi")}
                                            <p className="text-[10px] text-red-500 mt-2 font-medium leading-relaxed">Ensure this UPI ID is active and accurate. All your referral commissions will be settled exclusively to this account.</p>
                                        </div>

                                        <Button type="submit" className="w-full h-13 text-base font-bold mt-2" isLoading={isSubmitting}>
                                            Send OTP to Email <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                        <p className="text-center text-[10px] text-gray-400">Already a partner? <a href="/login" className="text-[#1a6b3a] font-bold">Login here</a></p>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: OTP ── */}
                    {step === "otp" && (
                        <motion.div key="otp" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.4 }}>
                            <div className="bg-white rounded-md border border-gray-300 shadow-2xl shadow-gray-200/60 max-w-lg mx-auto overflow-hidden">
                                <div className="bg-gradient-to-br from-[#1a6b3a] to-[#2aab5a] p-10 text-center">
                                    <div className="w-20 h-20 bg-white/20 rounded-md border border-white/20 flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white">Check your email</h2>
                                    <p className="text-white/70 text-sm mt-2">We sent a 6-digit code to</p>
                                    <p className="text-white font-black text-lg mt-1">{formData.email}</p>
                                </div>
                                <div className="p-10">
                                    <p className="text-sm text-gray-500 text-center mb-8">Enter the 6-digit verification code below</p>

                                    {/* OTP Input */}
                                    <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
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
                                                    otpError ? "border-red-400 bg-red-50" :
                                                    digit ? "border-[#1a6b3a] bg-green-50 text-[#1a6b3a]" :
                                                    "focus:border-[#1a6b3a]"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {otpError && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-red-500 font-medium mb-4">
                                            {otpError}
                                        </motion.p>
                                    )}

                                    <Button
                                        onClick={handleVerifyOtp}
                                        className="w-full h-13 text-base font-bold"
                                        disabled={otpDigits.join("").length < 6}
                                        isLoading={isVerifying}
                                    >
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        Verify & Register
                                    </Button>

                                    <div className="flex items-center justify-between mt-6">
                                        <button
                                            onClick={() => setStep("form")}
                                            className="text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors"
                                        >
                                            ← Change email
                                        </button>
                                        <button
                                            onClick={handleResendOtp}
                                            disabled={resendTimer > 0 || isSubmitting}
                                            className="flex items-center gap-1.5 text-xs font-bold text-[#1a6b3a] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {resendTimer > 0 ? (
                                                <><Timer className="w-3.5 h-3.5" /> Resend in {resendTimer}s</>
                                            ) : (
                                                <><RefreshCw className="w-3.5 h-3.5" /> Resend OTP</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: HOLD PAGE ── */}
                    {step === "hold" && (
                        <motion.div key="hold" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                            <div className="bg-white rounded-md border border-gray-300 shadow-2xl shadow-gray-200/60 max-w-lg mx-auto overflow-hidden">
                                <div className="bg-gradient-to-br from-[#1a6b3a] to-[#2aab5a] p-12 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="absolute rounded-full bg-white" style={{
                                                width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
                                                top: "50%", left: "50%",
                                                transform: "translate(-50%,-50%)",
                                                opacity: 0.08 + i * 0.03
                                            }} />
                                        ))}
                                    </div>
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                        className="w-24 h-24 bg-white rounded-md border border-gray-300 flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10"
                                    >
                                        <CheckCircle2 className="w-14 h-14 text-[#1a6b3a]" />
                                    </motion.div>
                                    <h2 className="text-3xl font-black text-white relative z-10">Application Submitted!</h2>
                                    <p className="text-white/80 mt-2 font-medium relative z-10">You're almost there.</p>
                                </div>
                                <div className="p-10 text-center">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-green-50 rounded-md border border-gray-300 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-[#1a6b3a]" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Status</p>
                                            <p className="text-base font-black text-gray-900">Auto-Approved</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                        Your partner account has been automatically approved! We have just sent an email to{" "}
                                        <strong className="text-gray-800">{formData.email}</strong> with a secure link to set your password and access your partner dashboard.
                                    </p>

                                    <div className="space-y-3 text-left bg-gray-50 rounded-md border border-gray-300 p-5">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Next Steps</p>
                                        {[
                                            "Check your email inbox or spam folder",
                                            "Click the secure password setup link",
                                            "Log in and start earning commissions!",
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-[#1a6b3a] rounded-full flex items-center justify-center shrink-0">
                                                    <span className="text-white text-[10px] font-black">{i + 1}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">{s}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <a href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#1a6b3a] hover:underline">
                                        Return to Homepage <ChevronRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
