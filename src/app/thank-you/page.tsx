"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Coffee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full py-12 px-8 bg-green-50/30 rounded-md border border-gray-300 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-hope-purple/10 rounded-full blur-2xl" />

                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-green-500 opacity-20"
                    />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Success!</h1>
                <p className="text-xl font-bold text-green-700 mb-6 uppercase tracking-widest text-sm">
                    Your referral pass has been redeemed.
                </p>
                <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                    Thank you for visiting HOPE Cafe. We hope you enjoyed your experience and your special referral discount.
                </p>

                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm">
                        <Coffee className="w-5 h-5 text-hope-purple" />
                        <span className="text-sm font-bold text-gray-700">See you again soon!</span>
                    </div>
                    
                    <Link href="/">
                        <Button className="w-full h-14 mt-4 text-lg font-black uppercase tracking-widest">
                            Return Home
                        </Button>
                    </Link>
                </div>

                <div className="mt-10 flex justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HOPE Cafe Experience</span>
                </div>
            </motion.div>
        </div>
    );
}
