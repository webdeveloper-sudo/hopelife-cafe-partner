import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const s = status.toUpperCase();

    let variant = "bg-gray-100 text-gray-600 border-gray-200";

    if (s === "ACTIVE") {
        variant = "bg-green-50 text-green-600 border-green-100";
    } else if (s === "PENDING" || s === "PENDING APP") {
        variant = "bg-purple-50 text-purple-700 border-purple-100";
    } else if (s === "REJECTED") {
        variant = "bg-red-50 text-red-600 border-red-100";
    } else if (s === "SETTLED") {
        variant = "bg-blue-50 text-blue-600 border-blue-100";
    } else if (s === "PAID") {
        variant = "bg-emerald-50 text-emerald-600 border-emerald-100";
    }

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 inline-flex items-center justify-center transition-all duration-300",
            variant,
            className
        )}>
            {status}
        </span>
    );
}
