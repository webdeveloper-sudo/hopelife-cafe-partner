"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Building, Phone, Percent, Receipt, ChevronRight, CheckCircle2, UserCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import QRCode from "react-qr-code";

// Marketing Executive Add Partner Flow
export default function AddPartnerPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [passUrl, setPassUrl] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        partnerName: "",
        contactName: "",
        mobile: "",
        email: "",
        commissionSlab: "7.5",
        bankAccount: "",
        ifsc: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1 && (!formData.partnerName || !formData.contactName || formData.mobile.length !== 10)) return;
        if (step === 2 && (!formData.bankAccount || !formData.ifsc)) return;
        setStep(step + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Registration failed.");
                return;
            }
            setPassUrl(data.passUrl);
            setIsSuccess(true);
        } catch {
            alert("Network error. Please try again.");
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
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Partner Instantly Active!</h2>
                <p className="text-gray-500 max-w-sm mb-8">
                    <span className="font-bold text-gray-900">{formData.partnerName}</span> is now live on the network at the {formData.commissionSlab}% slab.
                </p>

                <div className="bg-hope-purple/5 border border-hope-purple/20 p-6 rounded-2xl w-full max-w-md mb-8">
                    <h3 className="text-sm font-bold text-hope-purple uppercase tracking-widest mb-4">Print QR Standee</h3>
                    <p className="text-xs text-gray-600 mb-5">Scan or hand this QR to the receptionist — guests scan it at the property to get their Live Pass.</p>

                    {/* QR Code */}
                    <div className="bg-white p-5 rounded-xl border border-purple-100 flex justify-center mb-4 shadow-sm">
                        <QRCode
                            value={passUrl}
                            size={180}
                            style={{ height: "auto", maxWidth: "100%", width: "180px" }}
                            level="M"
                        />
                    </div>

                    {/* URL + Copy */}
                    <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 font-mono text-xs text-gray-700 flex justify-between items-center gap-2">
                        <span className="truncate">{passUrl}</span>
                        <Button size="sm" variant="outline" className="h-8 text-xs shrink-0" onClick={() => { navigator.clipboard.writeText(passUrl); }}>Copy</Button>
                    </div>
                </div>

                <Button onClick={() => window.location.reload()} size="lg" className="h-14 px-8">
                    Register Another Partner
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10">
            <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-hope-purple/10 border border-hope-purple/20 rounded-full mb-4">
                    <UserCheck className="w-4 h-4 text-hope-purple" />
                    <span className="text-xs font-bold text-hope-purple uppercase tracking-widest">Marketing Portal</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Onboard New Partner</h1>
                <p className="text-gray-500 font-medium mt-2">Instantly activate a business or agency and issue their QR Standee link.</p>
            </div>

            {/* Progress Track */}
            <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((num) => (
                    <React.Fragment key={num}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= num ? 'bg-hope-purple text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                            {num}
                        </div>
                        {num < 3 && <div className={`h-1 flex-1 rounded-full transition-colors ${step > num ? 'bg-hope-purple' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 overflow-hidden">
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
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-hope-purple"
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
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-hope-purple"
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
                                                className="block w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-hope-purple"
                                                placeholder="99999 99999"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <Button onClick={nextStep} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.partnerName || !formData.contactName || formData.mobile.length !== 10}>
                                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
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
                                <Receipt className="w-5 h-5 text-hope-purple" /> Payout Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Account Number</label>
                                    <input
                                        type="password"
                                        name="bankAccount"
                                        value={formData.bankAccount}
                                        onChange={handleChange}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-hope-purple font-mono tracking-widest"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">IFSC Code</label>
                                    <input
                                        type="text"
                                        name="ifsc"
                                        value={formData.ifsc}
                                        onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-hope-purple font-mono uppercase"
                                        placeholder="HDFC0001234"
                                        maxLength={11}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(1)} variant="outline" className="h-12 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={nextStep} className="h-12 px-8 bg-hope-purple hover:bg-purple-700 text-white" disabled={!formData.bankAccount || formData.ifsc.length < 5}>
                                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
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
                                <Percent className="w-5 h-5 text-hope-purple" /> Agreement & Activation
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div
                                    onClick={() => setFormData({ ...formData, commissionSlab: "7.5" })}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.commissionSlab === "7.5" ? 'border-hope-purple bg-purple-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Standard</span>
                                        {formData.commissionSlab === "7.5" && <CheckCircle2 className="w-4 h-4 text-hope-purple" />}
                                    </div>
                                    <span className="text-3xl font-black text-gray-900">7.5%</span>
                                </div>

                                <div
                                    onClick={() => setFormData({ ...formData, commissionSlab: "10.0" })}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.commissionSlab === "10.0" ? 'border-hope-purple bg-purple-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-hope-purple">Premium</span>
                                        {formData.commissionSlab === "10.0" && <CheckCircle2 className="w-4 h-4 text-hope-purple" />}
                                    </div>
                                    <span className="text-3xl font-black text-gray-900">10%</span>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-xl p-6 text-white shadow-xl">
                                <h4 className="font-bold mb-4 border-b border-gray-800 pb-2">Activation Summary</h4>
                                <div className="space-y-2 text-sm font-medium">
                                    <div className="flex justify-between"><span className="text-gray-400">Partner:</span> <span>{formData.partnerName}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Contact:</span> <span>+91 {formData.mobile}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Commission Rate:</span> <span className="text-hope-purple font-bold">{formData.commissionSlab}%</span></div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <Button onClick={() => setStep(2)} variant="outline" className="h-14 px-8 text-gray-500 hover:text-gray-900 border-gray-200">
                                    Back
                                </Button>
                                <Button onClick={handleSubmit} className="h-14 px-8 bg-black hover:bg-gray-800 text-white" isLoading={isSubmitting}>
                                    Activate Partner <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
