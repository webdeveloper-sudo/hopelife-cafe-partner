"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-hope-purple text-white shadow-lg shadow-hope-purple/20 hover:shadow-hope-purple/40 ring-offset-2 focus-visible:ring-2 focus-visible:ring-hope-purple/50",
            secondary: "bg-white text-hope-purple border border-hope-purple/10 shadow-sm hover:bg-hope-purple/5",
            outline: "bg-transparent border-2 border-hope-purple text-hope-purple hover:bg-hope-purple/5",
            ghost: "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-hope-purple",
            danger: "bg-red-500 text-white shadow-lg shadow-red-100 hover:bg-red-600",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-10 text-base font-bold",
            icon: "h-10 w-10 flex items-center justify-center",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                suppressHydrationWarning
                className={cn(
                    "inline-flex items-center justify-center rounded-2xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden gap-2.5",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                ) : null}
                <span className={cn(
                    "inline-flex items-center justify-center gap-[inherit]",
                    isLoading && "opacity-0 text-[0] gap-0"
                )}>
                    {children as React.ReactNode}
                </span>
            </motion.button>
        );
    }
);

Button.displayName = "Button";

export { Button };
