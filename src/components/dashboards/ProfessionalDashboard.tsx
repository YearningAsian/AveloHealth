'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Phone,
  Users,
  FileEdit,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  UserCheck,
  PhoneCall,
  ClipboardList,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types';

export function ProfessionalDashboard() {
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

  const getTaskCount = () => {
    return (stats?.highRiskPatients || 0) + (stats?.patientsNeedingOutreach || 0);
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
            <UserCheck className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Professional</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{formatDate()}</p>
          <h1 className="text-3xl font-bold mb-2">Your day</h1>
          <p className="text-muted-foreground">
            {getGreeting()}. You&apos;ve got {getTaskCount()} {getTaskCount() === 1 ? 'task' : 'tasks'} requiring attention.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">My Patients</p>
                  <p className="text-3xl font-bold">{stats?.assignedPatients || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Assigned to you</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-yellow-200 dark:border-yellow-900">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Appointments Today</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.appointmentsToday || 0}</p>
                  <p className="text-xs text-yellow-600/70 mt-1">Scheduled</p>
                </div>
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Call Data</p>
                  <p className="text-3xl font-bold">{stats?.newCallData || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">New this week</p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">High Priority</p>
                  <p className="text-3xl font-bold text-destructive">{stats?.highRiskPatients || 0}</p>
                  <p className="text-xs text-destructive/70 mt-1">Needs attention</p>
                </div>
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Schedule Appointment</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Book appointments for doctors and general care providers.
                </p>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  New Appointment
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
                    <CardTitle className="text-base">View Call Data</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Review AI-generated insights from patient calls.
                </p>
                <Button className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  View Calls
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileEdit className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Manual Input</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually enter patient data and clinical notes.
                </p>
                <Button className="w-full">
                  <FileEdit className="h-4 w-4 mr-2" />
                  Enter Data
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">My Patients</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access information for your assigned patients.
                </p>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  View Patients
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Today's Schedule & Recent Calls */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Today&apos;s Appointments</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <CardDescription>Your scheduled appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Morning</p>
                      <p className="text-xs text-muted-foreground">8:00 AM - 12:00 PM</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Afternoon</p>
                      <p className="text-xs text-muted-foreground">12:00 PM - 5:00 PM</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">2</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Completed</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{stats?.appointmentsCompleted || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Call Data</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <CardDescription>AI-generated insights from patient calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <PhoneCall className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">Patient Follow-up</p>
                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI Analysis: Patient reports improvement, no concerns
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <PhoneCall className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">Medication Check</p>
                        <span className="text-xs text-muted-foreground">5 hours ago</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI Analysis: Possible medication adherence issue
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <PhoneCall className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">Symptoms Check</p>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI Analysis: Escalation recommended - new symptoms
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Patients Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Assigned Patients</CardTitle>
                <CardDescription>Patients under your care</CardDescription>
              </div>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                View Full List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Patients</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.assignedPatients || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Currently assigned</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Needs Follow-up</span>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">{stats?.patientsNeedingOutreach || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires contact</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Recent Updates</span>
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">{stats?.recentPatientUpdates || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">In the last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
