import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - AveloHealth CRM',
  description: 'Your intelligent patient care dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
