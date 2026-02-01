'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export function Header() {
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-xl">AveloHealth</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Solutions Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
            role="navigation"
          >
            <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Solutions
              <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-background border rounded-lg shadow-lg overflow-hidden">
                <Link 
                  href="/solutions/crm"
                  className="block px-4 py-3 hover:bg-muted transition-colors"
                >
                  <div className="font-medium text-sm">CRM Platform</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Intelligent patient care management
                  </div>
                </Link>
                <Link 
                  href="/solutions/quick-diagnosis"
                  className="block px-4 py-3 hover:bg-muted transition-colors border-t"
                >
                  <div className="font-medium text-sm">QuickDiagnosis</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    AI-powered symptom assessment tool
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link 
            href="/news" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            News
          </Link>
          <Link 
            href="/about" 
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            About Us
          </Link>
        </nav>

        {/* Contact Us Button */}
        <div className="flex items-center gap-3">
          <Link href="/contact">
            <Button variant="outline" size="sm">
              Contact Us
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
