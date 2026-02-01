'use client';

import { useState, useEffect } from 'react';
import { AdministratorDashboard } from '@/components/dashboards/AdministratorDashboard';
import { ProfessionalDashboard } from '@/components/dashboards/ProfessionalDashboard';
import { Activity } from 'lucide-react';

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<'administrator' | 'professional' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check role from localStorage (set during login)
    const role = localStorage.getItem('userRole') as 'administrator' | 'professional' | null;
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  if (userRole === 'administrator') {
    return <AdministratorDashboard />;
  }

  if (userRole === 'professional') {
    return <ProfessionalDashboard />;
  }

  // No role found - redirect to login
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground mb-4">No role detected. Please log in.</p>
        <a href="/login" className="text-primary hover:underline">
          Go to Login
        </a>
      </div>
    </div>
  );
}
