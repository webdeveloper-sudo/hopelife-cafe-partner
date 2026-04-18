"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Info,
    Calendar,
    Clock,
    RefreshCw,
    Download,
    Eye
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
};

export default function LogsPage() {
    const [loading, setLoading] = React.useState(true);
    const [logs, setLogs] = React.useState<any[]>([]);
    const [search, setSearch] = React.useState("");
    const [filter, setFilter] = React.useState("ALL");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/logs");
            const json = await res.json();
            if (json.success) {
                setLogs(json.logs);
            } else {
                toast.error("Failed to load logs");
            }
        } catch (err) {
            toast.error("Network error fetching logs");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.title.toLowerCase().includes(search.toLowerCase()) || 
            log.description.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "ALL" || log.type === filter;
        return matchesSearch && matchesFilter;
    });

    const getLogIcon = (type: string) => {
        switch (type) {
            case "TRANSACTION": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "PARTNER": return <Activity className="w-5 h-5 text-blue-500" />;
            case "PAYOUT": return <RefreshCw className="w-5 h-5 text-purple-500" />;
            default: return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getLogColor = (type: string) => {
        switch (type) {
            case "TRANSACTION": return "bg-green-50 border-green-100";
            case "PARTNER": return "bg-blue-50 border-blue-100";
            case "PAYOUT": return "bg-purple-50 border-purple-100";
            default: return "bg-gray-50 border-gray-100";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Activity className="w-10 h-10 text-hope-green" />
                        System Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium max-w-xl">
                        Real-time tracking of all network activities, transactions, and system events for enterprise compliance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={fetchLogs} 
                        className="h-11 px-4 border border-gray-200 hover:bg-white flex items-center gap-2"
                        disabled={loading}
                    >
                        <RefreshCw className={cn("w-4 h-4 text-gray-400", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button className="h-11 px-6 bg-gray-900 text-white flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-hope-green transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title, description, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-hope-green/10 focus:border-hope-green transition-all"
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100 min-w-fit">
                        {["ALL", "TRANSACTION", "PARTNER", "PAYOUT"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    filter === f 
                                        ? "bg-white text-hope-green shadow-sm border border-gray-100" 
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Logs List */}
            <div className="space-y-4">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-3xl border border-gray-200" />
                    ))
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                        <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="font-black text-gray-400 uppercase tracking-widest">No matching logs found</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {filteredLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                variants={item}
                                className="group bg-white p-6 rounded-3xl border border-gray-100 hover:border-hope-green/30 hover:shadow-xl hover:shadow-hope-green/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-5">
                                    <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", getLogColor(log.type))}>
                                        {getLogIcon(log.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-gray-900">{log.title}</h3>
                                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {log.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                            {log.description}
                                        </p>
                                        <div className="flex items-center gap-4 pt-1">
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-10 px-4 rounded-xl border border-gray-50 text-xs font-bold text-gray-400 hover:text-gray-900 group"
                                    >
                                        View Details
                                        <Eye className="w-3.5 h-3.5 ml-2 transition-transform group-hover:scale-110" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
