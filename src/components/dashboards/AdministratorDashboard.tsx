'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Phone,
  Sliders,
  Calendar,
  TrendingUp,
  Users,
  Shield,
  FileText,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types';

export function AdministratorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      apiClient.loadToken();
      const response = await apiClient.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Administrator</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{formatDate()}</p>
          <h1 className="text-3xl font-bold mb-2">System Overview</h1>
          <p className="text-muted-foreground">
            {getGreeting()}. Monitor and configure your AveloHealth system.
          </p>
        </div>

        {/* System Health Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Patients</p>
                  <p className="text-3xl font-bold">{stats?.totalPatients || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{stats?.newPatientsThisMonth || 0} this month
                  </p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">High Risk</p>
                  <p className="text-3xl font-bold text-destructive">{stats?.highRiskPatients || 0}</p>
                  <p className="text-xs text-destructive/70 mt-1">Requires attention</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">AI Analyses</p>
                  <p className="text-3xl font-bold">{stats?.aiAnalysesThisWeek || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">This week</p>
                </div>
                <Brain className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Teli Calls</p>
                  <p className="text-3xl font-bold">{stats?.teliCallsThisWeek || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">This week</p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Configuration */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">System Configuration</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Configuration</CardTitle>
                    <CardDescription>Gemini AI settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure AI models, risk scoring algorithms, and triage parameters.
                </p>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure AI
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Teli AI Settings</CardTitle>
                    <CardDescription>Voice AI configuration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage call flows, voice prompts, and automated scheduling settings.
                </p>
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Teli
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sliders className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Custom Fields</CardTitle>
                    <CardDescription>Data structure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Define custom patient fields, workflows, and data collection forms.
                </p>
                <Button className="w-full">
                  <Sliders className="h-4 w-4 mr-2" />
                  Manage Fields
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Operations Overview */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">All Appointments</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <CardDescription>System-wide appointment scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Today&apos;s Appointments</p>
                      <p className="text-xs text-muted-foreground">Across all providers</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats?.appointmentsToday || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Completed</p>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats?.appointmentsCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm">Pending</p>
                      <p className="text-xs text-muted-foreground">Needs scheduling</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold">{stats?.appointmentsPending || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">System Analytics</CardTitle>
                <Button variant="outline" size="sm">
                  Full Report
                </Button>
              </div>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AI Accuracy Rate</span>
                    <span className="text-sm font-bold">94.8%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '94.8%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Call Success Rate</span>
                    <span className="text-sm font-bold">87.2%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '87.2%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Patient Engagement</span>
                    <span className="text-sm font-bold">76.4%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '76.4%' }} />
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="w-full" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Admin Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Administrative Tools</CardTitle>
            <CardDescription>User management and system monitoring</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto py-4">
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">Add, edit, remove users</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Audit Logs</p>
                <p className="text-xs text-muted-foreground">System activity history</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Shield className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Security Settings</p>
                <p className="text-xs text-muted-foreground">Access controls</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <Activity className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">Health monitoring</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
