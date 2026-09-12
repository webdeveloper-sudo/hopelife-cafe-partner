"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download,
  Smartphone,
  ShieldCheck,
  Zap,
  QrCode,
  Wallet,
  Bell,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const APK_FILENAME = "hope-partners-programm.apk";
const APK_DOWNLOAD_PATH = `/${APK_FILENAME}`;
const APP_VERSION = "1.0.0";
const PACKAGE_NAME = "network.hopecafe.hub.partner";

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const installSteps = [
  {
    step: "01",
    title: "Download the APK",
    description: "Tap the download button above to save the official hope-partners-programm.apk installer to your Android device."
  },
  {
    step: "02",
    title: "Open the Installer",
    description: "Swipe down to open your notification tray and tap the completed download, or locate it in your Files / Downloads folder."
  },
  {
    step: "03",
    title: "Allow Unknown Apps (if asked)",
    description: "If Android prompts you with a security message, tap 'Settings' and toggle on 'Allow from this source'."
  },
  {
    step: "04",
    title: "Install & Launch",
    description: "Tap 'Install'. Once finished, open HOPE Hub and sign in with your partner mobile number or credentials."
  }
];

const appFeatures = [
  {
    icon: QrCode,
    title: "Instant Guest Passes",
    description: "Generate and share personalized discount passes with your guests via WhatsApp or QR in seconds."
  },
  {
    icon: Wallet,
    title: "Live Earnings & Balance",
    description: "Track your settlement balance, bonus rewards, and commission logs updated in real time."
  },
  {
    icon: Bell,
    title: "Real-time Scan Alerts",
    description: "Get immediate confirmation whenever your referred guests visit Hope Cafe and redeem their discounts."
  },
  {
    icon: Zap,
    title: "Built for Everyday Speed",
    description: "Lightweight, responsive, and optimized for fast daily interactions right from your home screen."
  }
];

