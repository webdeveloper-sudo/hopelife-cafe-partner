"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { TrendingUp, Users, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const data = [
    { name: "Mon", referrals: 12, revenue: 4500 },
    { name: "Tue", referrals: 19, revenue: 5200 },
    { name: "Wed", referrals: 15, revenue: 4800 },
    { name: "Thu", referrals: 22, revenue: 6100 },
    { name: "Fri", referrals: 30, revenue: 8400 },
    { name: "Sat", referrals: 45, revenue: 12000 },
    { name: "Sun", referrals: 38, revenue: 9500 },
];

export default function PerformanceInsights() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none bg-white shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tight">Referral Momentum</CardTitle>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Last 7 Days Activity</p>
                    </div>
                    <div className="flex items-center gap-2 bg-hope-green/10 px-4 py-2 rounded-xl border border-hope-green/10">
                        <TrendingUp className="w-4 h-4 text-hope-green" />
                        <span className="text-xs font-black text-hope-green uppercase tracking-widest">+24% Today</span>
                    </div>
                </CardHeader>
                <CardContent className="p-8 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
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
                                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
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
                </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
                <Card className="border-none bg-gradient-to-br from-[#1a1a1a] to-gray-900 text-white shadow-2xl rounded-[2.5rem] p-4 flex-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-hope-green/20 rounded-full blur-3xl -z-0 group-hover:bg-hope-green/40 transition-all" />
                    <CardHeader className="relative z-10">
                        <p className="text-[10px] font-black text-hope-green uppercase tracking-widest mb-1">Elite Forecast</p>
                        <CardTitle className="text-3xl font-black tracking-tight">Expected Payout</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col justify-between flex-1">
                        <div>
                            <p className="text-5xl font-black text-white tracking-tighter">₹42,850</p>
                            <p className="text-xs font-bold text-gray-400 mt-2 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3 text-hope-green" /> 
                                Based on current weekly velocity
                            </p>
                        </div>
                        <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Growth Threshold</span>
                                <span className="text-[10px] font-black text-hope-green uppercase tracking-widest">88%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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

                <Card className="border-none bg-white shadow-xl shadow-gray-200/50 rounded-[2.5rem] p-4 flex-1 group">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-hope-green/10 transition-colors">
                            <Users className="w-8 h-8 text-gray-400 group-hover:text-hope-green transition-colors" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Conversion Rate</p>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">84.2%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
