"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Waves,
  Compass,
  Coffee,
  UserPlus,
  ShieldCheck,
  QrCode,
  Banknote,
  Building2
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import EarningsCalculator from "@/components/EarningsCalculator";
import FAQ from "@/components/FAQ";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Dynamic Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[80%] h-full bg-gradient-to-bl from-hope-purple/20 via-hope-gold/5 to-transparent blur-[120px] opacity-60" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 w-[60%] h-[80%] bg-gradient-to-tr from-hope-green/10 via-transparent to-transparent blur-[100px] opacity-40" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10 text-center">
          <motion.div
            {...fadeInUp}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-10 hover:-translate-y-0.5 transition-transform cursor-default"
          >
            <Sparkles className="w-4 h-4 text-hope-purple animate-pulse" />
            <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-hope-purple to-hope-pink">Hope Cafe</span>
          </motion.div>

          <motion.h1
            {...fadeInUp}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight"
          >
            Hope Cafe <br />
            <span className="relative inline-block mt-4 md:mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-hope-green via-hope-pink to-hope-gold relative z-10">Partner Hub</span>
              {/* Highlight stroke behind text */}
              <div className="absolute inset-x-0 bottom-2 md:bottom-4 h-[15%] bg-hope-gold/15 -z-0 rounded-full scale-110 blur-[1px]" />
            </span>
          </motion.h1>

          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-14 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            Empowering the local hospitality ecosystem. Refer guests to Hope Cafe and unlock a
            <span className="text-gray-900 font-bold mx-2 relative whitespace-nowrap">
              <span className="relative z-10">7.5% referral commission</span>
              <svg className="absolute w-full h-full -bottom-1 left-0 text-hope-green/20 -z-0" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,15 Q50,20 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            on every interaction.
          </motion.p>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="w-full sm:w-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-hope-green to-hope-pink rounded-md blur-lg opacity-40 group-hover:opacity-60 group-hover:blur-xl transition-all duration-500" />
              <Button size="lg" className="w-full relative bg-gradient-to-r from-hope-green to-hope-pink hover:from-hope-pink hover:to-hope-green border border-gray-300 h-14 px-10 text-lg rounded-md shadow-xl transition-all hover:-translate-y-1">
                Become a Partner <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-14 px-10 text-lg rounded-md border border-gray-300 hover:border-hope-purple/50 hover:bg-purple-50/50 text-gray-700 bg-white/50 backdrop-blur-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                Partner Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 bg-gray-50/50 relative overflow-hidden text-center">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">The Partner Advantage</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          >
            {[
              { title: "₹500 Joining Bonus", desc: "Instant wallet credit upon verification of your partner profile.", icon: Zap, color: "text-blue-600", bg: "bg-blue-100/50", border: "hover:border-blue-200" },
              { title: "7.5% Commission", desc: "Highest-in-class referral fee for every single bill generated at HOPE Cafe.", icon: TrendingUp, color: "text-hope-green", bg: "bg-hope-green/10", featured: true, border: "border-hope-green/20" },
              { title: "Real-time Payouts", desc: "Track earnings live and withdraw weekly directly to your bank account.", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100/50", border: "hover:border-emerald-200" },
            ].map((benefit, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="group h-full">
                <div className={cn(
                   "relative h-full bg-white/80 backdrop-blur-xl rounded-md p-10 text-center transition-all duration-500 border border-gray-300 hover:-translate-y-3",
                  benefit.border,
                  benefit.featured ? "shadow-[0_20px_60px_-15px_rgba(255,183,3,0.3)]" : "shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
                )}>
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />

                  <div className="relative z-10">
                    <div className={cn("w-20 h-20 rounded-md border border-gray-300 flex items-center justify-center mx-auto mb-8 shadow-inner transition-transform duration-500 group-hover:scale-110", benefit.bg)}>
                      <benefit.icon className={cn("w-10 h-10 transition-transform duration-500 group-hover:-rotate-6", benefit.color)} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                    <p className="text-gray-500 text-base leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who Can Join Section */}
      <section className="py-24 bg-purple-50/30 border-y border-purple-100/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Who Can Join as a Partner?</h2>
            <p className="text-gray-600 mt-4">Any tourism-facing business can earn commission by referring guests to Hope Cafe.</p>
          </div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto"
          >
            {[
              { icon: "🤝", label: "Partner Network", desc: "Refer guests & earn" },
              { icon: "🏡", label: "Homestays & Guest Houses", desc: "Small-stay referrals" },
              { icon: "🏝️", label: "Resorts & Boutique Stays", desc: "Premium guest base" },
              { icon: "🛏️", label: "Hostels & Backpacker Lodges", desc: "High tourist volume" },
              { icon: "🚕", label: "Taxi & Car Rentals", desc: "Drivers recommend dining" },
              { icon: "🛵", label: "Bike & Scooter Rentals", desc: "Tourists exploring town" },
              { icon: "🗺️", label: "Tour & Travel Agencies", desc: "Full itinerary planners" },
              { icon: "👤", label: "Local Travel Guides", desc: "Trusted personal recommendations" },
              { icon: "🧘", label: "Yoga & Wellness Centers", desc: "Health-conscious repeat guests" },
              { icon: "🏄", label: "Adventure Activity Centers", desc: "Hungry after activities" },
              { icon: "🛶", label: "Water Sports Centers", desc: "Beach-side dining referrals" },
              { icon: "🎉", label: "Event Organizers", desc: "Group dining & events" },
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] lg:w-[calc(25%-12px)]">
                <div className="group flex items-start gap-3 px-5 py-5 bg-white border border-gray-300 rounded-md shadow-sm hover:shadow-md hover:border-hope-purple/30 hover:-translate-y-1 transition-all cursor-default h-full">
                  <div className="w-10 h-10 bg-purple-50 rounded-md border border-gray-300 flex items-center justify-center shrink-0 text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-snug mb-0.5">{item.label}</p>
                    <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
        {/* Premium atmospheric elements */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hope-purple/5 rounded-full blur-[100px] -z-10 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-hope-purple animate-pulse" />
              <span className="text-xs font-bold text-gray-600">Process</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 relative inline-block">
              The Partner Workflow
            </h2>
            <p className="text-gray-600 text-xl md:text-2xl max-w-2xl mx-auto">
              Simple. Transparent. <span className="text-gray-900 font-bold decoration-hope-purple decoration-2 underline-offset-8 underline">Rewarding.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative mt-16 text-center">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[48px] left-[12%] right-[12%] h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent z-0 rounded-full" />

            {[
              { id: "01", title: "Apply", desc: "Quick registration with basic business details.", icon: UserPlus },
              { id: "02", title: "Verify", desc: "KYC review by the HOPE Cafe management team.", icon: ShieldCheck },
              { id: "03", title: "Engage", desc: "Share your unique QR code with your travellers.", icon: QrCode },
              { id: "04", title: "Earn", desc: "Automated 7.5% credit on every scan result.", icon: Banknote },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.2, duration: 0.7, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center group cursor-default"
              >
                {/* Number Node */}
                <div className="w-24 h-24 bg-white rounded-md shadow-xl shadow-gray-200/50 flex flex-col items-center justify-center mb-8 relative group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-hope-purple/20 transition-all duration-500 border border-gray-300 ring-4 ring-white">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-hope-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="text-xs font-semibold text-gray-400 mb-1 group-hover:text-hope-purple/80 transition-colors">Step</span>
                  <span className="text-4xl font-bold text-gray-900 group-hover:text-hope-purple transition-colors z-10 leading-none">{step.id}</span>
                </div>

                {/* Content Card */}
                <div className="bg-white/70 backdrop-blur-xl p-8 rounded-md text-center shadow-lg shadow-gray-100/50 border border-gray-300 group-hover:border-hope-purple/20 transition-all duration-500 w-full flex-1">
                  <div className="w-12 h-12 rounded-md border border-gray-300 bg-gray-50 group-hover:bg-hope-purple/10 flex items-center justify-center mx-auto mb-6 transition-colors duration-500">
                    <step.icon className="w-6 h-6 text-gray-600 group-hover:text-hope-purple transition-colors duration-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h4>
                  <p className="text-base text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-32 bg-purple-50 relative overflow-hidden">
        {/* Dynamic Light Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-hope-purple/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="xl:col-span-2 space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-purple-200/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-hope-purple animate-pulse" />
                <span className="text-xs font-bold text-gray-600">Revenue Model</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Calculate Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-hope-purple to-hope-pink">Growth Margin</span>
              </h2>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                We believe in shared prosperity. By connecting your hospitality business to Hope Cafe, you don't just refer guests—you build a sustainable revenue stream.
              </p>
              <div className="space-y-5 pt-4">
                {[
                  "No hidden fees or joining costs",
                  "Automated tracking via secure QR",
                  "Dedicated partner success manager",
                ].map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    key={i}
                    className="flex gap-4 items-center group"
                  >
                    <div className="w-8 h-8 rounded-md bg-white border border-gray-300 flex items-center justify-center shadow-sm group-hover:bg-hope-purple/10 group-hover:border-hope-purple/20 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-hope-purple" />
                    </div>
                    <span className="text-base font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="xl:col-span-3 relative"
            >
              <div className="absolute inset-0 bg-hope-purple/20 rounded-[3rem] blur-2xl -z-10" />
              <div className="bg-white/40 backdrop-blur-3xl border border-gray-300 rounded-md p-2 shadow-2xl overflow-hidden">
                <div className="bg-white rounded-md border border-gray-300 overflow-hidden">
                  <EarningsCalculator />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-20 space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-gray-900"
            >
              Intelligence & <span className="text-gray-300">Answers</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-xl max-w-2xl mx-auto"
            >
              Everything you need to know about joining the Hope Cafe Channel Partner Network.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto bg-gray-50/50 rounded-md p-4 md:p-8 border border-gray-300 shadow-sm"
          >
            <FAQ />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-20 pb-12 bg-gradient-to-br from-hope-purple to-[#431D6D] border-t border-hope-purple/20 overflow-hidden">
        {/* Footer Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-white/20 pb-10 mb-10">
            <Link href="/" className="flex items-center group">
              <div className="h-12 w-auto relative group-hover:scale-105 transition-transform duration-500">
                <img src="/logo.png" alt="Hope Cafe" className="h-full w-auto object-contain brightness-0 invert" />
              </div>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/login" className="text-sm font-bold text-purple-100 hover:text-white transition-colors">
                Partner Login
              </Link>
              <Link href="/register" className="text-sm font-bold text-white hover:text-purple-100 transition-colors">
                Apply Now
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-purple-200 text-xs font-semibold" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} Hope Cafe.
            </p>
            <div className="flex items-center gap-6">
              {['Terms', 'Privacy', 'Contact'].map((item) => (
                <span key={item} className="text-purple-200 text-xs font-semibold cursor-pointer hover:text-white transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

