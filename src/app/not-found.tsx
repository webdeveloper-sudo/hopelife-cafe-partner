"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/AuthLayout";

export default function NotFound() {
  return (
    <AuthLayout>
      <div className="max-w-md w-full mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-md shadow-2xl shadow-black/40 border border-gray-300 relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16" />
          
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <Search className="w-10 h-10 text-gray-400" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-8px] rounded-full border border-dashed border-gray-200"
            />
          </div>

          <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
          <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Lost in the brew?</h2>
          <p className="text-gray-500 mb-10 font-medium leading-relaxed">
            The page you are looking for has been moved or doesn't exist in our current menu.
          </p>

          <div className="space-y-4">
            <Link href="/" className="block">
              <Button className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest gap-2">
                <Home className="w-5 h-5" /> Back to Home
              </Button>
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="w-full h-14 border border-gray-300 rounded-md text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>
        </motion.div>

        {/* Footer Branding */}
        <div className="mt-8 opacity-50 flex flex-col items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-xl border border-gray-300 overflow-hidden p-1.5">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-fit" />
            </div>
            <p className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Hope Life Cafe</p>
        </div>
      </div>
    </AuthLayout>
  );
}
