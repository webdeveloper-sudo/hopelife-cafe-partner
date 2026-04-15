"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Settings2,
    Zap,
    Gift,
    Percent,
    Edit3,
    ArrowUpRight,
    Target,
    X,
    Shield,
    Globe
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

export default function AdminSlabsPage() {
    const [baseRate, setBaseRate] = React.useState(7.5);
    const [referralValue, setReferralValue] = React.useState(8500);
    const [showEditBase, setShowEditBase] = React.useState(false);
    const [showGlobalSettings, setShowGlobalSettings] = React.useState(false);

    // System-wide Global Settings
    const [sysSettings, setSysSettings] = React.useState({
        maintenance: false,
        payoutLock: false,
        auditTrail: true
    });

    const [boosters, setBoosters] = React.useState([
        { id: 'welcome', label: "Welcome Bonus", val: "₹500 / partner", desc: "Instant credit upon registration", icon: Gift, enabled: true },
        { id: 'retention', label: "Retention Bonus", val: "1.0% Extra", desc: "For partners active > 6 months", icon: Percent, enabled: true },
    ]);

    const [slabs, setSlabs] = React.useState([
        { name: "Silver Tier", range: "0 - 50 Refs", commission: "5.0%", bonus: "₹0", color: "bg-slate-100 text-slate-600" },
        { name: "Gold Tier", range: "51 - 200 Refs", commission: "7.5%", bonus: "₹10,000", color: "bg-yellow-50 text-yellow-700" },
        { name: "Platinum Tier", range: "201 - 500 Refs", commission: "10.0%", bonus: "₹25,000", color: "bg-blue-50 text-blue-700" },
        { name: "Diamond Elite", range: "500+ Refs", commission: "12.5%", bonus: "₹50,000+", color: "bg-gray-950 text-white shadow-xl shadow-black/10" },
    ]);

    const [showSlabModal, setShowSlabModal] = React.useState(false);
    const [editingSlabIndex, setEditingSlabIndex] = React.useState<number | null>(null);
    const [tempSlab, setTempSlab] = React.useState({ name: '', range: '', commission: '', bonus: '', color: 'bg-slate-100 text-slate-600' });

    const toggleBooster = (id: string) => {
        setBoosters(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
        const booster = boosters.find(b => b.id === id);
        toast.info(`${booster?.label} is now ${!booster?.enabled ? 'Enabled' : 'Disabled'}`);
    };

    const handleSaveBaseRate = (newRate: number) => {
        setBaseRate(newRate);
        setShowEditBase(false);
        toast.success("Global base commission updated.");
    };

    const handleOpenSlabModal = (index: number | null = null) => {
        if (index !== null) {
            setEditingSlabIndex(index);
            setTempSlab({ ...slabs[index] });
        } else {
            setEditingSlabIndex(null);
            setTempSlab({ name: '', range: '', commission: '', bonus: '', color: 'bg-slate-100 text-slate-600' });
        }
        setShowSlabModal(true);
    };

    const handleSaveSlab = () => {
        if (!tempSlab.name || !tempSlab.commission) {
            toast.error("Please fill in essential slab details.");
            return;
        }

        if (editingSlabIndex !== null) {
            const newSlabs = [...slabs];
            newSlabs[editingSlabIndex] = tempSlab;
            setSlabs(newSlabs);
            toast.success(`${tempSlab.name} parameters updated.`);
        } else {
            setSlabs([...slabs, tempSlab]);
            toast.success(`New Tier "${tempSlab.name}" added to architecture.`);
        }
        setShowSlabModal(false);
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Fee Architecture</h1>
                    <p className="text-gray-500 mt-1 font-medium">Configure reward slabs and commission percentages.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        className="gap-2 h-11 bg-white border border-gray-100 font-bold hover:bg-gray-50 transition-all"
                        onClick={() => setShowGlobalSettings(true)}
                    >
                        <Settings2 className="w-4 h-4" /> Global Settings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Commission Control */}
                <motion.div variants={item}>
                    <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white h-full rounded-[2.5rem]">
                        <CardHeader className="p-10 border-b border-gray-50">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-hope-green/10 rounded-2xl flex items-center justify-center">
                                    <Target className="w-7 h-7 text-hope-green" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Base Commission</CardTitle>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Global default for new partners</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-3xl border border-gray-100 shadow-sm">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Standard Rate</p>
                                    <p className="text-5xl font-black text-gray-900 tracking-tighter">{baseRate}<span className="text-3xl text-gray-300 ml-1">%</span></p>
                                </div>
                                <Button
                                    onClick={() => setShowEditBase(true)}
                                    className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-sm transition-transform active:scale-95"
                                >
                                    Modify Rate
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">System Calculations (Live Preview)</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 border border-gray-100 rounded-3xl bg-white shadow-sm">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Referral Value</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-gray-400">₹</span>
                                            <p className="text-2xl font-black text-gray-900 tracking-tight">{referralValue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 border border-hope-green/20 bg-hope-green/[0.03] rounded-3xl shadow-sm shadow-hope-green/10">
                                        <p className="text-[10px] font-black text-hope-green uppercase tracking-wider mb-1">Partner Earning</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-hope-green/50">₹</span>
                                            <p className="text-2xl font-black text-hope-green tracking-tight">{(referralValue * (baseRate / 100)).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Reward Boosters */}
                <motion.div variants={item}>
                    <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white h-full rounded-[2.5rem]">
                        <CardHeader className="p-10 border-b border-gray-50">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <Zap className="w-7 h-7 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Performance Boosters</CardTitle>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Automatic incentive triggers</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 space-y-6">
                            {boosters.map((b, i) => (
                                <div key={i} className={cn(
                                    "flex items-center justify-between p-6 border rounded-[2rem] transition-all cursor-pointer group active:scale-[0.98]",
                                    b.enabled ? "border-purple-100 bg-purple-50/30" : "border-gray-100 bg-white opacity-60"
                                )} onClick={() => toggleBooster(b.id)}>
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                                            b.enabled ? "bg-white shadow-xl shadow-purple-200/50" : "bg-gray-50"
                                        )}>
                                            <b.icon className={cn("w-6 h-6 transition-all", b.enabled ? "text-purple-600" : "text-gray-300")} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-base leading-tight uppercase tracking-tight">{b.label}</p>
                                            <p className="text-[11px] text-gray-500 mt-1 font-bold uppercase tracking-wide">{b.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 text-sm tracking-tight">{b.val}</p>
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest mt-1",
                                            b.enabled ? "text-green-500" : "text-gray-400 font-medium"
                                        )}>{b.enabled ? "Enabled" : "Disabled"}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Reward Slabs Table */}
            <motion.div variants={item}>
                <Card className="border-none bg-white shadow-2xl shadow-gray-200/50 rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-3xl font-black uppercase tracking-tighter">Growth Slabs</CardTitle>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Tier-based commission escalations</p>
                        </div>
                        <Button
                            onClick={() => handleOpenSlabModal()}
                            className="h-14 gap-2 bg-gray-900 hover:bg-black text-white px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-900/20 active:scale-95"
                        >
                            <Plus className="w-5 h-5 mr-1" /> Add Tier
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            {slabs.map((slab, i) => (
                                <div key={i} className="p-10 group hover:bg-gray-50/50 transition-all text-center">
                                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110 shadow-lg", slab.color)}>
                                        <Target className="w-8 h-8" />
                                    </div>
                                    <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">{slab.name}</h4>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 mb-8 bg-gray-100 inline-block px-3 py-1 rounded-full">{slab.range}</p>

                                    <div className="space-y-3 mb-10">
                                        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commission</span>
                                            <span className="font-black text-gray-900">{slab.commission}</span>
                                        </div>
                                        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tier Bonus</span>
                                            <span className="font-black text-green-600">{slab.bonus}</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleOpenSlabModal(i)}
                                        variant="ghost" size="sm" className="w-full gap-2 text-gray-400 hover:text-hope-green hover:bg-hope-green/5 font-black text-[10px] uppercase tracking-widest h-10 rounded-xl transition-all"
                                    >
                                        Edit Parameters <ArrowUpRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Slab Add/Edit Modal */}
            {showSlabModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowSlabModal(false)}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden p-12"
                    >
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center shadow-lg shadow-gray-900/20">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                                    {editingSlabIndex !== null ? 'Modify Tier' : 'Create New Tier'}
                                </h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure growth escalation rules</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tier Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sapphire Tier"
                                        value={tempSlab.name}
                                        onChange={(e) => setTempSlab({ ...tempSlab, name: e.target.value })}
                                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 border-2 border-transparent focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Referral Range</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1000+ Refs"
                                        value={tempSlab.range}
                                        onChange={(e) => setTempSlab({ ...tempSlab, range: e.target.value })}
                                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 border-2 border-transparent focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Commission %</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 15.0%"
                                        value={tempSlab.commission}
                                        onChange={(e) => setTempSlab({ ...tempSlab, commission: e.target.value })}
                                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 border-2 border-transparent focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tier Bonus</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹50,000"
                                        value={tempSlab.bonus}
                                        onChange={(e) => setTempSlab({ ...tempSlab, bonus: e.target.value })}
                                        className="w-full h-14 bg-gray-50 rounded-2xl px-6 font-bold text-gray-900 border-2 border-transparent focus:border-gray-900/10 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setShowSlabModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveSlab}
                                    className="flex-1 h-16 rounded-2xl bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-gray-900/20"
                                >
                                    {editingSlabIndex !== null ? 'Save Changes' : 'Activate Tier'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modify Base Rate Modal */}
            {showEditBase && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowEditBase(false)}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10 text-center"
                    >
                        <div className="w-20 h-20 bg-hope-purple/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                            <Percent className="w-10 h-10 text-hope-purple" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Adjust Base Rate</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-10">Affects all new partner onboarding</p>

                        <div className="relative mb-10">
                            <input
                                type="number"
                                step="0.5"
                                defaultValue={baseRate}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveBaseRate(parseFloat((e.target as HTMLInputElement).value));
                                }}
                                className="w-full h-24 bg-gray-50 rounded-3xl text-5xl font-black text-center text-gray-900 focus:outline-none border-4 border-transparent focus:border-hope-purple/20 transition-all tracking-tighter"
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-300">%</span>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setShowEditBase(false)}>
                                Cancel
                            </Button>
                            <Button className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-hope-purple/20" onClick={() => {
                                const val = (document.querySelector('input[type="number"]') as HTMLInputElement).value;
                                handleSaveBaseRate(parseFloat(val));
                            }}>
                                Save Architecture
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Global Settings Side Panel */}
            {showGlobalSettings && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowGlobalSettings(false)}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                                    <Settings2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-tight">Global Settings</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System configuration</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowGlobalSettings(false)} className="rounded-xl">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Meta Settings */}
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-hope-purple" /> Meta Configuration
                                </h4>
                                <div className="space-y-3">
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-bold text-gray-600">Referral Value Base</span>
                                            <span className="text-[10px] font-black text-hope-purple bg-hope-purple/10 px-2 py-1 rounded-md uppercase tracking-widest">Global</span>
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={referralValue}
                                                onChange={(e) => setReferralValue(parseInt(e.target.value) || 0)}
                                                className="w-full h-14 bg-white rounded-xl pl-10 pr-6 font-black text-xl border-2 border-transparent focus:border-hope-purple/20 focus:outline-none transition-all"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-wide italic">Used for calculator previews & default allocations</p>
                                    </div>
                                </div>
                            </section>

                            {/* Guardrails */}
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-red-500" /> System Guardrails
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { id: 'maintenance', label: "Maintenance Mode", desc: "Lock all partner dashboard actions", active: sysSettings.maintenance },
                                        { id: 'payoutLock', label: "Global Payout Lock", desc: "Freeze all new commission disbursements", active: sysSettings.payoutLock },
                                        { id: 'auditTrail', label: "Enhanced Audit Trail", desc: "Force detailed logging for architecture changes", active: sysSettings.auditTrail },
                                    ].map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => setSysSettings(prev => ({ ...prev, [s.id]: !prev[s.id as keyof typeof prev] }))}
                                            className={cn(
                                                "p-5 rounded-2xl border transition-all cursor-pointer group",
                                                s.active ? "bg-red-50 border-red-100" : "bg-white border-gray-100"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={cn("font-black text-sm uppercase tracking-tight", s.active ? "text-red-700" : "text-gray-900")}>{s.label}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">{s.desc}</p>
                                                </div>
                                                <div className={cn(
                                                    "w-10 h-6 rounded-full relative transition-all",
                                                    s.active ? "bg-red-500" : "bg-gray-200"
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                                        s.active ? "left-5" : "left-1"
                                                    )} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="p-8 border-t border-gray-100 space-y-4">
                            <Button className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-900/20 active:scale-[0.98] transition-all">
                                Deploy Global Architecture
                            </Button>
                            <Button variant="ghost" onClick={() => setShowGlobalSettings(false)} className="w-full h-12 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:text-gray-600">
                                Dismiss Panel
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

