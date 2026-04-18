"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  IndianRupee,
  Tag,
  TrendingUp,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatTimeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function CafeAdminDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<any>(null);
  const [activityFeed, setActivityFeed] = React.useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/cafe-stats");
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
        setActivityFeed(json.activityFeed || []);
      } else {
        toast.error("Failed to load dashboard data.");
      }
    } catch {
      toast.error("Network error loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-72 bg-gray-100" />
          <Skeleton className="h-12 w-36 bg-gray-100 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-md border border-gray-300 bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] rounded-md border border-gray-300 bg-gray-100" />
          <Skeleton className="h-[500px] rounded-md border border-gray-300 bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-300" />
        <h2 className="text-2xl font-black text-gray-900">Failed to load</h2>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  const metricsAll = [
    {
      label: "Total Transactions",
      value: stats.totalTransactions,
      icon: ReceiptText,
      color: "text-gray-600",
      bg: "bg-gray-50",
      sub: "All time",
    },
    {
      label: "Total Sales",
      value: `₹${parseFloat(stats.totalSales).toLocaleString()}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: "All time revenue",
    },
    {
      label: "Total Discounts",
      value: `₹${parseFloat(stats.totalDiscounts).toLocaleString()}`,
      icon: Tag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: "Discounts given",
    },
    {
      label: "Today's Scans",
      value: stats.todayTransactions,
      icon: ScanLine,
      color: "text-hope-green",
      bg: "bg-green-50",
      sub: "Today's count",
      highlight: parseInt(stats.todayTransactions) > 0,
    },
    {
      label: "Today's Sales",
      value: `₹${parseFloat(stats.todaySales).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: "Today's revenue",
    },
    {
      label: "Today's Discounts",
      value: `₹${parseFloat(stats.todayDiscounts).toLocaleString()}`,
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: "Today's savings",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-8 space-y-8 md:space-y-10"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-hope-green" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Cafe Dashboard
            </h1>
          </div>
          <p className="text-gray-500 mt-1 font-medium text-sm ml-1">
            Scan guest passes and track local outlet performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-50 border border-gray-300 px-4 py-2 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Live</span>
          </div>
          <Link href="/admin/scan">
            <Button className="flex items-center gap-2 h-11 px-6 rounded-md bg-hope-green hover:bg-hope-green/90 text-white border border-gray-300 font-bold">
              <ScanLine className="w-4 h-4" />
              Scan Pass
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {metricsAll.map((s, idx) => (
          <Card
            key={idx}
            className={cn(
              "border border-gray-300 bg-white hover:-translate-y-1 cursor-default transition-all group",
              s.highlight && "ring-2 ring-hope-green/20"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "w-12 h-12 rounded-md border border-gray-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                    s.bg
                  )}
                >
                  <s.icon className={cn("w-6 h-6", s.color)} />
                </div>
                {s.highlight && (
                  <span className="text-[9px] font-black text-hope-green border border-gray-300 px-2 py-0.5 rounded-md bg-green-50 uppercase tracking-widest">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                {s.label}
              </p>
              <p className="text-2xl font-black text-gray-900 mt-2">{s.value}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {s.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Bottom: Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Quick Action Card */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border border-gray-300 bg-white h-full">
            <CardHeader className="p-8 border-b border-gray-100">
              <CardTitle className="text-xl font-black uppercase tracking-tight">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <Link href="/admin/scan" className="block">
                <div className="p-6 bg-hope-green/5 border border-gray-300 rounded-md flex items-center justify-between group hover:bg-hope-green/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-hope-green rounded-md border border-gray-300 flex items-center justify-center">
                      <ScanLine className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">Scan Guest Pass</p>
                      <p className="text-xs text-gray-500 font-medium">Verify & apply discount</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-hope-green transition-colors" />
                </div>
              </Link>

              <div className="p-6 bg-gray-50 border border-gray-300 rounded-md">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Commission Split
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-gray-700">
                    <span>Guest Discount</span>
                    <span className="text-blue-600">Given to Guest</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-700">
                    <span>Partner Commission</span>
                    <span className="text-hope-green">To Partner Wallet</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border border-gray-300 rounded-md">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Last Refreshed
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {new Date().toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
                <Button
                  variant="ghost"
                  className="mt-3 h-9 w-full rounded-md border border-gray-300 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-hope-green hover:bg-hope-green/5"
                  onClick={fetchData}
                >
                  Refresh Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={item} className="lg:col-span-3">
          <Card className="border border-gray-300 bg-white h-full">
            <CardHeader className="p-8 border-b border-gray-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Recent Activity
                </CardTitle>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Live referral scan feed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Live</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[480px]">
                {activityFeed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <ScanLine className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs text-gray-400">
                      No transactions yet today
                    </p>
                    <p className="text-[10px] text-gray-300 font-medium mt-1">
                      Start scanning passes to see activity here
                    </p>
                  </div>
                ) : (
                  activityFeed.map((log, i) => (
                    <AnimatePresence key={log.id}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between p-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-b-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-hope-green" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">{log.guestName}</p>
                            <p className="text-[10px] text-hope-green font-bold uppercase tracking-widest">
                              via {log.partnerName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                              +91 {log.mobile.slice(0, 5)}•••••
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                              Settled
                            </span>
                          </div>
                          <p className="font-black text-gray-900 text-base">
                            ₹{log.billAmount.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-blue-600 font-bold">
                            -₹{log.discountAmount?.toFixed(2)} saved
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium mt-1">
                            {formatTimeAgo(log.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
