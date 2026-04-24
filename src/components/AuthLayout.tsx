import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  blur?: string;
  overlayOpacity?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  blur = "blur-[3px]", 
  overlayOpacity = "bg-black/30" 
}) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Blur */}
      <div 
        className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110 ${blur}`}
        style={{ backgroundImage: "url('/bg.webp')" }}
      />
      {/* Subtle overlay */}
      <div className={`fixed inset-0 z-0 ${overlayOpacity}`} />
      
      <div className="relative z-10 w-full max-w-5xl">
        {children}
      </div>
    </div>
  );
};
