import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Phone, 
  Calendar, 
  Shield, 
  TrendingUp, 
  Users,
  Activity,
  CheckCircle,
  Settings,
  FileText,
  BarChart
} from 'lucide-react';

export default function CRMSolutionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-sm font-medium text-primary">Healthcare CRM Solution</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Intelligence-First Patient CRM
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Bridge clinical data and human interaction with AI-powered patient management. 
                Built for healthcare organizations that refuse to let patients fall through the cracks.
              </p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Image Placeholder */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">CRM Dashboard Preview</p>
                  <p className="text-xs text-muted-foreground">1200x800px</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive CRM Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage patient care, appointments, and clinical workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI-Powered Triage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gemini AI analyzes patient data to identify high-risk individuals, 
                  predict health issues, and prioritize care automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Teli AI Voice Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automated patient calls for scheduling, follow-ups, and data collection. 
                  Natural voice interactions powered by AI.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Manage appointments across providers with intelligent reminders, 
                  conflict detection, and automated follow-ups.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>HIPAA Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade encryption, comprehensive audit logging, 
                  and full compliance with healthcare regulations.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time insights, risk scoring, and predictive models to 
                  drive proactive patient outreach and care.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Administrator and Professional roles with granular permissions 
                  and tailored workflows for each user type.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Sections */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Your Team</h2>
            <p className="text-xl text-muted-foreground">
              Tailored experiences for administrators and clinical professionals
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Administrator Features */}
            <Card className="border-2">
              <CardHeader>
                <Settings className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-2xl mb-2">For Administrators</CardTitle>
                <p className="text-muted-foreground">
                  Complete system control and oversight
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">AI & Voice Configuration</p>
                      <p className="text-sm text-muted-foreground">
                        Configure Gemini AI models, Teli AI voice settings, and automation rules
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Custom Fields & Workflows</p>
                      <p className="text-sm text-muted-foreground">
                        Define custom patient fields and tailor workflows to your organization
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">System-Wide Analytics</p>
                      <p className="text-sm text-muted-foreground">
                        View all appointments, metrics, and performance across providers
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">User Management & Audit Logs</p>
                      <p className="text-sm text-muted-foreground">
                        Manage users, permissions, and view comprehensive audit trails
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Professional Features */}
            <Card className="border-2">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-2xl mb-2">For Professionals</CardTitle>
                <p className="text-muted-foreground">
                  Clinical operations and patient care focus
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Appointment Scheduling</p>
                      <p className="text-sm text-muted-foreground">
                        Schedule and manage appointments for doctors and general care
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">AI-Generated Call Insights</p>
                      <p className="text-sm text-muted-foreground">
                        Review AI analysis from patient calls with actionable insights
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Manual Data Entry</p>
                      <p className="text-sm text-muted-foreground">
                        Input patient data, clinical notes, and health information
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Assigned Patient Access</p>
                      <p className="text-sm text-muted-foreground">
                        View and manage your assigned patient information and records
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-xl text-muted-foreground">
              Intuitive interfaces designed for healthcare professionals
            </p>
          </div>

          <div className="space-y-12">
            {/* Screenshot 1 */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Dashboard Screenshot</p>
                  <p className="text-xs text-muted-foreground">1200x800px</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">Intelligent Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Get a complete overview of your patient population with real-time metrics, 
                  risk assessments, and actionable insights. See high-risk patients at a glance.
                </p>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl font-bold mb-4">AI Analysis & Triage</h3>
                <p className="text-muted-foreground mb-4">
                  Let AI handle the heavy lifting. Automated patient risk scoring, 
                  predictive analytics, and smart recommendations help prioritize care.
                </p>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed order-1 lg:order-2">
                <div className="text-center">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">AI Triage Screenshot</p>
                  <p className="text-xs text-muted-foreground">1200x800px</p>
                </div>
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
            Join healthcare organizations already using AveloHealth CRM to deliver better outcomes
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Schedule a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
