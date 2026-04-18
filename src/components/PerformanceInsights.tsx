"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface PerformanceData {
    name: string;
    referrals: number;
    revenue: number;
}

export default function PerformanceInsights({ 
    data = [],
    commissionRate = 7.5
}: { 
    data?: PerformanceData[],
    commissionRate?: number
}) {
    // Fallback if data is empty
    const chartData = data.length > 0 ? data : [
        { name: "Mon", referrals: 0, revenue: 0 },
        { name: "Tue", referrals: 0, revenue: 0 },
        { name: "Wed", referrals: 0, revenue: 0 },
        { name: "Thu", referrals: 0, revenue: 0 },
        { name: "Fri", referrals: 0, revenue: 0 },
        { name: "Sat", referrals: 0, revenue: 0 },
        { name: "Sun", referrals: 0, revenue: 0 },
    ];

    const todayVelocity = data.length > 0 ? data[data.length - 1].referrals : 0;
    const totalExpectedPayout = data.reduce((acc, curr) => acc + curr.revenue, 0) * (commissionRate / 100);

    return (
        <div className="grid grid-cols-1 gap-8">
            <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md overflow-hidden relative">
                <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between relative z-10 bg-white">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight">Referral Momentum</CardTitle>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time 7-Day Performance</p>
                    </div>
                    <div className="flex items-center gap-2 bg-hope-green/10 px-4 py-2 rounded-md border border-gray-300">
                        <TrendingUp className="w-4 h-4 text-hope-green" />
                        <span className="text-xs font-black text-hope-green uppercase tracking-widest">{todayVelocity} Activity Today</span>
                    </div>
                </CardHeader>
                <CardContent className="p-8 h-[400px] relative">
                    {/* Grid Background Pattern - Scoped to chart ONLY */}
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-[0.8]" 
                        style={{ 
                            backgroundImage: `linear-gradient(#f3f4f6 1.5px, transparent 1.5px), linear-gradient(90deg, #f3f4f6 1.5px, transparent 1.5px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    
                    <div className="relative z-10 w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRef" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 700}}
                                    dy={10}
                                />
                                <YAxis 
                                    hide 
                                />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '6px', border: '1px solid #d1d5db', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#2D6A4F', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="referrals" 
                                    stroke="#2D6A4F" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorRef)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* <div className="flex flex-col lg:flex-row gap-6">
                <Card className="border border-gray-300 bg-gradient-to-br from-[#1a1a1a] to-gray-900 text-white shadow-2xl rounded-md p-4 flex-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-hope-green/20 rounded-full blur-3xl -z-0 group-hover:bg-hope-green/40 transition-all" />
                    <CardHeader className="relative z-10">
                        <p className="text-[10px] font-black text-hope-green uppercase tracking-widest mb-1">Elite Forecast</p>
                        <CardTitle className="text-3xl font-black tracking-tight">Expected Payout</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col justify-between flex-1">
                        <div>
                            <p className="text-5xl font-black text-white tracking-tighter">₹{Math.round(totalExpectedPayout).toLocaleString()}</p>
                            <p className="text-xs font-bold text-gray-400 mt-2 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3 text-hope-green" /> 
                                Based on current weekly velocity
                            </p>
                        </div>
                        <div className="mt-8 p-4 bg-white/10 rounded-md border border-gray-300 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Growth Threshold</span>
                                <span className="text-[10px] font-black text-hope-green uppercase tracking-widest">88%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-md overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "88%" }}
                                    transition={{ duration: 1.5 }}
                                    className="h-full bg-hope-green shadow-[0_0_8px_rgba(45,106,79,0.8)]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-300 bg-white shadow-xl shadow-gray-200/50 rounded-md p-4 flex-1 group">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-md border border-gray-300 bg-gray-50 flex items-center justify-center group-hover:bg-hope-green/10 transition-colors">
                            <Users className="w-8 h-8 text-gray-400 group-hover:text-hope-green transition-colors" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement Rate</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">94.2%</p>
                        </div>
                    </CardContent>
                </Card>
            </div> */}
        </div>
    );
}
