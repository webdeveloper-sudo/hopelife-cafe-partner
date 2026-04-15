"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    User,
    Building2,
    Lock,
    Bell,
    CreditCard,
    Save,
    Camera,
    Settings
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

export default function PartnerSettingsPage() {
    const [partner, setPartner] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState("Account Info");

    React.useEffect(() => {
        const sessionRaw = localStorage.getItem("hope_partner_session");
        if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            // In a real app, we'd fetch full details from API. For now, we'll use session + a mock fetch simulation
            setPartner({
                name: session.name || "Grand Hope Cafe",
                email: session.email || "demo@partner.hub",
                mobile: session.mobile || "+91 00000 00000",
                partnerCode: session.partnerCode || "demo",
                bankAccount: session.bankAccount || "9823481230123",
                ifsc: session.ifsc || "UTIB0001243"
            });
        }
    }, []);

    if (!partner) return <div className="min-h-[50vh] flex items-center justify-center text-gray-400">Loading settings...</div>;

    const initials = partner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    const tabs = [
        { label: "Account Info", icon: User },
        { label: "Business Details", icon: Building2 },
        { label: "Bank & Payouts", icon: CreditCard },
        { label: "Security", icon: Lock },
        { label: "Notifications", icon: Bell },
    ];

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hub Settings</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your profile, bank details and notification preferences.</p>
                </div>
                <Button className="h-12 gap-2 bg-gray-900 hover:bg-black text-white px-8 rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-95" onClick={() => toast.success("All changes saved successfully.")}>
                    <Save className="w-4 h-4" /> Save All Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar - Profile Summary */}
                <motion.div variants={item} className="space-y-6">
                    <Card className="border-none bg-white shadow-xl shadow-gray-200/50 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="h-24 bg-gradient-to-r from-hope-green to-hope-green" />
                            <div className="p-8 -mt-16 text-center">
                                <div className="relative inline-block group">
                                    <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl relative z-10">
                                        <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-400 text-4xl overflow-hidden">
                                            {initials}
                                        </div>
                                    </div>
                                    <button className="absolute bottom-1 right-1 z-20 w-10 h-10 bg-gray-950 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all">
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mt-6 tracking-tight">{partner.name}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Partner Code: {partner.partnerCode}</p>

                                <div className="mt-8 flex items-center justify-center gap-2">
                                    <span className="px-4 py-2 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Verified Hub</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white shadow-xl shadow-gray-200/50">
                        <CardContent className="p-4 space-y-1">
                            {tabs.map((tab, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTab(tab.label)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                                        activeTab === tab.label ? "bg-hope-green/10 text-hope-green" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Settings Form */}
                <motion.div variants={item} className="lg:col-span-2 space-y-8">
                    {activeTab === "Account Info" && (
                        <Card className="border-none bg-white shadow-2xl shadow-gray-200/50">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-black">Personal Information</CardTitle>
                                <p className="text-sm text-gray-500 font-medium">Update your account identity and contact details.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <Input defaultValue={partner.name} className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Email</label>
                                        <Input defaultValue={partner.email} className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <Input defaultValue={partner.mobile} className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Bank & Payouts" && (
                        <Card className="border-none bg-white shadow-2xl shadow-gray-200/50">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-black">Bank Settlement Details</CardTitle>
                                <p className="text-sm text-gray-500 font-medium">Direct weekly payouts are processed to this account.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl flex items-center gap-6">
                                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <CreditCard className="w-6 h-6" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 leading-tight">Primary Settlement Account</p>
                                        <p className="text-xs font-medium text-gray-500 mt-1">Active for weekly payouts</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                                        <Input defaultValue={partner.bankAccount} className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                        <Input defaultValue={partner.ifsc} className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white uppercase font-bold" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Business Details" && (
                        <Card className="border-none bg-white shadow-2xl shadow-gray-200/50">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-black">Business Details</CardTitle>
                                <p className="text-sm text-gray-500 font-medium">Verify your business registration and licensing info.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Business Name</label>
                                    <Input defaultValue={partner.name} className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST / PAN Number</label>
                                        <Input placeholder="Enter GSTIN Number" className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Establishment Type</label>
                                        <select className="w-full h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold px-4 text-sm outline-none appearance-none cursor-pointer hover:bg-gray-100 transition-all">
                                            <option value="" disabled selected>Select Business Type</option>
                                            <option>🤝 Partner Business</option>
                                            <option>🏡 Homestays & Guest Houses</option>
                                            <option>🏝️ Resorts & Boutique Stays</option>
                                            <option>🛏️ Hostels & Backpacker Lodges</option>
                                            <option>🚕 Taxi & Car Rentals</option>
                                            <option>🛵 Bike & Scooter Rentals</option>
                                            <option>🗺️ Tour & Travel Agencies</option>
                                            <option>👤 Local Travel Guides</option>
                                            <option>🧘 Yoga & Wellness Centers</option>
                                            <option>🏄 Adventure Activity Centers</option>
                                            <option>🛶 Water Sports Centers</option>
                                            <option>🎉 Event Organizers</option>
                                            <option>🏢 Corporate Offices</option>
                                            <option>🛍️ Retail & Lifestyle Stores</option>
                                            <option>✨ Other Services</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Security" && (
                        <Card className="border-none bg-white shadow-2xl shadow-gray-200/50">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-black">Security Settings</CardTitle>
                                <p className="text-sm text-gray-500 font-medium">Manage your password and account security.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                    <Input type="password" placeholder="••••••••" className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                        <Input type="password" placeholder="New Password" className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <Input type="password" placeholder="Confirm Password" className="h-12 rounded-2xl bg-gray-50 border-transparent focus:bg-white font-bold" />
                                    </div>
                                </div>
                                <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold h-12 rounded-2xl">Update Password</Button>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "Notifications" && (
                        <Card className="border-none bg-white shadow-2xl shadow-gray-200/50">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-xl font-black">Notifications</CardTitle>
                                <p className="text-sm text-gray-500 font-medium">Control which alerts you receive.</p>
                            </CardHeader>
                            <CardContent className="p-8 space-y-4">
                                {[
                                    { title: "Referral Alerts", desc: "Get notified when a guest scans your QR code." },
                                    { title: "Payout Updates", desc: "Receive alerts when your commission is settled." },
                                    { title: "Marketing Emails", desc: "Stay updated with new offers and system updates." }
                                ].map((notif, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                                            <p className="text-xs text-gray-500">{notif.desc}</p>
                                        </div>
                                        <div className="w-12 h-6 bg-hope-green rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
