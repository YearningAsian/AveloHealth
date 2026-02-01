import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Activity, Zap, Shield, TrendingUp, Users, HeartPulse } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 py-24 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transforming Healthcare Through Innovation
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Empowering healthcare providers with intelligent solutions that bridge 
                technology and compassionate care. From enterprise CRM to accessible diagnostics.
              </p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8">
                    Explore Solutions
                  </Button>
                </Link>
                <Link href="/quick-diagnosis">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Try QuickDiagnosis
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Image Placeholder */}
              <div className="relative aspect-video overflow-hidden rounded-xl border">
  <img 
    src="/images/geminipic1.png" 
    alt="AveloHealth Innovation"
    className="object-cover w-full h-full"
  />
</div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Overview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Solutions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive healthcare technology designed for modern healthcare organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* CRM Solution */}
            <Card className="hover:shadow-xl transition-all border-2">
              <CardHeader>
                <div className="mb-4">
                  {/* Image Placeholder */}
                  <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
  <img 
    src="/images/geminipic3.png" 
    alt="CRM Platform" 
    className="object-cover w-full h-full"
  />
</div>
                </div>
                <CardTitle className="text-3xl mb-3">CRM Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Intelligence-first patient CRM that combines AI-powered analytics, 
                  automated voice interactions, and comprehensive patient management. 
                  Built for healthcare organizations that refuse to let patients fall through the cracks.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">AI-powered patient triage and risk assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Automated voice interactions and scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">HIPAA-compliant with enterprise security</span>
                  </li>
                </ul>
                <Link href="/login">
                  <Button className="w-full" size="lg">
                    Access CRM Platform
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* QuickDiagnosis Solution */}
            <Card className="hover:shadow-xl transition-all border-2">
              <CardHeader>
                <div className="mb-4">
                  {/* Image Placeholder */}
                  <div className="relative aspect-video overflow-hidden rounded-xl border">
  <img 
    src="/images/geminipic2.png" 
    alt="QuickDiagnosis AI Assessment"
    className="object-cover w-full h-full"
  />
</div>
                </div>
                <CardTitle className="text-3xl mb-3">QuickDiagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Free, accessible AI-powered symptom assessment tool. Get instant health 
                  insights through voice or chat, available to anyone, anytime. 
                  Your first step toward understanding your health concerns.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">AI-driven symptom analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Voice or text-based interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">Free and open to everyone</span>
                  </li>
                </ul>
                <Link href="/quick-diagnosis">
                  <Button className="w-full" size="lg" variant="outline">
                    Try QuickDiagnosis Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Healthcare Providers Trust Us</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built by healthcare professionals, for healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Data-Driven Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time analytics and predictive models help you make informed 
                  decisions and improve patient outcomes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Security First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade security, HIPAA compliance, and comprehensive 
                  audit logging protect your most sensitive data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">Patient-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every feature is designed to enhance patient care and ensure 
                  no one falls through the cracks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Healthcare Practice?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join healthcare organizations already using AveloHealth solutions
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Contact Sales
              </Button>
            </Link>
            <Link href="/quick-diagnosis">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Try QuickDiagnosis Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
