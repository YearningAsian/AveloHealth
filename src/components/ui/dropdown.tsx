"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}

export function Dropdown({ trigger, children, className, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg",
            "animate-fade-in",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DropdownItem({ children, className, ...props }: DropdownItemProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors",
        "first:rounded-t-lg last:rounded-b-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="border-t border-gray-200 my-1" />;
}
