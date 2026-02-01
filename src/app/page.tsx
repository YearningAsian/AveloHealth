"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownDivider } from "@/components/ui/dropdown";
import {
  Heart,
  BookOpen,
  BarChart3,
  Shield,
  Users,
  ChevronRight,
  CheckCircle,
  Stethoscope,
  Activity,
  Calendar,
  ChevronDown,
  User,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  
  // Intersection observer states for animations
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [missionVisible, setMissionVisible] = useState(false);
  const [testimonialsVisible, setTestimonialsVisible] = useState(false);
  const [underlineComplete, setUnderlineComplete] = useState(false);
  
  const featuresRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px 0px -100px 0px"
    };

    const featuresObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          featuresObserver.disconnect();
        }
      });
    }, observerOptions);

    const missionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setMissionVisible(true);
          missionObserver.disconnect();
        }
      });
    }, observerOptions);

    const testimonialsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTestimonialsVisible(true);
          testimonialsObserver.disconnect();
          // Trigger underline animation after a short delay
          setTimeout(() => setUnderlineComplete(true), 500);
        }
      });
    }, observerOptions);

    if (featuresRef.current) featuresObserver.observe(featuresRef.current);
    if (missionRef.current) missionObserver.observe(missionRef.current);
    if (testimonialsRef.current) testimonialsObserver.observe(testimonialsRef.current);

    return () => {
      featuresObserver.disconnect();
      missionObserver.disconnect();
      testimonialsObserver.disconnect();
    };
  }, []);

  // Scroll spy for header navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["features", "mission", "testimonials"];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      // Demo login - accepts email or phone
      const isEmail = loginIdentifier.includes("@");
      const isValidDemo = 
        (loginIdentifier === "demo@avelohealth.com" || loginIdentifier === "(555) 123-4567" || loginIdentifier === "5551234567") 
        && password === "demo123";

      if (isValidDemo) {
        localStorage.setItem("auth_token", "demo_token");
        localStorage.setItem("user", JSON.stringify({ 
          id: "user_001", 
          name: "Sarah Johnson",
          email: isEmail ? loginIdentifier : "demo@avelohealth.com",
          phone: !isEmail ? loginIdentifier : "(555) 123-4567"
        }));
        router.push("/dashboard");
      } else {
        setLoginError("Invalid credentials. Try demo@avelohealth.com or (555) 123-4567 with password: demo123");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Digital Health Diary",
      description: "Log symptoms, medications, and health notes in a secure, easy-to-use digital diary.",
    },
    {
      icon: BarChart3,
      title: "Visual Progress Tracking",
      description: "See your health trends with beautiful charts and analytics that make patterns clear.",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your health data is protected with enterprise-grade security and encryption.",
    },
    {
      icon: Stethoscope,
      title: "Doctor-Ready Reports",
      description: "Generate summaries that help your healthcare providers understand your recent history.",
    },
    {
      icon: Activity,
      title: "Severity Tracking",
      description: "Categorize symptoms by severity to identify what needs immediate attention.",
    },
    {
      icon: Calendar,
      title: "Historical Insights",
      description: "Look back at your health journey and identify patterns over time.",
    },
  ];

  const testimonials = [
    {
      quote: "AveloHealth has transformed how I communicate with my doctor. The symptom tracking is incredibly intuitive.",
      author: "Maria S.",
      role: "Patient",
    },
    {
      quote: "Having patients share their AveloHealth diary gives me a complete picture of their health between visits.",
      author: "Dr. James Chen",
      role: "Family Physician",
    },
    {
      quote: "I finally have a way to track my chronic condition that actually makes sense.",
      author: "Robert T.",
      role: "Patient",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="#features" 
                className={`transition-colors relative pb-1 ${
                  activeSection === "features" 
                    ? "text-[hsl(174,62%,47%)] border-b-2 border-[hsl(174,62%,47%)]" 
                    : "text-gray-600 hover:text-[hsl(174,62%,47%)]"
                }`}
              >
                Features
              </Link>
              <Link 
                href="#mission" 
                className={`transition-colors relative pb-1 ${
                  activeSection === "mission" 
                    ? "text-[hsl(174,62%,47%)] border-b-2 border-[hsl(174,62%,47%)]" 
                    : "text-gray-600 hover:text-[hsl(174,62%,47%)]"
                }`}
              >
                Our Mission
              </Link>
              <Link 
                href="#testimonials" 
                className={`transition-colors relative pb-1 ${
                  activeSection === "testimonials" 
                    ? "text-[hsl(174,62%,47%)] border-b-2 border-[hsl(174,62%,47%)]" 
                    : "text-gray-600 hover:text-[hsl(174,62%,47%)]"
                }`}
              >
                Testimonials
              </Link>
            </nav>

            {/* Login Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <User size={18} />
                  <span>Sign In</span>
                  <ChevronDown size={16} />
                </Button>
              }
            >
              <form onSubmit={handleLogin} className="p-4 w-72">
                <h3 className="font-semibold text-gray-900 mb-4">Welcome Back</h3>
                
                {loginError && (
                  <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
                    {loginError}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email or Phone</label>
                    <Input
                      type="text"
                      placeholder="email@example.com or (555) 123-4567"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
                
                <DropdownDivider />
                
                <div className="pt-2 text-center">
                  <p className="text-sm text-gray-500 mb-2">Don&apos;t have an account?</p>
                  <Link href="/signup">
                    <Button variant="outline" size="sm" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </form>
            </Dropdown>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(174,62%,95%)] via-white to-[hsl(174,62%,98%)] py-20 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[hsl(174,62%,47%)] rounded-full opacity-10 blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[hsl(174,62%,47%)] rounded-full opacity-10 blur-3xl animate-float delay-500" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(174,62%,47%)]/10 rounded-full text-[hsl(174,62%,37%)] font-medium text-sm mb-6">
                  <Heart size={16} className="animate-pulse" />
                  Your Health Journey Starts Here
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Track Your Health,{" "}
                  <span className="bg-gradient-to-r from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] bg-clip-text text-transparent">
                    Empower Your Care
                  </span>
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                  AveloHealth is your digital health diary—a simple, secure way to track symptoms, 
                  monitor your progress, and share meaningful insights with your healthcare providers.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="xl" className="w-full sm:w-auto">
                      Get Started Free
                      <ChevronRight size={20} className="ml-2" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>Free to use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>HIPAA compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>No credit card</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="relative animate-slide-in-right">
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  {/* Mock Dashboard Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] flex items-center justify-center text-white font-bold text-xl">
                          S
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Sarah Johnson</p>
                          <p className="text-sm text-gray-500">Last entry: Today</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Entries</p>
                        <p className="text-2xl font-bold text-[hsl(174,62%,47%)]">24</p>
                      </div>
                    </div>
                    
                    {/* Severity Status Boxes - Segmented */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 text-center">Severity Overview</p>
                      <div className="flex gap-2">
                        <div className="flex-1 p-3 bg-green-100 border border-green-300 rounded-lg text-center">
                          <p className="text-xl font-bold text-green-600">3</p>
                          <p className="text-xs text-green-600">Low</p>
                        </div>
                        <div className="flex-1 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                          <p className="text-xl font-bold text-yellow-600">2</p>
                          <p className="text-xs text-yellow-600">Moderate</p>
                        </div>
                        <div className="flex-1 p-3 bg-red-100 border border-red-300 rounded-lg text-center">
                          <p className="text-xl font-bold text-red-600">1</p>
                          <p className="text-xs text-red-600">High</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mock chart indicator */}
                    <div className="h-24 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-lg flex items-end justify-around px-4 pb-2">
                      {[40, 60, 45, 80, 55, 70, 35].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-6 bg-[hsl(174,62%,47%)] rounded-t-sm opacity-70"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[hsl(174,62%,47%)] rounded-full opacity-20 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white" ref={featuresRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to{" "}
                <span className="text-[hsl(174,62%,47%)]">Track Your Health</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to make health tracking simple, insightful, and actionable.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                // Determine slide direction: left for even rows (0,1,2), right for odd rows (3,4,5)
                const row = Math.floor(index / 3);
                const isLeftSlide = row % 2 === 0;
                
                return (
                  <div
                    key={feature.title}
                    className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-700 hover:-translate-y-1 ${
                      featuresVisible 
                        ? 'opacity-100 translate-x-0' 
                        : isLeftSlide 
                          ? 'opacity-0 -translate-x-20' 
                          : 'opacity-0 translate-x-20'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[hsl(174,62%,47%)]/10 flex items-center justify-center mb-4">
                      <feature.icon size={24} className="text-[hsl(174,62%,47%)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section 
          id="mission" 
          className="py-20 relative overflow-hidden"
          ref={missionRef}
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-1000 ${missionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission:{" "}
                  <span className="text-[hsl(174,62%,47%)]">Bridging the Gap</span>{" "}
                  Between Visits
                </h2>
                
                <div className="space-y-6">
                  <p className="text-lg text-gray-600">
                    We believe that better health outcomes start with better communication. 
                    AveloHealth was created to solve a simple problem: <strong>doctors often have limited 
                    insight into what happens between appointments.</strong>
                  </p>
                  
                  <p className="text-lg text-gray-600">
                    Our digital health diary empowers patients to track their day-to-day symptoms, 
                    creating a detailed record that helps healthcare providers understand the full picture 
                    of their patient&apos;s health journey.
                  </p>

                  <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm transition-all duration-1000 delay-300 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="text-[hsl(174,62%,47%)]" />
                      Our Vision
                    </h3>
                    <p className="text-gray-600">
                      A world where every patient visit is informed by comprehensive, easy-to-understand 
                      health data—leading to faster diagnoses, better treatment plans, and improved outcomes.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`transition-all duration-1000 delay-200 ${missionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                <div className="relative">
                  {/* Stats cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '100ms' }}>
                      <div className="text-4xl font-bold text-[hsl(174,62%,47%)] mb-2">85%</div>
                      <p className="text-sm text-gray-600">of patients forget symptoms at appointments</p>
                    </div>
                    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
                      <div className="text-4xl font-bold text-[hsl(174,62%,47%)] mb-2">3x</div>
                      <p className="text-sm text-gray-600">better communication with health diary</p>
                    </div>
                    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '300ms' }}>
                      <div className="text-4xl font-bold text-[hsl(174,62%,47%)] mb-2">10min</div>
                      <p className="text-sm text-gray-600">average time saved per visit</p>
                    </div>
                    <div className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
                      <div className="text-4xl font-bold text-[hsl(174,62%,47%)] mb-2">100%</div>
                      <p className="text-sm text-gray-600">HIPAA compliant security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommended resolution note (hidden, for documentation) */}
          {/* Background image recommended resolution: 1920x1080 or higher */}
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white" ref={testimonialsRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transition-all duration-700 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Loved by{" "}
                <span className="relative inline-block">
                  <span className="text-[hsl(174,62%,47%)]">Patients & Providers</span>
                  {/* Creative underline animation */}
                  <svg 
                    className="absolute -bottom-2 left-0 w-full h-3 overflow-visible"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,6 Q50,12 100,6 T200,6"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className={`transition-all duration-1000 ease-out ${underlineComplete ? 'stroke-dashoffset-0' : ''}`}
                      style={{
                        strokeDasharray: 220,
                        strokeDashoffset: underlineComplete ? 0 : 220,
                        transition: 'stroke-dashoffset 1s ease-out'
                      }}
                    />
                  </svg>
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                See what our community is saying about AveloHealth.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all duration-700 ${testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] flex items-center justify-center text-white font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Start Your Health Journey Today
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of patients who are taking control of their health with AveloHealth.
            </p>
            <Link href="/signup">
              <Button size="xl" variant="secondary" className="bg-white text-[hsl(174,62%,47%)] hover:bg-gray-100">
                Create Your Free Account
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
