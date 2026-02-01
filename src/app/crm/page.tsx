import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Phone, 
  Calendar, 
  Shield, 
  BarChart3, 
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function CRMPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Intelligence-First Patient Care</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">AveloHealth CRM Platform</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform patient care with AI-powered insights, automated workflows, and intelligent triage. 
              Our CRM ensures no patient falls through the cracks.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/login">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="/contact">
                <Button size="lg" variant="outline">
                  Request Demo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Modern Healthcare</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to deliver exceptional patient care
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>AI-Powered Triage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gemini AI automatically analyzes patient data to identify high-risk cases and prioritize care. 
                  Get intelligent insights that help you make faster, more informed decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Teli AI Voice Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automated voice calls that engage patients, collect health data, and provide care reminders. 
                  Scale your outreach without scaling your team.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intelligent appointment management that considers patient priority, provider availability, 
                  and care urgency to optimize your schedule.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade security with end-to-end encryption, audit logs, and compliance monitoring. 
                  Your patient data is always protected.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time insights into patient outcomes, AI accuracy, call success rates, and team performance. 
                  Data-driven decisions made easy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Granular permissions for administrators, healthcare professionals, and support staff. 
                  Everyone sees exactly what they need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Comparison */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Designed for Your Entire Team</h2>
            <p className="text-xl text-muted-foreground">
              Different views and tools for different roles
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Administrator Dashboard</CardTitle>
                <p className="text-muted-foreground">Full system access and configuration</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">AI Configuration</p>
                    <p className="text-sm text-muted-foreground">Customize Gemini AI risk thresholds and triage rules</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Teli AI Settings</p>
                    <p className="text-sm text-muted-foreground">Configure voice scripts and call campaigns</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">System Analytics</p>
                    <p className="text-sm text-muted-foreground">Track AI accuracy, call success, and patient engagement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">User Management</p>
                    <p className="text-sm text-muted-foreground">Control team access and permissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Professional Dashboard</CardTitle>
                <p className="text-muted-foreground">Clinical operations and patient care</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Appointment Management</p>
                    <p className="text-sm text-muted-foreground">Schedule, view, and manage patient appointments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Call Data Review</p>
                    <p className="text-sm text-muted-foreground">Access Teli AI call recordings and transcripts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Patient Records</p>
                    <p className="text-sm text-muted-foreground">View assigned patients and health summaries</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Manual Data Entry</p>
                    <p className="text-sm text-muted-foreground">Add patient observations and notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots Placeholder */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground">
              Intuitive interface designed for healthcare professionals
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-video bg-muted rounded-lg border-2 border-dashed flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Dashboard Screenshot</p>
              </div>
            </div>
            <div className="aspect-video bg-muted rounded-lg border-2 border-dashed flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Patient Management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Patient Care?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join healthcare organizations using AveloHealth to deliver better outcomes with AI-powered insights
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/login">
              <Button size="lg" variant="secondary">
                Get Started Free
              </Button>
            </a>
            <a href="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                Schedule Demo
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
