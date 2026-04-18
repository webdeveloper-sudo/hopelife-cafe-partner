"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Star, Target, Zap, Shield, Globe, LayoutGrid, CheckCircle2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneTrackerProps {
    current: number;
    goal?: number;
    tier?: string;
}

const ICON_MAP: Record<string, any> = {
    Target: Target,
    Star: Star,
    Trophy: Trophy,
    Zap: Zap,
    Shield: Shield,
    Globe: Globe,
    LayoutGrid: LayoutGrid,
    CheckCircle2: CheckCircle2,
    Gift: Gift,
};

export default function MilestoneTracker({ 
    current = 0, 
    goal = 10, 
    tier = "BRONZE",
    baseCommission,
    discountRate
}: { 
    current?: number, 
    goal?: number, 
    tier?: string,
    baseCommission?: number,
    discountRate?: number
}) {
    const [config, setConfig] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    // Use provided props or internal config as fallback
    const displayCommission = baseCommission ?? config?.baseCommission ?? 7.5;
    const displayDiscount = discountRate ?? config?.baseGuestDiscount ?? 7.5;

    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/config');
                const data = await res.json();
                if (data.success) {
                    // Convert array of tiers to a record for easy lookup
                    const tierRecord: Record<string, any> = {};
                    data.tiers.forEach((t: any) => {
                        tierRecord[t.key] = t;
                    });
                    setConfig({
                        tiers: tierRecord,
                        baseCommission: data.baseCommission
                    });
                }
            } catch (err) {
                console.error("Failed to load tier config");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    if (loading || !config) {
        return <div className="h-48 bg-gray-50/50 rounded-md animate-pulse border border-gray-300" />;
    }

    const currentTierConfig = config.tiers[tier] || config.tiers.BRONZE || Object.values(config.tiers)[0];
    if (!currentTierConfig) return null;

    const nextTierConfig = currentTierConfig.next ? config.tiers[currentTierConfig.next] : null;
    
    // Use the goal from props if provided, otherwise from tier config
    const effectiveGoal = goal || currentTierConfig.referralGoal || 10;
    const progress = effectiveGoal > 0 ? Math.min((current / effectiveGoal) * 100, 100) : 0;

    const Icon = ICON_MAP[currentTierConfig.icon] || Target;

    return (
        <div className="relative overflow-hidden bg-white/40 backdrop-blur-xl border border-gray-300 rounded-md p-8 shadow-xl shadow-gray-200/50 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn("w-16 h-16 rounded-md border border-gray-300 bg-gradient-to-br flex items-center justify-center shadow-lg", currentTierConfig.color)}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Achievement</p>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{currentTierConfig.label}</h3>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Base Commission</p>
                        <p className="text-3xl font-black text-hope-green tracking-tighter leading-none">
                            {displayCommission}% 
                            {nextTierConfig && <span className="text-sm text-gray-300 font-bold ml-1">→ Next Level Up</span>}
                        </p>
                    </div>
                    <div className="mt-2 text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Guest Discount</p>
                        <p className="text-lg font-black text-gray-900 tracking-tight leading-none">
                            {displayDiscount}% Flat Off
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-gray-900">
                        {current} / {effectiveGoal} <span className="text-gray-400 ml-1 font-medium">referrals registered</span>
                    </p>
                    <p className="text-sm font-black text-hope-green">
                        {Math.round(progress)}% Complete
                    </p>
                </div>
                
                <div className="h-4 bg-gray-100/50 rounded-md overflow-hidden p-1 shadow-inner ring-1 ring-gray-100">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("h-full rounded-md bg-gradient-to-r shadow-lg", currentTierConfig.color)}
                    />
                </div>

                {nextTierConfig && (
                    <div className="flex items-center gap-2 pt-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <p className="text-xs font-bold text-gray-500 italic">
                            Unlock {nextTierConfig.label} to qualify for a ₹{nextTierConfig.bonus?.toLocaleString()} Milestone Bonus!
                        </p>
                    </div>
                )}
            </div>

            {/* Decorative Jungle Accents */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-hope-green/5 rounded-full blur-3xl -z-10 group-hover:bg-hope-green/10 transition-colors" />
        </div>
    );
}
