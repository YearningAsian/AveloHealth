import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AveloHealth - Digital Health Diary",
  description: "Track your health journey with AveloHealth's digital entry diary. Monitor symptoms, track progress, and share insights with your healthcare providers.",
  keywords: "health diary, symptom tracker, patient health, digital health, medical diary",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
