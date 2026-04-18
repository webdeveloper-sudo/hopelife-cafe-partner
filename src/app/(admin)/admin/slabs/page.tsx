"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings2,
    Zap,
    Gift,
    Percent,
    ArrowUpRight,
    Target,
    X,
    Shield,
    Globe,
    Plus,
    Trophy,
    Star,
    LayoutGrid,
    ChevronRight,
    Search,
    Trash2,
    Save,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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

export default function AdminSlabsPage() {
    const [loading, setLoading] = React.useState(true);
    const [config, setConfig] = React.useState<any>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    // Edit states for Tiers
    const [showTierModal, setShowTierModal] = React.useState(false);
    const [editingTierIndex, setEditingTierIndex] = React.useState<number | null>(null);
    const [tempTier, setTempTier] = React.useState<any>({
        key: '',
        label: '',
        color: 'from-orange-400 to-orange-700',
        icon: 'Target',
        referralGoal: 0,
        nextTier: '',
        bonus: 0
    });

    React.useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/config');
            const data = await res.json();
            if (data.success && data.config) {
                setConfig(data.config);
            }
        } catch (err) {
            toast.error("Failed to load fee architecture.");
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (update: any) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'PATCH',
                body: JSON.stringify(update)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Architecture updated and deployed.");
                setConfig(data.config);
                return true;
            }
        } catch (err) {
            toast.error("Failed to sync with system.");
        } finally {
            setIsSaving(false);
        }
        return false;
    };

    const toggleMaintenance = async () => {
        await saveConfig({ maintenanceMode: !config.maintenanceMode });
    };

    const handleOpenTierModal = (index: number | null = null) => {
        if (index !== null) {
            setEditingTierIndex(index);
            setTempTier({ ...config.tiers[index] });
        } else {
            setEditingTierIndex(null);
            setTempTier({
                key: '',
                label: '',
                color: 'from-orange-400 to-orange-700',
                icon: 'Target',
                referralGoal: 0,
                nextTier: '',
                bonus: 0
            });
        }
        setShowTierModal(true);
    };

    const handleSaveTier = async () => {
        if (!tempTier.key || !tempTier.label) {
            toast.error("Please fill in essential tier details.");
            return;
        }

        let newTiers = [...(config.tiers || [])];
        if (editingTierIndex !== null) {
            newTiers[editingTierIndex] = tempTier;
        } else {
            newTiers.push(tempTier);
        }

        const success = await saveConfig({ tiers: newTiers });
        if (success) {
            setShowTierModal(false);
        }
    };

    const handleDeleteTier = async (index: number) => {
        if (!confirm("Are you sure you want to delete this tier? Partners assigned to this tier will be reassigned.")) return;
        
        const newTiers = config.tiers.filter((_: any, i: number) => i !== index);
        await saveConfig({ tiers: newTiers });
    };

    if (loading || !config) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-hope-green border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Syncing Architecture...</p>
            </div>
        </div>
    );

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto pb-20 space-y-12">
            
            {/* Maintenance Mode Header */}
            <motion.div variants={item} className="relative overflow-hidden bg-white border border-gray-300 rounded-md p-1 shadow-2xl shadow-gray-200/50">
                <div className={cn(
                    "flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-10 rounded-md border border-gray-300 transition-colors duration-700",
                    config.maintenanceMode ? "bg-red-50/50" : "bg-white"
                )}>
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "w-20 h-20 rounded-md border border-gray-300 flex items-center justify-center transition-all duration-700 shadow-lg",
                            config.maintenanceMode ? "bg-red-500 shadow-red-200" : "bg-hope-green shadow-hope-green/20"
                        )}>
                            <Shield className={cn("w-10 h-10 text-white transition-all", config.maintenanceMode && "animate-pulse")} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">System Status</h1>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
                                Current State: <span className={cn("ml-1", config.maintenanceMode ? "text-red-600" : "text-hope-green")}>
                                    {config.maintenanceMode ? "Maintenance Mode Active" : "Operational & Liquid"}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div 
                        onClick={toggleMaintenance}
                        className={cn(
                            "w-24 h-12 rounded-full relative cursor-pointer p-1.5 transition-all duration-500",
                            config.maintenanceMode ? "bg-red-500" : "bg-gray-100"
                        )}
                    >
                        <motion.div 
                            layout
                            className="w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center"
                            animate={{ x: config.maintenanceMode ? "100%" : "0%" }}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full", config.maintenanceMode ? "bg-red-500" : "bg-gray-300")} />
                        </motion.div>
                        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                            <span className={cn("text-[8px] font-black uppercase transition-opacity", config.maintenanceMode ? "opacity-0" : "opacity-100 text-gray-400")}>Off</span>
                            <span className={cn("text-[8px] font-black uppercase transition-opacity", config.maintenanceMode ? "opacity-100 text-white" : "opacity-0")}>On</span>
                        </div>
                    </div>
                </div>

                {config.maintenanceMode && (
                    <div className="px-12 py-6 bg-red-600 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
                        <p className="text-[10px] text-white font-black uppercase tracking-[0.2em]">WARNING: Registration and Retention bonuses are currently suppressed.</p>
                    </div>
                )}
            </motion.div>

            {/* Global Slabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div variants={item}>
                    <Card className="border border-gray-300 shadow-2xl shadow-gray-200/50 rounded-md overflow-hidden group">
                        <CardHeader className="bg-white p-10 border-b border-gray-300 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center">
                                    <Percent className="w-6 h-6 text-hope-green" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Commission Slab</CardTitle>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global Partner Default</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="relative group/input">
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={config.baseCommission}
                                    onChange={(e) => setConfig({ ...config, baseCommission: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-gray-50 rounded-md h-28 text-6xl font-black text-center text-gray-900 border-4 border-gray-300 focus:border-hope-green/20 focus:outline-none transition-all tracking-tighter"
                                />
                                <span className="absolute right-12 top-1/2 -translate-y-1/2 text-4xl font-black text-gray-300 tracking-tighter group-focus-within/input:text-hope-green transition-colors">%</span>
                            </div>
                            <Button 
                                onClick={() => saveConfig({ baseCommission: config.baseCommission })}
                                disabled={isSaving}
                                className="w-full mt-8 h-16 bg-gray-900 text-white rounded-md border border-gray-300 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-gray-900/10 hover:shadow-gray-900/30 active:scale-95 transition-all"
                            >
                                Update Global Commission
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border border-gray-300 shadow-2xl shadow-gray-200/50 rounded-md overflow-hidden group">
                        <CardHeader className="bg-white p-10 border-b border-gray-300 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-md border border-gray-300 flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Discount Slab</CardTitle>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global Guest Default</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="relative group/input">
                                <input 
                                    type="number"
                                    step="0.1"
                                    value={config.baseGuestDiscount}
                                    onChange={(e) => setConfig({ ...config, baseGuestDiscount: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-gray-50 rounded-md h-28 text-6xl font-black text-center text-gray-900 border-4 border-gray-300 focus:border-blue-100 focus:outline-none transition-all tracking-tighter"
                                />
                                <span className="absolute right-12 top-1/2 -translate-y-1/2 text-4xl font-black text-gray-300 tracking-tighter group-focus-within/input:text-blue-500 transition-colors">%</span>
                            </div>
                            <Button 
                                onClick={() => saveConfig({ baseGuestDiscount: config.baseGuestDiscount })}
                                disabled={isSaving}
                                className="w-full mt-8 h-16 bg-gray-900 text-white rounded-md border border-gray-300 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-gray-900/10 hover:shadow-gray-900/30 active:scale-95 transition-all"
                            >
                                Update Global Discount
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tier Configuration */}
            <motion.div variants={item}>
                <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/50 rounded-md overflow-hidden">
                    <CardHeader className="p-14 border-b border-gray-300 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <CardTitle className="text-4xl font-black uppercase tracking-tighter">Tier Architecture</CardTitle>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure progression gates and incentives</p>
                        </div>
                        <Button
                            onClick={() => handleOpenTierModal()}
                            className="h-16 gap-3 bg-gray-900 hover:bg-black text-white px-10 rounded-md border border-gray-300 font-black uppercase tracking-widest text-xs shadow-2xl shadow-gray-900/20 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5 mr-1" /> Add New Tier
                        </Button>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {(config.tiers || []).map((tier: any, i: number) => {
                                    const Icon = ICON_MAP[tier.icon] || Target;
                                    return (
                                        <motion.div 
                                            key={tier.key || i}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-md border border-gray-300 transition-all group-hover:shadow-2xl group-hover:shadow-gray-200/50 -z-10" />
                                            <div className="p-10 flex flex-col items-center">
                                                <div className={cn(
                                                    "w-24 h-24 rounded-md border border-gray-300 bg-gradient-to-br flex items-center justify-center shadow-xl mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3",
                                                    tier.color
                                                )}>
                                                    <Icon className="w-10 h-10 text-white" />
                                                </div>
                                                
                                                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-1">{tier.label}</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">{tier.key}</p>

                                                <div className="w-full space-y-3 mb-10">
                                                    <div className="flex items-center justify-between p-5 bg-white rounded-md border border-gray-300 shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Path</span>
                                                        <span className="font-black text-gray-900">{tier.referralGoal || '∞'} Refs</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-5 bg-white rounded-md border border-gray-300 shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unlock Bonus</span>
                                                        <span className={cn("font-black", tier.bonus > 0 ? "text-hope-green" : "text-gray-300")}>
                                                            ₹{tier.bonus?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 w-full">
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleOpenTierModal(i)}
                                                        className="flex-1 h-14 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-300 font-black text-[10px] uppercase tracking-widest"
                                                    >
                                                        Edit Rules
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        onClick={() => handleDeleteTier(i)}
                                                        className="w-14 h-14 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-md border border-gray-300 transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tier Edit Modal */}
            {showTierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowTierModal(false)}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-2xl bg-white rounded-md border border-gray-300 shadow-2xl overflow-hidden p-14"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className={cn("w-20 h-20 rounded-md border border-gray-300 bg-gradient-to-br flex items-center justify-center shadow-lg", tempTier.color)}>
                                {(() => {
                                    const Icon = ICON_MAP[tempTier.icon] || Target;
                                    return <Icon className="w-10 h-10 text-white" />;
                                })()}
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                                    {editingTierIndex !== null ? 'Re-Architecture' : 'Tier Synthesis'}
                                </h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Design partner progression logic</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tier Key (Immutable ID)</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. SAPPHIRE"
                                        value={tempTier.key}
                                        disabled={editingTierIndex !== null}
                                        onChange={(e) => setTempTier({ ...tempTier, key: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                                        className="w-full h-16 bg-gray-50 rounded-md border border-gray-300 px-6 font-bold text-gray-900 focus:border-gray-900/10 focus:outline-none transition-all disabled:opacity-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Label</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. Sapphire Legend"
                                        value={tempTier.label}
                                        onChange={(e) => setTempTier({ ...tempTier, label: e.target.value })}
                                        className="w-full h-16 bg-gray-50 rounded-md border border-gray-300 px-6 font-bold text-gray-900 focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Goal (Referrals)</label>
                                    <input
                                        type="number"
                                        placeholder="E.g. 500"
                                        value={tempTier.referralGoal}
                                        onChange={(e) => setTempTier({ ...tempTier, referralGoal: parseInt(e.target.value) || 0 })}
                                        className="w-full h-16 bg-gray-50 rounded-md border border-gray-300 px-6 font-bold text-gray-900 focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Achievement Bonus (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="E.g. 10000"
                                        value={tempTier.bonus}
                                        onChange={(e) => setTempTier({ ...tempTier, bonus: parseInt(e.target.value) || 0 })}
                                        className="w-full h-16 bg-gray-50 rounded-md border border-gray-300 px-6 font-bold text-gray-900 focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gradient Theme</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            'from-orange-400 to-orange-700',
                                            'from-slate-300 to-slate-500',
                                            'from-yellow-400 to-yellow-600',
                                            'from-cyan-400 to-blue-600',
                                            'from-purple-500 to-indigo-700',
                                            'from-red-500 to-pink-700',
                                            'from-emerald-400 to-teal-700',
                                            'from-gray-800 to-black'
                                        ].map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setTempTier({ ...tempTier, color: c })}
                                                className={cn(
                                                    "h-10 rounded-md bg-gradient-to-br border border-gray-300 transition-all",
                                                    c,
                                                    tempTier.color === c ? "border-gray-900 scale-110 shadow-lg" : "opacity-60 hover:opacity-100"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Symbol Mapping</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.keys(ICON_MAP).map(k => {
                                            const Icon = ICON_MAP[k];
                                            return (
                                                <button 
                                                    key={k}
                                                    onClick={() => setTempTier({ ...tempTier, icon: k })}
                                                    className={cn(
                                                        "h-10 rounded-md flex items-center justify-center border border-gray-300 transition-all",
                                                        tempTier.icon === k ? "border-gray-900 bg-gray-50 scale-110" : "bg-white opacity-40 hover:opacity-100"
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4 text-gray-900" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <Button variant="ghost" className="flex-1 h-18 rounded-md border border-gray-300 font-black uppercase tracking-widest text-[11px]" onClick={() => setShowTierModal(false)}>
                                    Discard Changes
                                </Button>
                                <Button
                                    onClick={handleSaveTier}
                                    className="flex-1 h-18 rounded-md border border-gray-300 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-gray-900/20"
                                >
                                    {editingTierIndex !== null ? 'Save Architecture' : 'Synthesize Tier'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
