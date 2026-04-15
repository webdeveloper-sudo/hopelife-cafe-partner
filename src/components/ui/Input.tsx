import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full rounded-2xl border-2 bg-white px-4 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-hope-purple/10",
                    error
                        ? "border-red-500 shadow-sm shadow-red-100"
                        : "border-gray-100 focus:border-hope-purple",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
