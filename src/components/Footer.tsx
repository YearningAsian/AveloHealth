"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-gray-400 max-w-md">
              Your digital health companion. Track symptoms, monitor progress, and empower your healthcare journey with AveloHealth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[hsl(174,62%,47%)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-400 hover:text-[hsl(174,62%,47%)] transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-[hsl(174,62%,47%)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[hsl(174,62%,47%)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-[hsl(174,62%,47%)] transition-colors">
                  HIPAA Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[hsl(174,62%,47%)] hover:text-white transition-all duration-200"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
          
          <p className="text-gray-400 text-sm">
            © {currentYear} AveloHealth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
