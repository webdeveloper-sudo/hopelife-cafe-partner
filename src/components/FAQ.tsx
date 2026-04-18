"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "How do I get paid?",
        answer: "Payouts are processed every Monday directly to your registered bank account. You can track your 'Net Profit' in real-time on your Partner Dashboard."
    },
    {
        question: "Is there a limit to how much I can earn?",
        answer: "No. There is absolutely no cap on your earnings. The more guests you refer to HOPE Cafe, the more you earn. Some of our top partners earn over ₹50,000 monthly."
    },
    {
        question: "How long does verification take?",
        answer: "Once you register, our team typically verifies your business within 24–48 hours. You will receive an email confirmation once your unique QR code is active."
    },
    {
        question: "Can I refer guests if I don't have a business?",
        answer: "Yes! While we primarily partner with hospitality businesses, individual tour guides and local influencers are also welcome to join the network."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                    <div
                        key={idx}
                        className={cn(
                            "rounded-md border-2 transition-all duration-300",
                            isOpen ? "border-hope-green bg-white shadow-xl shadow-hope-green/5" : "border-gray-300 bg-gray-50/50"
                        )}
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                            className="w-full px-8 py-6 flex items-center justify-between text-left"
                            suppressHydrationWarning
                        >
                            <span className={cn(
                                "font-bold text-lg transition-colors",
                                isOpen ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                            )}>
                                {faq.question}
                            </span>
                             <div className={cn(
                                "w-10 h-10 rounded-md border border-gray-300 flex items-center justify-center transition-all",
                                isOpen ? "bg-hope-green text-white rotate-180" : "bg-white text-gray-400"
                            )}>
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </button>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
