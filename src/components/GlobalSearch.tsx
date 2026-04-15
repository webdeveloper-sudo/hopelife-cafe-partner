"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Command, X, User, Users, Wallet, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery("");
            setResults([]);
        }
    }, [open]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/search?q=${query}`);
                const data = await res.json();
                setResults(data.results || []);
                setSelectedIndex(0);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result: any) => {
        setOpen(false);
        router.push(result.href);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === "Enter" && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all group w-64 text-left"
            >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-hope-green" />
                <span className="text-xs font-bold text-gray-400 flex-1">Global Command Hub...</span>
                <div className="flex items-center gap-1 bg-white border border-gray-100 px-1.5 py-0.5 rounded-lg">
                    <Command className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[9px] font-black text-gray-400">K</span>
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
                        >
                            <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                                <Search className="w-6 h-6 text-hope-green" />
                                <input 
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search Partners, Guests, Payouts..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-gray-900 placeholder:text-gray-300"
                                />
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-hope-green border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                                {results.length === 0 && query.length >= 2 && !loading && (
                                    <div className="py-12 text-center text-gray-400">
                                        <p className="font-black uppercase tracking-widest text-xs">No records found matching "{query}"</p>
                                    </div>
                                )}
                                
                                {results.length === 0 && query.length < 2 && (
                                    <div className="py-12 text-center text-gray-300 space-y-4">
                                        <div className="flex justify-center gap-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Users className="w-5 h-5" /></div>
                                                <span className="text-[10px] font-black uppercase">Partners</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><User className="w-5 h-5" /></div>
                                                <span className="text-[10px] font-black uppercase">Guests</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Wallet className="w-5 h-5" /></div>
                                                <span className="text-[10px] font-black uppercase">Payouts</span>
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm">Start typing to browse the ecosystem...</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {results.map((res, i) => (
                                        <div 
                                            key={res.id}
                                            onClick={() => handleSelect(res)}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border border-transparent",
                                                i === selectedIndex ? "bg-hope-green/5 border-hope-green/10 translate-x-1" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                                    res.type === "PARTNER" ? "bg-orange-50 text-orange-500" :
                                                    res.type === "GUEST" ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                                                )}>
                                                    {res.type === "PARTNER" ? <Users className="w-5 h-5" /> :
                                                     res.type === "GUEST" ? <User className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900">{res.title}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.subtitle}</p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center transition-all shadow-sm",
                                                i === selectedIndex ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                                            )}>
                                                <ArrowRight className="w-4 h-4 text-hope-green" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Navigation: ↑↓ or Mouse • Select: Enter
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-gray-500">HOPE Cafe Intelligence</span>
                                    <div className="w-1 h-1 rounded-full bg-hope-green" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
