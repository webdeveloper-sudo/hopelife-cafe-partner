"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function EarningsCalculator({ 
    initialCommission = 7.5 
}: { 
    initialCommission?: number 
}) {
    const [guests, setGuests] = React.useState(20);
    const [avgBill, setAvgBill] = React.useState(1200);
    const [commission, setCommission] = React.useState(initialCommission);

    const monthlyComm = (guests * avgBill * (commission / 100));
    const annualComm = monthlyComm * 12;

    return (
        <Card className="border border-gray-300 shadow-3xl bg-gradient-to-br from-hope-purple to-hope-green rounded-md overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_-15px_rgba(45,106,79,0.3)]">
            {/* Left Side: Light  Estimator */}
            <div className="bg-white p-8 md:p-12 md:w-[55%] flex flex-col justify-center rounded-r-md md:rounded-r-md relative z-10 shadow-2xl shadow-purple-950/10 border-r border-gray-300">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-hope-green/10 border border-hope-green/20 mb-6">
                        <Calculator className="w-3.5 h-3.5 text-hope-green" />
                        <span className="text-[10px] font-black text-hope-green uppercase tracking-widest">Revenue Estimator</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-3">Estimate Your<br />Earnings</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">See how much you could earn by referring your guests.</p>
                </div>

                <div className="space-y-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Guests per Month</label>
                            <span className="text-xl font-black text-gray-900">{guests}</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="200"
                            step="5"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-md appearance-none cursor-pointer accent-hope-green"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Avg. Bill Amount</label>
                            <span className="text-xl font-black text-gray-900">₹{avgBill}</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="5000"
                            step="100"
                            value={avgBill}
                            onChange={(e) => setAvgBill(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-md appearance-none cursor-pointer accent-hope-green"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Commission Rate</label>
                            <span className="text-xl font-black text-gray-900">{commission}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="0.5"
                            value={commission}
                            onChange={(e) => setCommission(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-md appearance-none cursor-pointer accent-hope-green"
                        />
                    </div>
                </div>
            </div>

            {/* Right Side: Results Section */}
            <div className="bg-transparent p-8 md:p-12 md:w-[45%] flex flex-col justify-center relative -ml-6 md:-ml-8 z-0">
                <div className="space-y-10 pl-6 md:pl-10">
                    <div>
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Estimated Monthly Income</p>
                        <motion.p
                            key={monthlyComm}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl lg:text-5xl font-black text-white tracking-tighter shadow-sm"
                        >
                            ₹{monthlyComm.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </motion.p>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Annual Potential</p>
                        <p className="text-3xl font-black text-hope-gold tracking-tight drop-shadow-md">₹{annualComm.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>

                    <div className="pt-6">
                        <Link href="/register" className="w-full block">
                             <Button className="w-full h-14 bg-hope-gold text-gray-900 hover:bg-white rounded-md border border-gray-300 font-black text-sm lg:text-base transition-all shadow-xl shadow-black/10 hover:scale-[1.02] group px-4" aria-label="Start earning now with HOPE Cafe">
                                <span className="flex items-center justify-center whitespace-nowrap gap-2">
                                    Start Earning Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>
                        </Link>
                        <p className="text-[10px] text-white/50 mt-5 text-center font-medium italic">
                            *Based on selected {commission}% commission slab.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
}
