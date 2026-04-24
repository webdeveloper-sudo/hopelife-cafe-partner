"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Coffee,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
} as const;

/* ─── Cafe Ring Watermark ─────────────────────────────────────── */
const CafeRings = () => (
  <svg
    className="absolute pointer-events-none select-none"
    style={{ bottom: "8%", right: "5%", width: 320, height: 320, opacity: 0.045 }}
    viewBox="0 0 320 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="140" cy="140" r="130" stroke="#5D2E8C" strokeWidth="2.5" />
    <circle cx="140" cy="140" r="100" stroke="#5D2E8C" strokeWidth="1.2" />
    <circle cx="180" cy="170" r="115" stroke="#D81B60" strokeWidth="1.5" />
    <circle cx="180" cy="170" r="85" stroke="#D81B60" strokeWidth="0.8" />
    <circle cx="160" cy="155" r="72" stroke="#5D2E8C" strokeWidth="1" />
  </svg>
);

/* ─── Floating Coffee Beans ───────────────────────────────────── */
const CoffeeBeans = () => {
  const beans = [
    { x: "8%",  y: "15%", size: 18, delay: 0,    dur: 9  },
    { x: "92%", y: "22%", size: 14, delay: 1.5,  dur: 11 },
    { x: "20%", y: "78%", size: 22, delay: 3,    dur: 8  },
    { x: "75%", y: "65%", size: 16, delay: 2,    dur: 13 },
    { x: "45%", y: "88%", size: 12, delay: 4,    dur: 10 },
    { x: "60%", y: "10%", size: 20, delay: 0.8,  dur: 12 },
    { x: "88%", y: "82%", size: 15, delay: 5,    dur: 9  },
    { x: "5%",  y: "50%", size: 11, delay: 2.5,  dur: 14 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {beans.map((b, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", left: b.x, top: b.y }}
          animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={b.size} height={b.size * 1.3} viewBox="0 0 20 26" fill="none">
            <ellipse cx="10" cy="13" rx="9" ry="12" fill="#5D2E8C" opacity="0.12" />
            <path d="M10 3 Q10 13 10 23" stroke="#5D2E8C" strokeWidth="1.2" opacity="0.2" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

/* ─── Steam Wisps ─────────────────────────────────────────────── */
const SteamWisps = ({ count = 3, color = "#5D2E8C" }: { count?: number; color?: string }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          left: `${20 + i * 30}%`,
          bottom: "10%",
          width: 2,
          height: 60 + i * 20,
          background: `linear-gradient(to top, ${color}22, transparent)`,
          borderRadius: 99,
          filter: "blur(3px)",
        }}
        animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.3, 0.7, 0.3], x: [0, 8 * (i % 2 === 0 ? 1 : -1), 0] }}
        transition={{ duration: 4 + i, delay: i * 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Mesh Gradient Canvas ────────────────────────────────────── */
const MeshGradient = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.003;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const points = [
        { x: w * (0.2 + Math.sin(t) * 0.1),        y: h * (0.2 + Math.cos(t * 0.8) * 0.1),       r: "#5D2E8C14" },
        { x: w * (0.8 + Math.cos(t * 1.1) * 0.08), y: h * (0.15 + Math.sin(t * 0.7) * 0.12),      r: "#D81B6010" },
        { x: w * (0.5 + Math.sin(t * 0.9) * 0.15), y: h * (0.75 + Math.cos(t * 1.2) * 0.1),       r: "#FFB70312" },
        { x: w * (0.15 + Math.cos(t * 0.6) * 0.1), y: h * (0.7 + Math.sin(t * 1.3) * 0.08),       r: "#2D6A4F0E" },
      ];

      for (const p of points) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.min(w, h) * 0.45);
        grad.addColorStop(0, p.r);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "multiply" }}
    />
  );
};

/* ─── Latte Art SVG (background watermark) ───────────────────── */
const LatteArtBg = () => (
  <svg
    className="absolute pointer-events-none select-none"
    style={{ top: "5%", left: "2%", width: 260, height: 260, opacity: 0.035 }}
    viewBox="0 0 260 260"
    fill="none"
  >
    {/* cup outline */}
    <path d="M50 80 L70 220 Q130 240 190 220 L210 80 Z" stroke="#5D2E8C" strokeWidth="3" fill="none" />
    {/* saucer */}
    <ellipse cx="130" cy="235" rx="90" ry="12" stroke="#5D2E8C" strokeWidth="2" fill="none" />
    {/* latte art swirl */}
    <path d="M130 100 Q160 110 130 130 Q100 150 130 170 Q160 190 130 210" stroke="#5D2E8C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M100 115 Q130 125 130 145 Q130 165 100 175" stroke="#5D2E8C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M160 115 Q130 125 130 145 Q130 165 160 175" stroke="#5D2E8C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* handle */}
    <path d="M210 120 Q250 135 240 165 Q230 195 200 185" stroke="#5D2E8C" strokeWidth="2.5" fill="none" />
  </svg>
);

