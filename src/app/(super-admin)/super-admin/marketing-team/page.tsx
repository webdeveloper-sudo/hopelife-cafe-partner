"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, CheckCircle, XCircle, Search, Mail, Phone, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MarketingRep {
    id: string;
    name: string;
    email: string;
    mobile: string;
    status: string;
    createdAt: string;
    _count: {
        partners: number;
    };
}

export default function MarketingTeamAdminPage() {
    const [reps, setReps] = useState<MarketingRep[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");

    const fetchReps = async () => {
        try {
            const res = await fetch("/api/super-admin/marketing-team");
            const data = await res.json();
            if (data.reps) setReps(data.reps);
        } catch (error) {
            toast.error("Failed to load marketing team");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReps();
    }, []);

    const handleAddRep = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/super-admin/marketing-team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, mobile }),
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                toast.success("Marketing Rep added successfully");
                setIsAddModalOpen(false);
                setName("");
                setEmail("");
                setMobile("");
                setPassword("");
                fetchReps();
            } else {
                toast.error(data.error || "Failed to add Marketing Rep");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        try {
            const res = await fetch("/api/super-admin/marketing-team", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Rep marked as ${newStatus}`);
                fetchReps();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const filteredReps = reps.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.mobile.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold border-b-4 border-amber-500 pb-1 inline-block">Marketing Team</h1>
                    <p className="text-sm text-gray-500 mt-2">Manage marketing representatives and track their partner onboarding.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Representative
                </button>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Team</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reps.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-md flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Members</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reps.filter(r => r.status === 'ACTIVE').length}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-md flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Onboarded Partners</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reps.reduce((acc, r) => acc + r._count.partners, 0)}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
                            <UserPlus className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* List and Search */}
            <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or mobile..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Representative</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Contact</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] text-center">Partners Onboarded</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] text-center">Status</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 px-2 lg:px-0">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredReps.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">No representatives found.</td>
                                </tr>
                            ) : filteredReps.map((rep) => (
                                <tr key={rep.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link 
                                            href={`/super-admin/marketing-team/${rep.id}`}
                                            className="font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                                        >
                                            {rep.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-gray-600">
                                            <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{rep.email}</div>
                                            <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{rep.mobile}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-900 text-lg">
                                        {rep._count.partners}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                            rep.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {rep.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleStatus(rep.id, rep.status)}
                                            className={cn(
                                                "text-xs font-semibold px-3 py-1.5 rounded border transition-colors",
                                                rep.status === "ACTIVE" 
                                                    ? "text-red-700 border-red-200 hover:bg-red-50" 
                                                    : "text-green-700 border-green-200 hover:bg-green-50"
                                            )}
                                        >
                                            {rep.status === "ACTIVE" ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-md max-w-md w-full shadow-xl border border-gray-300">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-md">
                            <h2 className="font-bold text-gray-900">Add Marketing Representative</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddRep} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={cn("px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium flex items-center", isSubmitting && "opacity-70 cursor-not-allowed")}
                                >
                                    {isSubmitting ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
