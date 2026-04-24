"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Smartphone, User, ArrowRight, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";
import { AuthLayout } from "@/components/AuthLayout";

export default function GuestRegistrationPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const unwrappedParams = React.use(params);
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [successData, setSuccessData] = useState<{ guestId: string } | null>(null);
    const [partnerData, setPartnerData] = useState<{ name: string, discount: number } | null>(null);

    React.useEffect(() => {
        const fetchPartner = async () => {
            try {
                const res = await fetch(`/api/partner/details?code=${unwrappedParams.partnerId}`);
                const data = await res.json();
                if (data.success) {
                    setPartnerData({ name: data.name, discount: data.discount });
                }
            } catch (e) {
                console.error("Failed to fetch partner info");
            }
        };
        fetchPartner();
    }, [unwrappedParams.partnerId]);

    const partnerName = partnerData?.name || (unwrappedParams.partnerId === "demo" ? "Grand Hope Cafe" : `Partner #${unwrappedParams.partnerId}`);
    const discountSlab = partnerData?.discount || 7.5;

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mobile.length !== 10 || !name.trim()) return;

        setIsGenerating(true);

        try {
            const response = await fetch("/api/guest/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    mobile,
                    partnerId: unwrappedParams.partnerId
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData({ guestId: data.guestId });
                toast.success("Live pass generated successfully!");
            } else {
                toast.error(data.error || "Failed to register.");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AuthLayout>
            <div className="mx-auto w-full max-w-md">
                {/* Header Branding */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-gray-300 overflow-hidden p-2 transition-transform hover:scale-105 duration-500">
                        <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-fit" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tighter">HOPE Cafe</h1>
                    <p className="text-white/70 font-medium text-sm mt-1">Special Guest Pass via {partnerName}</p>
                </div>

                <AnimatePresence mode="wait">
                    {!successData ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-md shadow-2xl shadow-black/20 border border-gray-300"
                        >
                            <div className="mb-8 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-4">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Claim Your {discountSlab}% Discount</h2>
                                <p className="text-sm text-gray-500">Register to generate your unique Live Discount Pass.</p>
                            </div>

                            <form onSubmit={handleGenerate} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                                            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-md text-lg font-bold text-gray-900 focus:ring-2 focus:ring-hope-green focus:border-hope-green transition-all placeholder:text-gray-300 placeholder:font-normal"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Smartphone className="h-5 w-5 text-gray-400" />
                                            <span className="ml-2 text-gray-900 font-medium">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full pl-20 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-md text-lg font-bold text-gray-900 focus:ring-2 focus:ring-hope-green focus:border-hope-green transition-all placeholder:text-gray-300 placeholder:font-normal"
                                            placeholder="99999 99999"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={mobile.length !== 10 || !name.trim() || isGenerating}
                                    className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
                                    isLoading={isGenerating}
                                >
                                    Generate Live Pass <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Zero Friction Transfer</p>
                                <p className="text-xs text-gray-500 mt-1">We will send you a seamless validation link to show at checkout to enforce non-transferability.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-md shadow-2xl shadow-black/20 border border-gray-300 text-center"
                        >
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                             <h2 className="text-2xl font-black text-gray-900 mb-2">Registration Successful!</h2>
                             <p className="text-gray-500 mb-8 font-medium">
                                 Your Special Guest Pass is ready. Use the buttons below to copy the link or view your pass.
                             </p>

                             <div className="space-y-4">
                                <Button 
                                    onClick={() => {
                                        const url = `${window.location.origin}/pass/${successData.guestId}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Pass link copied!");
                                    }}
                                    className="w-full h-14 bg-gray-900 text-white font-black uppercase tracking-widest gap-2"
                                >
                                    <Copy className="w-5 h-5" /> Copy Pass Link
                                </Button>
                                <Link href={`/pass/${successData.guestId}`} className="block">
                                    <Button variant="outline" className="w-full h-14 border-gray-300 font-black uppercase tracking-widest gap-2">
                                        <ExternalLink className="w-5 h-5" /> View Live Pass
                                    </Button>
                                </Link>
                             </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AuthLayout>
    );
}
