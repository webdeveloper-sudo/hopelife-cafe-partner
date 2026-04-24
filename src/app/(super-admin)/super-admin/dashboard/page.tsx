"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  BarChart3,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  Bell,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import PerformanceInsights from "@/components/PerformanceInsights";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export default function SuperAdminDashboard() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [showLogs, setShowLogs] = React.useState(false);
  const [systemLogs, setSystemLogs] = React.useState<any[]>([]);
  const [logsLoading, setLogsLoading] = React.useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      console.log("Super Admin Stats Response:", json);
      if (json.success) {
        setData(json);
      } else {
        console.error("Stats API returned error:", json);
        toast.error("Failed to load system stats.");
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      toast.error("Failed to load system stats.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/logs");
      const json = await res.json();
      if (json.success) {
        setSystemLogs(json.logs);
      }
    } catch (err) {
      toast.error("Failed to fetch system activity.");
    } finally {
      setLogsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  React.useEffect(() => {
    if (showLogs) fetchLogs();
  }, [showLogs]);


  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-10">
          <Skeleton className="h-12 w-80 bg-gray-100" />
          <Skeleton className="h-12 w-40 bg-gray-100 rounded-md border border-gray-300" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="w-20 h-20 bg-red-50 rounded-md border border-gray-300 flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Failed to load Dashboard</h2>
        <p className="text-gray-500 max-w-sm">
          There was an error connecting to the management console.
        </p>
        <Button variant="primary" onClick={() => fetchStats()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const { stats } = data;

  const metrics = [
    {
      label: "Active Partners",
      value: stats.totalPartners,
      icon: Users,
      color: "text-gray-500",
      bg: "bg-gray-50",
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Clock,
      color: "text-hope-green",
      bg: "bg-green-50",
      highlight: parseInt(stats.pendingApprovals) > 0,
    },
    {
      label: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Sales Converted",
      value: stats.salesConverted,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Sales",
      value: stats.salesTotal,
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-4 sm:p-8 space-y-8 md:space-y-10"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-hope-green/10 rounded-md border border-gray-300 flex items-center justify-center">
                <Crown className="w-5 h-5 text-hope-green" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
                Super Admin
              </h1>
            </div>
            <p className="text-gray-500 mt-1 font-medium text-sm ml-1">
              Enterprise oversight for the HOPE Cafe Referral Network.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-600 border border-gray-300 hover:bg-gray-50 h-11 px-6 rounded-md"
              onClick={() => setShowLogs(true)}
            >
              <Bell className="w-4 h-4" /> Activity Logs
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
          {metrics.map((s: any, idx: number) => (
            <motion.div key={idx} variants={item} className="h-full">
              <Card
                className={cn(
                  "h-full border border-gray-300 glass-card hover:-translate-y-2 cursor-pointer group",
                  s.highlight && "ring-2 ring-hope-green/20",
                )}
              >
                <CardContent className="p-8 h-full flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-md border border-gray-300 flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                        s.bg,
                      )}
                    >
                      <s.icon className={cn("w-7 h-7 shrink-0", s.color)} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {s.label}
                      </h3>
                      <p className="text-4xl font-extrabold text-gray-900 mt-1">
                        {s.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item}>
          <PerformanceInsights data={data.weeklyPerformance || []} />
        </motion.div>
      </motion.div>

      {/* System Logs Panel */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowLogs(false)}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col"
          >
            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  System Activity
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-widest">
                  Network Audit Feed
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogs(false)}
                className="rounded-md border border-gray-300"
              >
                <XCircle className="w-6 h-6 text-gray-300" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {logsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-md bg-gray-50" />
                  ))}
                </div>
              ) : systemLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <BarChart3 className="w-16 h-16 mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">
                    No recent activity
                  </p>
                </div>
              ) : (
                systemLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-32px] before:w-[2px] before:bg-gray-100 last:before:hidden"
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-1 w-[24px] h-[24px] rounded-full flex items-center justify-center z-10",
                        log.type === "TRANSACTION"
                          ? "bg-green-100 text-green-600"
                          : "bg-purple-100 text-purple-600",
                      )}
                    >
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-gray-900 text-sm">{log.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-4">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