export default function DownloadAppPage() {
  const [downloadStarted, setDownloadStarted] = React.useState(false);

  const handleDownloadClick = () => {
    setDownloadStarted(true);
  };

  return (
    <div className="min-h-screen bg-surface-light text-gray-900 flex flex-col selection:bg-hope-purple selection:text-white">
      {/* Top decorative gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-hope-purple via-hope-pink to-hope-gold sticky top-0 z-50" />

      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-1.5 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-200 overflow-hidden p-1">
              <img src="/logo.png" alt="HOPE Cafe Logo" className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-lg text-gray-900 block tracking-tight">HOPE Hub</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Partner App</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-gray-600 hover:text-hope-purple px-3 py-2 rounded-md hover:bg-hope-purple/5 transition-colors hidden sm:inline-block"
            >
              Partner Login
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="h-9 px-3 text-xs font-bold border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to</span> Web Hub
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12">
        {/* Hero Card */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="relative bg-white rounded-2xl border border-gray-300 shadow-xl shadow-gray-200/50 p-6 sm:p-10 md:p-12 overflow-hidden text-center"
        >
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-16 w-80 h-80 bg-hope-purple/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 -mb-16 -mr-16 w-64 h-64 bg-hope-gold/10 rounded-full blur-3xl pointer-events-none" />

          {/* App Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-800 text-[11px] font-black uppercase tracking-wider mb-6 shadow-xs">
            <Smartphone className="w-3.5 h-3.5 text-green-600" />
            <span>Official Android APK</span>
          </div>

          {/* App Icon */}
          <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl p-3 shadow-xl shadow-gray-300/60 border border-gray-200 flex items-center justify-center mb-6 relative group transition-transform hover:scale-105">
            <img src="/logo.png" alt="HOPE Hub App Icon" className="w-full h-full object-contain" />
            <div className="absolute -bottom-2 -right-2 bg-hope-green text-white p-1.5 rounded-full shadow-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Titles */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            Take HOPE Hub with you.
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium max-w-xl mx-auto mb-8 leading-relaxed">
            Access HOPE Hub conveniently from your Android device. Track guest referrals, monitor live commissions, and manage your partner account anytime, anywhere.
          </p>

          {/* Primary Action Button */}
          <div className="max-w-md mx-auto space-y-3">
            <a
              href={APK_DOWNLOAD_PATH}
              download={APK_FILENAME}
              onClick={handleDownloadClick}
              className="w-full inline-flex items-center justify-center gap-3 bg-hope-purple hover:bg-[#4A2470] active:scale-[0.99] text-white font-black text-base sm:text-lg h-14 sm:h-16 px-8 rounded-xl shadow-xl shadow-hope-purple/25 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-hope-purple/20"
              aria-label="Download HOPE Hub Android App APK file"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 animate-bounce" />
              <span>Download Android App</span>
            </a>

            {/* Quick specifications */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold pt-1">
              <span>APK Installer</span>
              <span>•</span>
              <span>Android 8.0+</span>
              <span>•</span>
              <span>v{APP_VERSION}</span>
              <span>•</span>
              <span className="text-green-700 font-bold inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified & Safe
              </span>
            </div>
          </div>

          {/* Feedback banner after tapping download */}
          {downloadStarted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl max-w-md mx-auto text-left flex items-start gap-3"
            >
              <Sparkles className="w-5 h-5 text-hope-purple shrink-0 mt-0.5" />
              <div className="text-xs text-purple-950 space-y-0.5">
                <p className="font-bold">Download requested!</p>
                <p className="text-purple-700 leading-normal">
                  Check your browser notification or Downloads folder for <span className="font-mono font-bold text-purple-900">{APK_FILENAME}</span>. Follow the 4 simple steps below to install.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Feature Cards Grid */}
        <section aria-labelledby="features-heading" className="space-y-4">
          <div className="text-center sm:text-left">
            <h2 id="features-heading" className="text-xs font-black uppercase tracking-widest text-gray-400">
              Why use the Mobile App
            </h2>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
              Everything you need in your pocket
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {appFeatures.map((f, i) => (
              <Card key={i} className="border border-gray-300 bg-white shadow-sm rounded-xl p-5 sm:p-6 transition-all hover:border-hope-purple/40 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-hope-purple/10 border border-hope-purple/20 flex items-center justify-center text-hope-purple shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 leading-snug">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed mt-1">{f.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Installation Instructions */}
        <section aria-labelledby="install-heading" className="bg-white rounded-2xl border border-gray-300 p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-hope-purple" />
              <h2 id="install-heading" className="text-xs font-black uppercase tracking-widest text-gray-400">
                Installation Guide
              </h2>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
              How to install the APK on your Android phone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {installSteps.map((s, idx) => (
              <div key={idx} className="p-4 sm:p-5 rounded-xl bg-gray-50/80 border border-gray-200 flex gap-4">
                <span className="font-black text-lg text-hope-purple/40 shrink-0 select-none">
                  {s.step}
                </span>
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-gray-900">{s.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-bold">Note for first-time APK installers:</strong> Android shows a standard warning whenever installing apps directly from a browser. HOPE Hub is completely safe and officially built for Hope Cafe network partners.
            </p>
          </div>
        </section>

        {/* Technical App Details Pillbox */}
        <section aria-label="Technical Specifications" className="p-6 bg-white rounded-2xl border border-gray-300 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="p-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Package</span>
              <span className="text-xs font-bold text-gray-800 font-mono mt-1 block truncate" title={PACKAGE_NAME}>
                {PACKAGE_NAME}
              </span>
            </div>
            <div className="p-2 pt-4 sm:pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Version</span>
              <span className="text-xs font-bold text-gray-800 mt-1 block">v{APP_VERSION}</span>
            </div>
            <div className="p-2 pt-4 sm:pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Platform</span>
              <span className="text-xs font-bold text-gray-800 mt-1 block">Android 8.0+</span>
            </div>
            <div className="p-2 pt-4 sm:pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Format</span>
              <span className="text-xs font-bold text-gray-800 mt-1 block">Android APK</span>
            </div>
          </div>
        </section>

        {/* Web Portal Alternative */}
        <div className="text-center py-4 space-y-3">
          <p className="text-xs text-gray-500 font-medium">Prefer using your browser?</p>
          <div className="flex justify-center items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-black uppercase tracking-wider text-hope-purple hover:underline flex items-center gap-1"
            >
              <span>Partner Web Login</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/register"
              className="text-xs font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <span>Join Partner Network</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-[#3E1E5E] text-white text-center border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md p-0.5 flex items-center justify-center">
              <img src="/logo.png" alt="HOPE Cafe" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm tracking-tight text-white">HOPE Cafe Partner Network</span>
          </div>
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Hope Cafe Puducherry. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