/* ─── Cursor-following Glow for Feature Cards ─────────────────── */
const GlowCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 30 });
  const sy = useSpring(my, { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };
  const handleMouseLeave = () => {
    mx.set(9999);
    my.set(9999);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Spotlight glow that follows cursor */}
      <motion.div
        className="absolute pointer-events-none z-0 rounded-full"
        style={{
          width: 240,
          height: 240,
          background: "radial-gradient(circle, rgba(93,46,140,0.10) 0%, transparent 70%)",
          x: useTransform(sx, (v) => v - 120),
          y: useTransform(sy, (v) => v - 120),
        }}
      />
      {children}
    </motion.div>
  );
};

/* ─── Spinning Coffee Cup Icon ────────────────────────────────── */
const SpinningCup = () => (
  <motion.div
    animate={{ rotate: [0, 5, -5, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className="absolute -bottom-8 -left-8 opacity-[0.06] pointer-events-none"
  >
    <Coffee size={140} color="#5D2E8C" />
  </motion.div>
);

/* ─── Dotted Grid with subtle pulse ──────────────────────────── */
const PulsingGrid = ({ color = "#5D2E8C", opacity = 0.035 }: { color?: string; opacity?: number }) => (
  <motion.div
    animate={{ opacity: [opacity, opacity * 1.8, opacity] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`,
      backgroundSize: "40px 40px",
    }}
  />
);

/* ─── Animated gradient border stripe ────────────────────────── */
const GradientTopBorder = () => (
  <motion.div
    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    className="absolute top-0 left-0 w-full h-[3px]"
    style={{
      background: "linear-gradient(90deg, #5D2E8C, #FFB703, #D81B60, #2D6A4F, #5D2E8C)",
      backgroundSize: "300% 100%",
    }}
  />
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1A1A1A] selection:bg-hope-purple/20">
      <Header />

      {/* ══════════════════════════════════════════════════
          HERO SECTION — Enhanced white bg
      ══════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-52 overflow-hidden">
        {/* Live mesh gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F6] via-white to-[#FFF9F0]">
          <MeshGradient />
        </div>

        {/* Pulsing dot grid */}
        <PulsingGrid />

        {/* Cafe watermarks */}
        <LatteArtBg />
        <CafeRings />

        {/* Floating coffee beans */}
        <CoffeeBeans />

        {/* Steam wisps */}
        <SteamWisps count={4} color="#5D2E8C" />

        {/* Original floating blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-hope-purple/10 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-hope-gold/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] left-[25%] w-[30%] h-[30%] bg-hope-pink/5 rounded-full blur-[90px]"
          />

          {/* Decorative geometric circles */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.05] pointer-events-none">
            <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
              <circle cx="500" cy="0" r="480" stroke="#5D2E8C" strokeWidth="2" strokeDasharray="10 10" />
              <circle cx="500" cy="0" r="400" stroke="#D81B60" strokeWidth="1.5" />
              <circle cx="500" cy="0" r="320" stroke="#2D6A4F" strokeWidth="1" strokeDasharray="5 5" />
              <circle cx="500" cy="0" r="240" stroke="#FFB703" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Animated gradient top border */}
        {/* <GradientTopBorder /> */}

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col items-center text-center">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-white border border-hope-purple/20 mb-10 shadow-xl shadow-hope-purple/5"
            >
              <Sparkles className="w-3.5 h-3.5 text-hope-purple" />
              <span className="text-[10px] font-bold text-hope-purple uppercase tracking-[0.25em]">
                Puducherry's Premier Partner Ecosystem
              </span>
            </motion.div>

            <motion.h1
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-[#1A1A1A] mb-10 leading-[0.95] tracking-tight max-w-5xl"
            >
              Collaborative Growth for the{" "}
              <span className="text-hope-purple underline decoration-hope-gold/40 underline-offset-8">
                Local Hospitality
              </span>{" "}
              Community
            </motion.h1>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-700/80 mb-14 max-w-3xl leading-relaxed font-medium"
            >
              Unlock new revenue streams by connecting your guests with the Hope Cafe experience. A
              professional referral network built exclusively for Puducherry's finest hospitality businesses.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full h-16 px-14 text-base font-bold bg-hope-purple text-white hover:bg-[#4A2470] transition-all rounded-md shadow-2xl shadow-hope-purple/20 group"
                >
                  Register as a Partner
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-28 pt-14 border-t border-hope-purple/10 w-full flex flex-wrap justify-center gap-x-12 gap-y-6"
            >
              {["Heritage Resorts", "Homestay Units", "Tour Operators", "Vehicle Rentals", "Wellness Centers"].map(
                (item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-hope-gold shadow-[0_0_8px_rgba(255,183,3,0.5)]" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{item}</span>
                  </div>
                )
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRIMARY VALUE — Deep Violet (unchanged)
      ══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-40 bg-[#4A2470] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" className="absolute inset-0">
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
                  Sustainable <br />
                  Shared Success
                </h2>
                <p className="mt-8 text-lg text-white/70 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                  We empower local partners by turning quality referrals into consistent weekly income. No overheads,
                  just community-driven growth.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: TrendingUp, title: "7.5% Revenue Share", desc: "Transparent earnings on every referral bill.", border: "border-hope-gold/30" },
                  { icon: Award, title: "Curated Priority", desc: "Your guests receive priority seating & care.", border: "border-hope-pink/30" },
                  { icon: ShieldCheck, title: "UPI Settlements", desc: "Manual secure withdrawals every week.", border: "border-hope-green/30" },
                  { icon: Zap, title: "Zero Entry Fee", desc: "Built by local cafe owners for local partners.", border: "border-white/20" },
                ].map((box, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-8 bg-white/5 border rounded-md backdrop-blur-sm transition-all hover:bg-white/10",
                      box.border
                    )}
                  >
                    <div className="w-12 h-12 rounded-md flex items-center justify-center mb-6 bg-white/10 text-white shadow-inner">
                      <box.icon className="w-6 h-6 text-hope-gold" />
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2 tracking-tight">{box.title}</h4>
                    <p className="text-white/50 text-xs leading-relaxed font-medium">{box.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-2"
            >
              <div className="bg-white rounded-md shadow-[0_60px_100px_-30px_rgba(0,0,0,0.4)] border border-hope-purple/20 overflow-hidden">
                <div className="bg-white border-b border-hope-purple/5 p-8 flex justify-between items-center">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-hope-purple uppercase tracking-[0.2em] opacity-80">
                      Partner Terminal
                    </p>
                    <p className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Active Portfolio</p>
                  </div>
                  <div className="w-12 h-12 bg-hope-purple rounded-md flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="p-10 space-y-10">
                  <div className="flex justify-between items-center border-b border-hope-purple/5 pb-8">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Weekly Settlement
                      </p>
                      <p className="text-5xl font-black text-[#1A1A1A] tracking-tighter">₹24,850</p>
                    </div>
                    <div className="px-4 py-2 bg-hope-green/10 text-hope-green rounded-md border border-hope-green/20">
                      <p className="text-xs font-bold tracking-widest text-[#1A1A1A]">PAID</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network Impact</p>
                    <div className="relative h-2 bg-hope-purple/10 rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-hope-purple w-[78%] rounded-full shadow-[0_0_10px_rgba(93,46,140,0.3)]" />
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                      <span>Conversion Rate</span>
                      <span className="text-hope-purple">78% Efficiency</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-hope-gold/10 rounded-md -z-10 animate-pulse" />
              <div className="absolute -bottom-16 -left-8 w-40 h-40 bg-hope-pink/10 rounded-md -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURE SECTION — Enhanced white bg
      ══════════════════════════════════════════════════ */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        {/* Warm parchment gradient base */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FEFCF9] via-white to-[#F9F6FE]">
          <MeshGradient />
        </div>

        {/* Gentle dot grid */}
        <PulsingGrid color="#5D2E8C" opacity={0.025} />

        {/* Cafe-themed corner watermarks */}
        <svg
          className="absolute pointer-events-none select-none"
          style={{ top: "5%", right: "3%", width: 200, height: 200, opacity: 0.04 }}
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* stylised coffee cup top-view / pour-over */}
          <circle cx="100" cy="100" r="85" stroke="#5D2E8C" strokeWidth="3" />
          <circle cx="100" cy="100" r="55" stroke="#5D2E8C" strokeWidth="2" />
          <circle cx="100" cy="100" r="25" fill="#5D2E8C" opacity="0.3" />
          {/* pour lines */}
          <line x1="100" y1="15" x2="100" y2="45" stroke="#5D2E8C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="163" y1="37" x2="142" y2="58" stroke="#5D2E8C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="185" y1="100" x2="155" y2="100" stroke="#5D2E8C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Floating beans (fewer, subtler) */}
        {[
          { x: "3%",  y: "20%", size: 14, delay: 0   },
          { x: "95%", y: "60%", size: 12, delay: 2   },
          { x: "50%", y: "92%", size: 10, delay: 3.5 },
        ].map((b, i) => (
          <motion.div
            key={i}
            style={{ position: "absolute", left: b.x, top: b.y }}
            animate={{ y: [-8, 8, -8], rotate: [0, 180, 360] }}
            transition={{ duration: 10, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none"
          >
            <svg width={b.size} height={b.size * 1.3} viewBox="0 0 20 26" fill="none">
              <ellipse cx="10" cy="13" rx="9" ry="12" fill="#5D2E8C" opacity="0.10" />
              <path d="M10 3 Q10 13 10 23" stroke="#5D2E8C" strokeWidth="1.2" opacity="0.15" />
            </svg>
          </motion.div>
        ))}

        {/* Spinning cup (bottom-left corner) */}
        <SpinningCup />

        {/* Gradient top-border */}
        <GradientTopBorder />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Premium Experience",
                desc: "Your guests don't just visit a cafe; they enter a curated space designed for comfort and quality.",
                icon: Coffee,
                accent: "bg-hope-purple",
              },
              {
                title: "Direct Dashboard",
                desc: "Real-time tracking of every referral scan. Full transparency on bill amounts and applied commissions.",
                icon: Users,
                accent: "bg-hope-green",
              },
              {
                title: "Loyalty Integration",
                desc: "Consistent referrals earn your business higher visibility in our own guest recommendation lists.",
                icon: Award,
                accent: "bg-hope-pink",
              },
            ].map((item, i) => (
              <GlowCard
                key={i}
                className="relative p-10 bg-white border border-hope-purple/10 rounded-md group shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-hope-purple/10 transition-all duration-500 cursor-default"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                  className="relative z-10"
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-full h-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-md",
                      item.accent
                    )}
                    style={{ top: "-40px", left: "-40px", right: "-40px" }}
                  />
                  {/* subtle cafe-icon watermark per card */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute top-2 right-2 opacity-[0.04] pointer-events-none"
                  >
                    <Coffee size={80} />
                  </motion.div>

                  <div className="w-16 h-16 rounded-md bg-white border border-hope-purple/10 flex items-center justify-center mb-8 shadow-sm group-hover:bg-hope-purple/5 transition-all relative z-10">
                    <item.icon className="w-7 h-7 text-hope-purple" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-4 tracking-tight relative z-10">{item.title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed relative z-10">{item.desc}</p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-hope-purple uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 relative z-10">
                    Explore Feature <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>

                {/* card bottom accent line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-hope-purple/0 via-hope-purple/40 to-hope-purple/0 rounded-full"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WORKFLOW SECTION — Gold (unchanged)
      ══════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 bg-hope-gold relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(black 1.5px, transparent 1.5px)", backgroundSize: "30px 30px" }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 items-start">
            <div className="lg:col-span-1 border-l-8 border-hope-purple pl-8">
              <h2 className="text-4xl font-extrabold text-[#1A1A1A] tracking-tighter leading-none uppercase">
                Seamless <br />
                Weekly <br />
                Cycle
              </h2>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-12">
              {[
                { step: "01", title: "Activation", desc: "Submit your credentials for verified partner status." },
                { step: "02", title: "Scan Protocol", desc: "Guests scan your master QR to unlock their dynamic pass." },
                { step: "03", title: "Manual Settlement", desc: "Initiate your weekly commission transfer securely via UPI." },
              ].map((item, i) => (
                <div key={i} className="relative pt-8 border-t border-[#1A1A1A]/10">
                  <p className="text-6xl font-black text-[#1A1A1A]/5 absolute top-0 -translate-y-1/2">{item.step}</p>
                  <h4 className="text-xl font-bold text-[#1A1A1A] mb-3">{item.title}</h4>
                  <p className="text-sm font-semibold text-[#1A1A1A]/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA SECTION — Enhanced white bg
      ══════════════════════════════════════════════════ */}
      <section className="py-32 md:py-52 relative overflow-hidden">
        {/* Warm white gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBFF] via-white to-[#FFFDF5]">
          <MeshGradient />
        </div>

        {/* Pulsing grid */}
        <PulsingGrid color="#5D2E8C" opacity={0.022} />

        {/* Cafe decorations */}
        <CafeRings />
        <CoffeeBeans />

        {/* Large faint coffee cup — left side */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-2%] top-[20%] opacity-[0.04] pointer-events-none"
        >
          <Coffee size={220} color="#5D2E8C" />
        </motion.div>

        {/* Decorative half-circle rings right side */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          style={{ width: 300, height: 600, opacity: 0.04 }}
          viewBox="0 0 300 600"
          fill="none"
        >
          {[260, 200, 140, 80].map((r, i) => (
            <circle key={i} cx="300" cy="300" r={r} stroke="#5D2E8C" strokeWidth={i % 2 === 0 ? 2 : 1.2} />
          ))}
        </svg>

        {/* Gradient top border */}
        <GradientTopBorder />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-md shadow-2xl shadow-hope-green/20"
          >
            {/* CTA card — unchanged green gradient */}
            <div className="bg-hope-green p-10 md:p-28 relative overflow-hidden animate-gradient-flow bg-gradient-to-br from-hope-green via-[#1E4D38] to-hope-green">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -right-1/4 w-full h-[150%] bg-white/5 blur-3xl rounded-full"
              />
              <div
                className="absolute inset-0 opacity-10 mix-blend-soft-light"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/fabric-of-squares.png")' }}
              />
              <div className="absolute top-0 right-0 w-1/4 h-full bg-hope-gold/10 -skew-x-12 translate-x-12" />
              <div className="absolute bottom-0 left-0 w-1/4 h-full bg-hope-purple/10 skew-x-12 -translate-x-12" />

              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
                  Expand your business <br />
                  boundaries today.
                </h2>
                <p className="text-white/70 text-lg mb-14 font-medium leading-relaxed">
                  Registration is open for Puducherry-based entities. Become an official Hope Cafe partner within 24
                  hours.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button className="w-full h-18 px-14 bg-white text-hope-green hover:bg-white/90 font-black text-lg rounded-md shadow-2xl shadow-black/10 transition-all hover:scale-[1.03] active:scale-95 leading-none">
                      Register Now
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      className="w-full h-18 px-12 border border-white/20 text-white hover:bg-white/5 font-bold text-lg rounded-md transition-all"
                    >
                      Partner Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER — Deep Purple (unchanged)
      ══════════════════════════════════════════════════ */}
      <footer className="py-28 bg-[#3E1E5E] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-hope-purple via-hope-gold to-hope-pink opacity-80" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-24">
            <div className="max-w-xs space-y-10">
              <div className="p-4 bg-white rounded-md inline-block shadow-xl">
                <img src="/logo.png" alt="Hope Cafe" className="h-10 w-auto" />
              </div>
              <p className="text-sm text-white/50 leading-loose font-medium">
                The official collaborative community of Hope Cafe Puducherry. Connecting heritage, hospitality, and
                quality experiences.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-20 md:gap-40">
              <div className="space-y-8">
                <p className="text-[10px] font-bold text-hope-gold uppercase tracking-[0.3em]">Network Hub</p>
                <div className="flex flex-col gap-5 text-sm text-white/60 font-semibold">
                  <Link href="/register" className="hover:text-hope-gold transition-colors">Apply to Join</Link>
                  <Link href="/login" className="hover:text-hope-gold transition-colors">Member Dashboard</Link>
                  <span className="hover:text-hope-gold transition-colors cursor-pointer">Support Protocol</span>
                </div>
              </div>
              <div className="space-y-8">
                <p className="text-[10px] font-bold text-hope-gold uppercase tracking-[0.3em]">Governance</p>
                <div className="flex flex-col gap-5 text-sm text-white/60 font-semibold">
                  <span className="hover:text-hope-gold transition-colors cursor-pointer">Privacy Charter</span>
                  <span className="hover:text-hope-gold transition-colors cursor-pointer">Member Terms</span>
                  <span className="hover:text-hope-gold transition-colors cursor-pointer">Settlement Law</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] leading-loose">
              &copy; {new Date().getFullYear()} HOPE CAFE PUDUCHERRY. SYSTEM VER 2.0.1
            </p>
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-md border border-white/10 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-hope-green shadow-[0_0_8px_#2D6A4F] animate-pulse" />
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mt-0.5">
                Community Server: Operational
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}