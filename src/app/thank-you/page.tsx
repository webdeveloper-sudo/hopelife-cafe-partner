"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Coffee, Sparkles, Receipt, Download, User, Phone, Calendar, Building2, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
    const searchParams = useSearchParams();
    const billAmount = searchParams.get("billAmount");
    const discount = searchParams.get("discount");
    const guestName = searchParams.get("guestName") || "Guest";
    const guestMobile = searchParams.get("guestMobile") || "N/A";
    const partnerName = searchParams.get("partnerName") || "HOPE Partner";
    const discountPercent = searchParams.get("discountPercent") || "0";
    const dateStr = searchParams.get("date");
    
    const displayDate = dateStr ? new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : new Date().toLocaleString();

    const handleDownloadPDF = async () => {
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF({
                unit: "mm",
                format: [80, 150]
            });

            // Branding
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text("HOPE CAFE", 40, 15, { align: "center" });
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("OFFICIAL SETTLEMENT RECEIPT", 40, 22, { align: "center" });
            
            doc.line(10, 25, 70, 25);

            // Receipt Details
            doc.setFontSize(9);
            doc.text(`Date: ${displayDate}`, 10, 32);
            doc.text(`Guest: ${guestName}`, 10, 38);
            doc.text(`Mobile: +91 ${guestMobile}`, 10, 44);
            doc.text(`Partner: ${partnerName}`, 10, 50);

            doc.line(10, 55, 70, 55);

            // Financials
            doc.text("Subtotal:", 10, 62);
            doc.text(`Rs ${parseFloat(billAmount || "0").toFixed(2)}`, 70, 62, { align: "right" });
            
            doc.text(`Discount (${discountPercent}%):`, 10, 68);
            doc.text(`-Rs ${parseFloat(discount || "0").toFixed(2)}`, 70, 68, { align: "right" });

            doc.line(10, 72, 70, 72);

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL PAID:", 10, 80);
            const total = parseFloat(billAmount || "0") - parseFloat(discount || "0");
            doc.text(`Rs ${total.toFixed(2)}`, 70, 80, { align: "right" });

            // Footer
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text("Thank you for your visit!", 40, 95, { align: "center" });
            doc.text("www.hopecafe.com", 40, 100, { align: "center" });

            doc.save(`HOPE_Receipt_${guestName.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            window.print(); // Fallback to print if jspdf fails to load
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full py-12 px-8 bg-green-50/30 rounded-md border border-gray-300 shadow-2xl relative overflow-hidden print-container"
            >
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none decoration" />
                <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-hope-purple/10 rounded-full blur-2xl pointer-events-none decoration" />

                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 relative decoration">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-green-500 opacity-20 pointer-events-none"
                    />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight decoration">Success!</h1>
                <p className="font-bold text-green-700 mb-6 uppercase tracking-widest text-[10px] decoration">
                    Transaction Settle Completed
                </p>

                {billAmount && (
                    <div className="bg-white border border-gray-300 rounded-md p-6 mb-8 text-left shadow-sm relative z-10 text-gray-900">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Receipt className="w-4 h-4" /> Official Receipt
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayDate}</span>
                        </div>

                        {/* Guest & Referral Details */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Guest Name</p>
                                    <p className="text-sm font-bold text-gray-900">{guestName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</p>
                                    <p className="text-sm font-bold text-gray-900">+91 {guestMobile}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building2 className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Referred By</p>
                                    <p className="text-xs font-bold text-hope-green uppercase tracking-tight">{partnerName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center text-gray-500">
                                <span className="text-xs font-bold uppercase tracking-widest">Total Bill</span>
                                <span className="text-sm font-black tracking-tight text-gray-900">₹{parseFloat(billAmount).toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center text-green-600">
                                <div className="flex items-center gap-1.5">
                                    <Percent className="w-3 h-3" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Referral Discount ({discountPercent}%)</span>
                                </div>
                                <span className="text-sm font-black tracking-tight">- ₹{parseFloat(discount || "0").toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t-2 border-dotted border-gray-200 mt-2">
                                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Final Amount Paid</span>
                                <span className="text-2xl font-black text-hope-purple italic tracking-tighter">
                                    ₹{(parseFloat(billAmount) - parseFloat(discount || "0")).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4 relative z-10 no-print">
                    <Button 
                        onClick={handleDownloadPDF}
                        className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                    >
                        <Download className="w-5 h-5" /> Download Bill (PDF)
                    </Button>
                    
                    <Link href="/" className="block">
                        <Button variant="outline" className="w-full h-14 text-xs font-black uppercase tracking-widest border-gray-300">
                            Return Home
                        </Button>
                    </Link>
                </div>

                <div className="mt-10 flex justify-center gap-2 decoration no-print">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HOPE Cafe Experience</span>
                </div>
            </motion.div>
        </div>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <ThankYouContent />
        </Suspense>
    );
}
