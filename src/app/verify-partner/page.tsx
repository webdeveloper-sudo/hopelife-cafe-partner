"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    MessageSquare, ShieldCheck, Lock, Eye, EyeOff,
    CheckCircle2, ArrowRight, Loader2, RefreshCw, AlertCircle,
    Phone, KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthLayout } from "@/components/AuthLayout";

type VerificationStep = 1 | 2 | 3 | 4; // 1: Request, 2: Enter OTP, 3: Set Password, 4: Done

function VerifyPartnerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryMobile = searchParams.get("mobile") || "";

    const [mobile, setMobile] = useState(queryMobile.replace(/\D/g, "").slice(-10));
    const [isEditingMobile, setIsEditingMobile] = useState(!queryMobile);
    const [step, setStep] = useState<VerificationStep>(1);

    // Step 1: Request OTP State
    const [isRequestingOtp, setIsRequestingOtp] = useState(false);
    const [partnerName, setPartnerName] = useState("");

    // Step 2: OTP State
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [verificationToken, setVerificationToken] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Step 3: Password State
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ password?: string; confirm?: string }>({});

    // Countdown timer for OTP resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Track if auto-request has already run
    const autoRequestedRef = useRef(false);

    // Handle Request OTP (Step 1)
    const handleRequestOtp = async (overrideMobile?: string) => {
        const targetMobile = (overrideMobile || mobile).replace(/\D/g, "").slice(-10);
        if (!targetMobile || targetMobile.length !== 10) {
            toast.error("Please enter a valid 10-digit mobile number.");
            return;
        }

        setIsRequestingOtp(true);
        try {
            const res = await fetch("/api/partner/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile: targetMobile }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to send WhatsApp OTP.");
            }

            if (data.partnerName) setPartnerName(data.partnerName);
            toast.success(data.message || `OTP sent to WhatsApp on +91 ${targetMobile}`);
            setStep(2);
            setResendTimer(60);
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");
            setTimeout(() => otpRefs.current[0]?.focus(), 150);
        } catch (err: any) {
            toast.error(err.message || "Failed to send OTP.");
        } finally {
            setIsRequestingOtp(false);
        }
    };

    // Handle verification via MSG91 OTP Widget callback
    const handleWidgetSuccess = async (widgetData: any) => {
        setIsVerifyingOtp(true);
        try {
            const res = await fetch("/api/partner/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, widgetData }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Widget verification failed");

            setVerificationToken(data.verificationToken);
            if (data.partnerName) setPartnerName(data.partnerName);
            toast.success("WhatsApp verification confirmed! 🎉");
            setStep(3);
        } catch (err: any) {
            toast.error(err.message || "Verification failed");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // Load MSG91 Widget script on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || "3669776c6868313035363336";
        const tokenAuth = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN_AUTH || "573796ThNicbcAh6ab3c198P1";

        const loadScript = (urls: string[]) => {
            let i = 0;
            function attempt() {
                const s = document.createElement("script");
                s.src = urls[i];
                s.async = true;
                s.onload = () => {
                    if (typeof (window as any).initSendOTP === "function") {
                        try {
                            (window as any).initSendOTP({
                                widgetId,
                                tokenAuth,
                                identifier: mobile ? `91${mobile}` : undefined,
                                exposeMethods: true,
                                success: (data: any) => {
                                    console.log("MSG91 Widget success:", data);
                                    handleWidgetSuccess(data);
                                },
                                failure: (error: any) => {
                                    console.log("MSG91 Widget failure:", error);
                                }
                            });
                        } catch (e) {
                            console.warn("initSendOTP error:", e);
                        }
                    }
                };
                s.onerror = () => {
                    i++;
                    if (i < urls.length) attempt();
                };
                document.head.appendChild(s);
            }
            attempt();
        };

        loadScript([
            "https://verify.msg91.com/otp-provider.js",
            "https://verify.phone91.com/otp-provider.js"
        ]);
    }, [mobile]);

    // Update mobile state and auto-request OTP when query param is present
    useEffect(() => {
        if (queryMobile) {
            const clean = queryMobile.replace(/\D/g, "").slice(-10);
            setMobile(clean);
            setIsEditingMobile(false);

            if (clean.length === 10 && !autoRequestedRef.current) {
                autoRequestedRef.current = true;
                handleRequestOtp(clean);
            }
        }
    }, [queryMobile]);

    // OTP Input Handlers (Step 2)
    const handleOtpChange = (index: number, val: string) => {
        const digit = val.replace(/\D/g, "").slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);
        setOtpError("");

        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto submit if all 6 digits filled
        if (digit && index === 5) {
            const fullOtp = newDigits.join("");
            if (fullOtp.length === 6) {
                handleVerifyOtp(fullOtp);
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            const digits = pasted.split("");
            setOtpDigits(digits);
            setOtpError("");
            handleVerifyOtp(pasted);
        }
    };

    // Verify OTP (Step 2)
    const handleVerifyOtp = async (overrideOtp?: string) => {
        const otpCode = overrideOtp || otpDigits.join("");
        if (otpCode.length !== 6) {
            setOtpError("Please enter all 6 digits of the OTP.");
            return;
        }

        setIsVerifyingOtp(true);
        setOtpError("");
        try {
            const res = await fetch("/api/partner/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, otp: otpCode }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Invalid OTP code.");
            }

            setVerificationToken(data.verificationToken);
            if (data.partnerName) setPartnerName(data.partnerName);
            toast.success("WhatsApp OTP verified successfully! 🎉");
            setStep(3);
        } catch (err: any) {
            setOtpError(err.message || "Verification failed");
            toast.error(err.message || "Invalid OTP");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // Step 3 Password Validation & Submit
    const validatePassword = () => {
        const errs: typeof passwordErrors = {};
        if (password.length < 8) {
            errs.password = "Password must be at least 8 characters long";
        }
        if (password !== confirmPassword) {
            errs.confirm = "Passwords do not match";
        }
        setPasswordErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword()) return;

        setIsSavingPassword(true);
        try {
            const res = await fetch("/api/partner/set-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: verificationToken,
                    mobile,
                    password,
                    confirmPassword
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to set password.");
            }

            setStep(4);
            toast.success("Account setup completed! Welcome aboard! 🚀");
            setTimeout(() => {
                router.push("/login");
            }, 2500);
        } catch (err: any) {
            toast.error(err.message || "Failed to save password.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    // Password strength computation
    const strength = password.length === 0 ? 0
        : password.length < 8 ? 1
        : password.length < 12 && !/[A-Z]/.test(password) ? 2
        : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
        : 3;
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"];

    return (
        <AuthLayout>
            <div className="w-full max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-br from-[#1a6b3a] to-[#25D366] p-8 text-center text-white relative">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                                {step === 1 && <MessageSquare className="w-8 h-8 text-white" />}
                                {step === 2 && <ShieldCheck className="w-8 h-8 text-white" />}
                                {step === 3 && <Lock className="w-8 h-8 text-white" />}
                                {step === 4 && <CheckCircle2 className="w-9 h-9 text-white" />}
                            </div>

                            <h1 className="text-2xl font-black tracking-tight">
                                {step === 1 && "Partner Authorization"}
                                {step === 2 && "WhatsApp OTP"}
                                {step === 3 && "Create Password"}
                                {step === 4 && "Setup Complete!"}
                            </h1>
                            <p className="text-white/80 text-xs mt-1 font-medium">
                                {step === 1 && "Request a secure OTP via WhatsApp"}
                                {step === 2 && `Enter the 6-digit code sent to +91 ${mobile}`}
                                {step === 3 && "Set your account password to activate"}
                                {step === 4 && "Redirecting you to partner login..."}
                            </p>

                            {/* Stepper Progress Indicator */}
                            {step < 4 && (
                                <div className="flex items-center justify-center gap-2 mt-5">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                step === s
                                                    ? "w-8 bg-white"
                                                    : step > s
                                                    ? "w-4 bg-white/70"
                                                    : "w-4 bg-white/30"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Body Content by Step */}
                        <div className="p-8">
                            {/* STEP 1: Request OTP */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">
                                            Registered Mobile Number
                                        </label>
                                        <div className="relative flex items-center">
                                            <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none text-gray-500 font-bold text-sm">
                                                <Phone className="w-4 h-4 text-emerald-600" />
                                                <span>+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                disabled={!isEditingMobile}
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                placeholder="9876543210"
                                                className={`w-full h-12 pl-16 pr-20 text-base font-bold rounded-xl border transition-all ${
                                                    isEditingMobile
                                                        ? "border-emerald-500 bg-white ring-2 ring-emerald-500/10 text-gray-900"
                                                        : "border-gray-200 bg-gray-50 text-gray-700"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingMobile(!isEditingMobile)}
                                                className="absolute right-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider py-1 px-2 rounded-md hover:bg-emerald-50"
                                            >
                                                {isEditingMobile ? "Done" : "Change"}
                                            </button>
                                        </div>
                                    </div>

                                    {partnerName && (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                                                {partnerName[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">{partnerName}</p>
                                                <p className="text-[10px] text-emerald-700 font-medium">Ready for authorization</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                        <div className="flex items-start gap-2.5">
                                            <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                                We will deliver your 6-digit OTP code directly to your WhatsApp.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleRequestOtp()}
                                        disabled={isRequestingOtp || mobile.length !== 10}
                                        className="w-full h-12 bg-gradient-to-r from-[#1a6b3a] to-[#25D366] hover:from-[#155a30] hover:to-[#20ba59] text-white font-black tracking-wide rounded-xl shadow-lg shadow-emerald-900/10 gap-2 text-sm flex items-center justify-center transition-all"
                                    >
                                        {isRequestingOtp ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending WhatsApp OTP...
                                            </>
                                        ) : (
                                            <>
                                                <MessageSquare className="w-4 h-4" />
                                                Request WhatsApp OTP
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </>
                                        )}
                                    </Button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => router.push("/login")}
                                            className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            Already verified? Return to Login
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: Enter & Verify OTP */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                                Enter 6-Digit OTP
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="text-[11px] font-bold text-emerald-700 hover:underline"
                                            >
                                                Edit Number
                                            </button>
                                        </div>

                                        <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                                            {otpDigits.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => { otpRefs.current[i] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    className={`w-12 h-14 text-center text-xl font-black rounded-xl border transition-all ${
                                                        otpError
                                                            ? "border-red-400 bg-red-50/50 text-red-700"
                                                            : digit
                                                            ? "border-emerald-600 bg-emerald-50/30 text-emerald-800 shadow-sm"
                                                            : "border-gray-200 bg-gray-50 text-gray-800 focus:border-emerald-500 focus:bg-white"
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        {otpError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-1.5 text-xs text-red-600 font-medium"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>{otpError}</span>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Resend Action */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                        <span>Didn't receive code?</span>
                                        {resendTimer > 0 ? (
                                            <span className="font-bold text-gray-400">
                                                Resend in {resendTimer}s
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleRequestOtp()}
                                                disabled={isRequestingOtp}
                                                className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isRequestingOtp ? "animate-spin" : ""}`} />
                                                Resend WhatsApp OTP
                                            </button>
                                        )}
                                    </div>

                                    <Button
                                        onClick={() => handleVerifyOtp()}
                                        disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                                        className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-black tracking-wide rounded-xl shadow-lg gap-2 text-sm flex items-center justify-center transition-all"
                                    >
                                        {isVerifyingOtp ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Verifying OTP...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                Verify & Continue
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}

                            {/* STEP 3: Set Password & Confirm Password */}
                            {step === 3 && (
                                <motion.form
                                    onSubmit={handleSetPassword}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-5"
                                >
                                    {/* New Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="At least 8 characters"
                                                className="h-12 pr-10 rounded-xl border-gray-200 focus:border-emerald-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors.password && (
                                            <p className="text-xs text-red-500 font-medium">{passwordErrors.password}</p>
                                        )}

                                        {/* Strength Bar */}
                                        {password.length > 0 && (
                                            <div className="space-y-1 pt-1">
                                                <div className="flex gap-1 h-1">
                                                    {[1, 2, 3, 4].map((s) => (
                                                        <div
                                                            key={s}
                                                            className={`flex-1 rounded-full transition-all ${
                                                                strength >= s ? strengthColors[strength] : "bg-gray-100"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-right">
                                                    Strength: {strengthLabels[strength]}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest block">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter password"
                                                className="h-12 pr-10 rounded-xl border-gray-200 focus:border-emerald-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {passwordErrors.confirm && (
                                            <p className="text-xs text-red-500 font-medium">{passwordErrors.confirm}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSavingPassword || !password || !confirmPassword}
                                        className="w-full h-12 bg-gradient-to-r from-[#1a6b3a] to-[#25D366] hover:from-[#155a30] hover:to-[#20ba59] text-white font-black tracking-wide rounded-xl shadow-lg gap-2 text-sm flex items-center justify-center transition-all mt-2"
                                    >
                                        {isSavingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Activating Account...
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="w-4 h-4" />
                                                Set Password & Complete Setup
                                            </>
                                        )}
                                    </Button>
                                </motion.form>
                            )}

                            {/* STEP 4: Success / Done */}
                            {step === 4 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-6 space-y-4"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">Account Activated!</h2>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Your password has been successfully configured. You can now access your partner dashboard.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.push("/login")}
                                        className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                                    >
                                        Go to Partner Login
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AuthLayout>
    );
}

export default function VerifyPartnerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        }>
            <VerifyPartnerContent />
        </Suspense>
    );
}
