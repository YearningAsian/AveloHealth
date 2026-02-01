"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authAPI } from "@/lib/api";
import {
  Phone,
  Mail,
  User,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Shield,
  AtSign,
  Heart,
  X,
} from "lucide-react";

type Step = "credentials" | "verification" | "profile" | "complete";
type ContactMethod = "phone" | "email";

export default function SignUpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("credentials");
  
  // Contact method toggle
  const [contactMethod, setContactMethod] = useState<ContactMethod>("phone");
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  
  // Family history options
  const familyHistoryOptions = [
    "Diabetes", "Heart Disease", "High Blood Pressure", "Cancer", 
    "Depression", "Anxiety", "Alzheimer's", "Asthma", 
    "Arthritis", "Stroke", "Thyroid Disorder", "None"
  ];
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [showAccountCreatedToast, setShowAccountCreatedToast] = useState(false);
  const [showVerificationSuccessToast, setShowVerificationSuccessToast] = useState(false);

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUsername = (user: string): boolean => {
    // No spaces, max 15 characters, alphanumeric and underscore only
    return user.length > 0 && user.length <= 15 && /^[a-zA-Z0-9_]+$/.test(user);
  };

  const formatPhoneInput = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    if (formatted.replace(/\D/g, "").length <= 15) {
      setPhoneNumber(formatted);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, ""); // Remove spaces
    if (value.length <= 15) {
      setUsername(value);
    }
  };

  // Step 1: Credentials submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (contactMethod === "phone" && !validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }
    
    if (contactMethod === "email" && !validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!validateUsername(username)) {
      setError("Username must be 1-15 characters (letters, numbers, underscore only)");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      // Send verification code via backend API
      const contact = contactMethod === "phone" ? phoneNumber.replace(/\D/g, "") : email;
      await authAPI.sendVerificationCode(contact);
      setCodeSent(true);
      setCurrentStep("verification");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verification
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify code via backend API
      const contact = contactMethod === "phone" ? phoneNumber.replace(/\D/g, "") : email;
      await authAPI.verifyPhone(contact, verificationCode);
      
      setShowVerificationSuccessToast(true);
      setTimeout(() => setShowVerificationSuccessToast(false), 5000);
      setCurrentStep("profile");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const contact = contactMethod === "phone" ? phoneNumber.replace(/\D/g, "") : email;
      await authAPI.sendVerificationCode(contact);
      setError("");
      setCodeSent(true);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Profile details
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    
    if (!dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create account via backend API
      const response = await authAPI.signUp({
        phoneNumber: contactMethod === "phone" ? phoneNumber.replace(/\D/g, "") : "",
        accountNumber: username, // Using username as account number
        name,
        dateOfBirth,
        password,
        email: contactMethod === "email" ? email : undefined,
      });
      
      if (response.success && response.token) {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        
        setCurrentStep("complete");
        setShowAccountCreatedToast(true);
        setTimeout(() => setShowAccountCreatedToast(false), 5000);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      setError(axiosError.response?.data?.detail || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "credentials", label: "Account", number: 1 },
      { key: "verification", label: "Verify", number: 2 },
      { key: "profile", label: "Profile", number: 3 },
    ];

    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  index < currentIndex
                    ? "bg-green-500 text-white"
                    : index === currentIndex
                    ? "bg-[hsl(174,62%,47%)] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentIndex ? (
                  <CheckCircle size={20} />
                ) : (
                  step.number
                )}
              </div>
              <span className={`text-xs mt-2 ${
                index <= currentIndex ? "text-gray-900 font-medium" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                  index < currentIndex ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderCredentialsStep = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
      {/* Contact Method Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setContactMethod("phone")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              contactMethod === "phone"
                ? "bg-white text-[hsl(174,62%,47%)] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Phone size={16} />
            Phone
          </button>
          <button
            type="button"
            onClick={() => setContactMethod("email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              contactMethod === "email"
                ? "bg-white text-[hsl(174,62%,47%)] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Mail size={16} />
            Email
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {contactMethod === "phone" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} className="inline mr-2" />
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              We&apos;ll send a verification code to this number
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} className="inline mr-2" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              We&apos;ll send a verification code to this email
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AtSign size={16} className="inline mr-2" />
            Username
          </label>
          <Input
            type="text"
            placeholder="JohnDoe"
            value={username}
            onChange={handleUsernameChange}
            maxLength={15}
            required
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Letters, numbers, underscore only ({username.length}/15)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield size={16} className="inline mr-2" />
            Password
          </label>
          <Input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            className="text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield size={16} className="inline mr-2" />
            Confirm Password
          </label>
          <Input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
            className="text-lg"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin mr-2" />
            Sending Code...
          </>
        ) : (
          <>
            Continue
            <ArrowRight size={20} className="ml-2" />
          </>
        )}
      </Button>
    </form>
  );

  const renderVerificationStep = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-[hsl(174,62%,47%)]/10 rounded-full flex items-center justify-center mb-4">
          {contactMethod === "phone" ? (
            <Phone size={32} className="text-[hsl(174,62%,47%)]" />
          ) : (
            <Mail size={32} className="text-[hsl(174,62%,47%)]" />
          )}
        </div>
        <p className="text-gray-600">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-gray-900">
            {contactMethod === "phone" ? phoneNumber : email}
          </span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <Input
          type="text"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          required
          className="text-center text-2xl tracking-widest font-mono"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          <>
            Verify Code
            <ArrowRight size={20} className="ml-2" />
          </>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={isLoading}
          className="text-[hsl(174,62%,47%)] hover:underline text-sm"
        >
          Didn&apos;t receive a code? Resend
        </button>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setCurrentStep("credentials");
          setError("");
        }}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
    </form>
  );

  const renderProfileStep = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <p className="text-gray-600">
          {contactMethod === "phone" ? "Phone" : "Email"} verified! Now let&apos;s set up your profile.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-2" />
            Full Name
          </label>
          <Input
            type="text"
            placeholder="Sarah Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-2" />
            Date of Birth
          </label>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="text-lg"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Family Health History Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Heart size={16} className="inline mr-2 text-pink-500" />
            Family Health History (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">Select conditions that run in your family</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
            {familyHistoryOptions.map((option) => (
              <label 
                key={option}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                  familyHistory.includes(option)
                    ? "bg-pink-50 border-pink-300 text-pink-700"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={familyHistory.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (option === "None") {
                        setFamilyHistory(["None"]);
                      } else {
                        setFamilyHistory(prev => [...prev.filter(h => h !== "None"), option]);
                      }
                    } else {
                      setFamilyHistory(prev => prev.filter(h => h !== option));
                    }
                  }}
                  className="w-3 h-3 text-pink-500 rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight size={20} className="ml-2" />
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setCurrentStep("verification");
          setError("");
        }}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
    </form>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-fade-in">
        <CheckCircle size={48} className="text-green-500" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AveloHealth!</h2>
        <p className="text-gray-600">
          Your account has been created successfully. You&apos;re ready to start tracking your health journey.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-left">
        <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Name:</span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{contactMethod === "phone" ? "Phone:" : "Email:"}</span>
            <span className="font-medium">{contactMethod === "phone" ? phoneNumber : email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Username:</span>
            <span className="font-medium">@{username}</span>
          </div>
          {familyHistory.length > 0 && (
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Family Health History:</span>
              <span className="font-medium text-right max-w-[60%]">{familyHistory.join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() => router.push("/dashboard")}
        className="w-full"
        size="lg"
      >
        Go to Dashboard
        <ArrowRight size={20} className="ml-2" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[hsl(174,62%,95%)] via-white to-[hsl(174,62%,98%)]">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-xl animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentStep === "complete" ? "All Done!" : "Create Your Account"}
            </CardTitle>
            {currentStep !== "complete" && (
              <CardDescription>
                Start tracking your health journey with AveloHealth
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            {currentStep !== "complete" && renderStepIndicator()}
            
            {currentStep === "credentials" && renderCredentialsStep()}
            {currentStep === "verification" && renderVerificationStep()}
            {currentStep === "profile" && renderProfileStep()}
            {currentStep === "complete" && renderCompleteStep()}

            {currentStep === "credentials" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link href="/" className="text-[hsl(174,62%,47%)] hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Security badge */}
      <div className="py-4 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <Shield size={16} className="text-green-500" />
          <span>Your data is encrypted and HIPAA compliant</span>
        </div>
      </div>

      {/* Account Created Toast */}
      {showAccountCreatedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-from-top">
          <Card className="bg-green-50 border-green-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Account Created!</p>
                <p className="text-sm text-green-600">Welcome to AveloHealth, {name}!</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-green-600 hover:text-green-800"
                onClick={() => setShowAccountCreatedToast(false)}
              >
                <X size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Success Toast */}
      {showVerificationSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-from-top">
          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">Verification Successful!</p>
                <p className="text-sm text-blue-600">Your {contactMethod} has been verified.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={() => setShowVerificationSuccessToast(false)}
              >
                <X size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
