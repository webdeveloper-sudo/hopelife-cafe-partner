"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Building2, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    businessName: z.string().min(2, "Business name is required"),
    businessType: z.string().min(1, "Please select a business type"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(5, "Full address is required"),
    city: z.string().min(1, "City is required"),
    pincode: z.string().length(6, "Pincode must be 6 digits"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            city: "Pondicherry",
        },
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await fetch("/api/partner/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerName: data.businessName,
                    contactName: data.email.split("@")[0], // Fallback or add field
                    mobile: data.phone,
                    email: data.email,
                    password: data.password,
                    businessType: data.businessType,
                    commissionSlab: 7.5
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed");
            }

            toast.success("Registration Submitted! 🌴", {
                description: "Aloha! We will review your application within 24-48 hours. Welcome to the elite network.",
            });
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="overflow-hidden border-none shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                        {/* Sidebar info */}
                        <div className="md:col-span-2 bg-hope-green p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-xl overflow-hidden p-1">
                                    <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-cover" />
                                </div>
                                <h2 className="text-3xl font-bold mb-6">Join the Elite Network</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <CheckCircle2 className="w-6 h-6 shrink-0 text-white/40" />
                                        <p className="text-sm font-medium">Earn 7.5% on every referred guest bill.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <CheckCircle2 className="w-6 h-6 shrink-0 text-white/40" />
                                        <p className="text-sm font-medium">₹500 instant welcome bonus.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <CheckCircle2 className="w-6 h-6 shrink-0 text-white/40" />
                                        <p className="text-sm font-medium">Direct weekly payouts to your bank.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 p-6 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
                                <p className="text-xs font-medium opacity-80">
                                    "Registering was easy, and the payments are always on time. Highly recommend!"
                                </p>
                                <p className="text-xs font-bold mt-2">— Local Tour Operator</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="md:col-span-3 p-10 bg-white">
                            <CardHeader className="p-0 mb-8">
                                <CardTitle className="text-3xl">Partner Registration</CardTitle>
                                <p className="text-gray-500 text-sm mt-2">Become a HOPE Cafe Partner today.</p>
                            </CardHeader>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                        <Input {...register("email")} error={!!errors.email} placeholder="name@company.com" />
                                        {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                        <Input {...register("password")} type="password" error={!!errors.password} placeholder="••••••••" />
                                        {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Business Name</label>
                                    <Input {...register("businessName")} error={!!errors.businessName} placeholder="Sea Side Travels" />
                                    {errors.businessName && <p className="text-[10px] text-red-500 ml-1">{errors.businessName.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Business Type</label>
                                        <select
                                            {...register("businessType")}
                                            className="flex h-12 w-full rounded-2xl border-2 bg-white px-4 py-2 text-sm transition-all border-gray-100 focus:border-hope-purple outline-none"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="homestay">Homestays & Guest Houses</option>
                                            <option value="resort">Resorts & Boutique Stays</option>
                                            <option value="hostel">Hostels & Backpacker Lodges</option>
                                            <option value="taxi">Taxi & Car Rentals</option>
                                            <option value="bike">Bike & Scooter Rentals</option>
                                            <option value="travel_agency">Tour & Travel Agencies</option>
                                            <option value="guide">Local Travel Guides</option>
                                            <option value="wellness">Yoga & Wellness Centers</option>
                                            <option value="adventure">Adventure Activity Centers</option>
                                            <option value="water_sports">Water Sports Centers</option>
                                            <option value="events">Event Organizers</option>
                                            <option value="freelance">Freelance Guide</option>
                                            <option value="others">Others</option>
                                        </select>
                                        {errors.businessType && <p className="text-[10px] text-red-500 ml-1">{errors.businessType.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                        <Input {...register("phone")} error={!!errors.phone} placeholder="+91 98765 43210" />
                                        {errors.phone && <p className="text-[10px] text-red-500 ml-1">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                                    <Input {...register("address")} error={!!errors.address} placeholder="123 Street, Area Name" />
                                    {errors.address && <p className="text-[10px] text-red-500 ml-1">{errors.address.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                                        <Input {...register("city")} error={!!errors.city} />
                                        {errors.city && <p className="text-[10px] text-red-500 ml-1">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                                        <Input {...register("pincode")} error={!!errors.pincode} placeholder="605001" />
                                        {errors.pincode && <p className="text-[10px] text-red-500 ml-1">{errors.pincode.message}</p>}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-14 text-lg" isLoading={isSubmitting}>
                                    Create Partner Account <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>

                                <p className="text-center text-[10px] text-gray-400">
                                    By clicking, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </form>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
