import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function calculateAge(dob: Date | string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function getSeverityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return '#ef4444'; // red
    case 'medium':
      return '#eab308'; // yellow
    case 'low':
      return '#22c55e'; // green
    default:
      return '#6b7280'; // gray
  }
}

export function getSeverityBgClass(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return 'bg-red-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-black';
    case 'low':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function validateAccountNumber(accountNumber: string): boolean {
  // No spaces, max 15 characters
  return /^[^\s]{1,15}$/.test(accountNumber);
}
