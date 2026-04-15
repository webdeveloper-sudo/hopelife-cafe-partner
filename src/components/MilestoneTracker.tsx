"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneTrackerProps {
    current: number;
    goal?: number;
    tier?: string;
}

const tierConfig: Record<string, { label: string; color: string; next: string; icon: any }> = {
    BRONZE: { label: "Bronze Affiliate", color: "from-orange-400 to-orange-700", next: "SILVER", icon: Target },
    SILVER: { label: "Silver Partner", color: "from-slate-300 to-slate-500", next: "GOLD", icon: Star },
    GOLD: { label: "Gold Ambassador", color: "from-yellow-400 to-yellow-600", next: "DIAMOND", icon: Trophy },
    DIAMOND: { label: "Diamond Elite", color: "from-cyan-400 to-blue-600", next: "ELITE", icon: Zap },
    ELITE: { label: "Elite Legend", color: "from-purple-500 to-indigo-700", next: "MAXED", icon: Trophy },
};

export default function MilestoneTracker({ current = 0, goal = 10, tier = "BRONZE" }: MilestoneTrackerProps) {
    const config = tierConfig[tier] || tierConfig.BRONZE;
    const progress = (goal ?? 10) > 0 ? Math.min((current / (goal ?? 10)) * 100, 100) : 0;

    return (
        <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg", config.color)}>
                        <config.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Achievement</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{config.label}</h3>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Commission Slab</p>
                    <p className="text-3xl font-black text-hope-green tracking-tighter">7.5% <span className="text-sm text-gray-300 font-bold ml-1">→ 10%</span></p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-gray-900">
                        {current} / {goal} <span className="text-gray-400 ml-1 font-medium">referrals registered</span>
                    </p>
                    <p className="text-sm font-black text-hope-green">
                        {Math.round(progress)}% Complete
                    </p>
                </div>
                
                <div className="h-4 bg-gray-100/50 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-gray-100">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full bg-gradient-to-r shadow-lg", config.color)}
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <p className="text-xs font-bold text-gray-500 italic">
                        Unlock {config.next} tier to boost your commission to 10% on every bill.
                    </p>
                </div>
            </div>

            {/* Decorative Jungle Accents */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-hope-green/5 rounded-full blur-3xl -z-10 group-hover:bg-hope-green/10 transition-colors" />
        </div>
    );
}
