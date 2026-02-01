"use client";

import React from "react";
import { Heart } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" },
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-[hsl(174,62%,47%)] rounded-full blur-md opacity-30 animate-pulse" />
        <div className="relative bg-gradient-to-br from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] rounded-full p-2">
          <Heart 
            size={sizes[size].icon} 
            className="text-white" 
            fill="currentColor"
          />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} bg-gradient-to-r from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] bg-clip-text text-transparent`}>
          AveloHealth
        </span>
      )}
    </div>
  );
}
