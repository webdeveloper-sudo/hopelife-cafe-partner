"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    HelpCircle,
    MessageSquare,
    Book,
    Mail,
    Phone,
    ArrowUpRight,
    Search
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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

export default function PartnerSupportPage() {
    const faqs = [
        { q: "How are commission percentages calculated?", a: "Commissions are based on your current performance tier (Silver, Gold, Platinum). You can track your tier in the 'Referrals' log." },
        { q: "When do I receive my weekly payouts?", a: "Settlements are processed every Monday for the previous week's confirmed registrations." },
        { q: "Can I refer guests from outside Pondicherry?", a: "Yes, our hospitality network is expanding globally. You earn for any confirmed booking regardless of location." },
        { q: "How do I update my bank details?", a: "You can update your settlement info in the 'Settings' module under the Bank & Payouts tab." },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 py-12">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Partner Support Hub</h1>
                <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
                    We're here to help you maximize your referral earnings. Explore our knowledge base or contact a dedicated partner success manager.
                </p>
                <div className="relative max-w-xl mx-auto mt-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input className="pl-14 h-16 rounded-3xl bg-white shadow-2xl shadow-gray-200/50 border-transparent focus:ring-hope-purple focus:ring-2" placeholder="Search for answers..." />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Partner Guide", icon: Book, desc: "Step-by-step onboarding and strategy.", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Community Forum", icon: MessageSquare, desc: "Connect with other elite partners.", color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Live Support", icon: HelpCircle, desc: "24/7 dedicated assistance.", color: "text-hope-purple", bg: "bg-hope-purple/10" },
                ].map((card, idx) => (
                    <motion.div key={idx} variants={item}>
                        <Card className="border-none bg-white shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all cursor-pointer group">
                            <CardContent className="p-8">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", card.bg)}>
                                    <card.icon className={cn("w-8 h-8", card.color)} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">{card.label}</h3>
                                <p className="text-sm text-gray-500 font-medium mt-2">{card.desc}</p>
                                <Button variant="ghost" className="mt-6 p-0 h-auto text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-hope-purple transition-all gap-2">
                                    Explore <ArrowUpRight className="w-3 h-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-8">
                {/* FAQs */}
                <motion.div variants={item} className="lg:col-span-3 space-y-6">
                    <h2 className="text-2xl font-black text-gray-900 px-2 tracking-tight">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <Card key={i} className="border-none bg-white shadow-lg shadow-gray-100/50 overflow-hidden group hover:shadow-xl transition-all">
                                <CardContent className="p-0">
                                    <details className="group">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                            <span className="font-extrabold text-gray-900 text-sm group-open:text-hope-purple transition-all">{faq.q}</span>
                                            <span className="text-gray-300 transform group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="px-6 pb-6 text-sm text-gray-600 font-medium leading-relaxed">
                                            {faq.a}
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Contact Section */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="border-none bg-gray-950 text-white shadow-2xl shadow-black/10 overflow-hidden sticky top-8">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-black">Still need help?</h2>
                            <p className="text-gray-400 text-sm mt-2 font-medium">Contact our specialized hospitality success team.</p>

                            <div className="space-y-6 mt-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Email Us</p>
                                        <p className="text-sm font-bold mt-1">support@hopecafe.network</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Call Support</p>
                                        <p className="text-sm font-bold mt-1">+91 413 222 1080</p>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-hope-purple hover:bg-purple-700 text-white rounded-2xl mt-12 font-black text-sm uppercase tracking-widest shadow-xl shadow-hope-purple/20">
                                Open Support Ticket
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
