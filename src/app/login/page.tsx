'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'administrator' | 'professional' | null>(null);

  const handleRoleLogin = async (role: 'administrator' | 'professional') => {
    setLoading(true);
    setSelectedRole(role);
    
    // Simulate login - in production, this would call your API
    setTimeout(() => {
      // Store role in localStorage for demo
      localStorage.setItem('userRole', role);
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome to AveloHealth</h1>
          <p className="text-muted-foreground text-lg">
            Select your role to continue
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Administrator Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Shield className="h-10 w-10 text-primary" />
                <Badge variant="default">Full Access</Badge>
              </div>
              <CardTitle className="text-2xl">Administrator</CardTitle>
              <CardDescription className="text-base">
                System configuration and oversight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Configure AI and Teli AI settings
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Customize system fields
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  View all appointments
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  System-wide analytics
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleRoleLogin('administrator')}
                disabled={loading && selectedRole === 'administrator'}
              >
                {loading && selectedRole === 'administrator' ? 'Logging in...' : 'Login as Administrator'}
              </Button>
            </CardContent>
          </Card>

          {/* Professional Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Shield className="h-10 w-10 text-primary" />
                <Badge variant="secondary">Clinical Access</Badge>
              </div>
              <CardTitle className="text-2xl">Professional</CardTitle>
              <CardDescription className="text-base">
                Clinical operations and patient care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Schedule appointments
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  View call-generated data
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Manually input patient info
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Access assigned patients
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleRoleLogin('professional')}
                disabled={loading && selectedRole === 'professional'}
              >
                {loading && selectedRole === 'professional' ? 'Logging in...' : 'Login as Professional'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Demo Notice */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">Demo Mode</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                  This is a demo environment. In production, you would enter email and password credentials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
