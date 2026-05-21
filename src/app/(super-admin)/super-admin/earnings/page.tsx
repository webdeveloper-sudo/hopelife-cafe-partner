"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Coffee,
  TrendingUp,
  Search,
  DollarSign,
  AlertCircle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function CafeEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [search, setSearch] = useState("");
  const [outletFilter, setOutletFilter] = useState<"all" | "White Town" | "Auroville">("all");

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/earnings");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        toast.error("Failed to fetch cafe earnings data.");
      }
    } catch (err) {
      toast.error("Failed to connect to stats engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-12 w-64 bg-gray-100" />
            <Skeleton className="h-4 w-96 bg-gray-100 mt-2" />
          </div>
          <Skeleton className="h-10 w-32 bg-gray-100 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-md border border-gray-300 bg-gray-100" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-md border border-gray-300 bg-gray-100" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-black text-gray-900">Failed to load Earnings Engine</h2>
        <p className="text-gray-500 max-w-sm">
          Please check your network and authorization.
        </p>
        <Button variant="primary" onClick={fetchEarnings}>
          Retry Query
        </Button>
      </div>
    );
  }

  const { summary, daily, weekly, monthly, payments } = data;

  // Filter payments
  const filteredPayments = payments.filter((p: any) => {
    const matchesSearch =
      p.guestName.toLowerCase().includes(search.toLowerCase()) ||
      p.guestMobile.includes(search) ||
      p.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      p.partnerCode.toLowerCase().includes(search.toLowerCase());

    const matchesOutlet =
      outletFilter === "all" || p.outlet === outletFilter;

    return matchesSearch && matchesOutlet;
  });

  const getActiveTabDataset = () => {
    if (activeTab === "daily") return daily;
    if (activeTab === "weekly") return weekly;
    return monthly;
  };

  const activeDataset = getActiveTabDataset();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 md:space-y-10 animate-fade-in"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-hope-green" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Cafe Earnings
            </h1>
          </div>
          <p className="text-gray-500 mt-1 font-medium text-sm ml-1">
            Track daily, weekly, monthly performance breakdown across White Town and Auroville.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchEarnings}
          className="border border-gray-300 h-11 px-6 rounded-md hover:bg-gray-50"
        >
          Refresh Feed
        </Button>
      </div>

      {/* Main Aggregated Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Combined Cafe Earnings */}
        <motion.div variants={item}>
          <Card className="border border-gray-300 bg-gradient-to-br from-emerald-950/5 via-emerald-900/5 to-transparent bg-white shadow-xl shadow-gray-200/50 rounded-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-md border border-gray-300 bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-emerald-50 border border-emerald-200 text-emerald-700 tracking-wider">
                  Total Combined
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Aggregated Revenue
                </h3>
                <p className="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">
                  ₹{summary.combinedTotal?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-2">
                  Total revenue across all active brand outlets.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* White Town Cafe */}
        <motion.div variants={item}>
          <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-md border border-gray-300 bg-green-50 flex items-center justify-center">
                  <Coffee className="w-7 h-7 text-hope-green" />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-green-50 border border-green-200 text-hope-green tracking-wider">
                  White Town
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  HOPE Cafe White Town
                </h3>
                <p className="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">
                  ₹{summary.whiteTownTotal?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-2">
                  White Town settled/paid branch sales.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Auroville Cafe */}
        <motion.div variants={item}>
          <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-md border border-gray-300 bg-blue-50 flex items-center justify-center">
                  <Coffee className="w-7 h-7 text-blue-500" />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 border border-blue-200 text-blue-600 tracking-wider">
                  Auroville
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  HOPE Cafe Auroville
                </h3>
                <p className="text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">
                  ₹{summary.aurovilleTotal?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-2">
                  Auroville settled/paid branch sales.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily, Weekly, Monthly Breakdown Tabs & Performance Charts/Tables */}
      <motion.div variants={item}>
        <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/40 rounded-md overflow-hidden">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">Revenue Breakdown</CardTitle>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Multi-outlet structured timeframe evaluation</p>
            </div>
            {/* Tabs */}
            <div className="flex rounded-md border border-gray-300 bg-gray-50 p-1">
              {(["daily", "weekly", "monthly"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all",
                    activeTab === tab
                      ? "bg-white text-gray-900 shadow-md shadow-gray-200/50"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-300">
                    <th className="px-10 py-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Time Period</th>
                    <th className="px-10 py-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">White Town Sales</th>
                    <th className="px-10 py-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">Auroville Sales</th>
                    <th className="px-10 py-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-right">Combined Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {activeDataset.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-10 py-6">
                        <span className="flex items-center gap-3 font-black text-gray-800">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          {row.name}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center font-bold text-gray-700">
                        ₹{row.whiteTown?.toLocaleString() || 0}
                      </td>
                      <td className="px-10 py-6 text-center font-bold text-gray-700">
                        ₹{row.auroville?.toLocaleString() || 0}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-emerald-600">
                        ₹{row.combined?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                  {activeDataset.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-10 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                        No transactions registered for this timeline.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Payment History List */}
      <motion.div variants={item} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Ledger</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Audit log of guest settlement bills</p>
          </div>
        </div>

        <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/30 rounded-md">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-14 h-12 bg-gray-50/50 border border-gray-300 rounded-md focus:bg-white text-base font-medium"
                placeholder="Search guest, mobile, partner or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex rounded-md border border-gray-300 bg-gray-50 p-1">
              {(["all", "White Town", "Auroville"] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  onClick={() => setOutletFilter(filterVal)}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all",
                    outletFilter === filterVal
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  {filterVal === "all" ? "All Outlets" : filterVal}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment History Table */}
        <Card className="border border-gray-300 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden rounded-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-300">
                    <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Guest Detail</th>
                    <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">Partner Referrer</th>
                    <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">Settlement Location</th>
                    <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">Bill Amount</th>
                    <th className="px-10 py-6 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-right">Commission Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {filteredPayments.map((row: any, i: number) => (
                    <tr key={i} className="group hover:bg-gray-50/40 transition-all">
                      <td className="px-10 py-6">
                        <div>
                          <h4 className="font-black text-gray-900 text-base leading-snug">{row.guestName}</h4>
                          <p className="text-[10px] font-bold text-gray-400 tracking-wider mt-0.5">+91 {row.guestMobile}</p>
                          <span className="text-[9px] text-gray-400 font-bold mt-1 block">
                            {new Date(row.date).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm leading-snug">{row.partnerName}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">
                            {row.partnerCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider border",
                            row.outlet === "White Town"
                              ? "bg-green-50 border-green-200 text-hope-green"
                              : row.outlet === "Auroville"
                              ? "bg-blue-50 border-blue-200 text-blue-600"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                          )}
                        >
                          {row.outlet}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center font-extrabold text-gray-900 text-lg">
                        ₹{row.billAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-hope-green">
                        ₹{row.partnerCommission?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No records registered for this search query</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
