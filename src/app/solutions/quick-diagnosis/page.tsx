import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  Phone, 
  HeartPulse,
  CheckCircle,
  Shield,
  Clock,
  Globe,
  Zap,
  Users,
  Activity
} from 'lucide-react';

export default function QuickDiagnosisSolutionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-sm font-medium text-primary">Free Public Tool</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                QuickDiagnosis
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Free AI-powered symptom assessment tool. Get instant health insights through 
                voice or chat. Available to anyone, anytime, anywhere.
              </p>
              <div className="flex gap-4">
                <Link href="/quick-diagnosis">
                  <Button size="lg" className="text-lg px-8">
                    Try It Free Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Image Placeholder */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <HeartPulse className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">QuickDiagnosis Interface</p>
                  <p className="text-xs text-muted-foreground">1200x800px</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Use QuickDiagnosis?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Accessible healthcare guidance powered by artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>100% Free</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No registration, no payment required. Accessible to everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>24/7 Available</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get health insights anytime, day or night, whenever you need them.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Instant Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered analysis provides immediate preliminary assessments.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Private & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your health information is protected with enterprise security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Two Easy Ways to Use</h2>
            <p className="text-xl text-muted-foreground">
              Choose the method that works best for you
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Chat Option */}
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="mb-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed mb-4">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Chat Interface Preview</p>
                    </div>
                  </div>
                </div>
                <MessageSquare className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-2xl mb-2">Chat Assessment</CardTitle>
                <p className="text-muted-foreground">
                  Type your symptoms and have a text conversation with our AI
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Easy-to-use text interface</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Review conversation history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Take your time explaining symptoms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Works on any device with a browser</span>
                  </li>
                </ul>
                <Link href="/quick-diagnosis">
                  <Button className="w-full" size="lg">
                    Start Chat Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Voice Option */}
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <div className="mb-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed mb-4">
                    <div className="text-center">
                      <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Voice Interface Preview</p>
                    </div>
                  </div>
                </div>
                <Phone className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-2xl mb-2">Voice Call</CardTitle>
                <p className="text-muted-foreground">
                  Speak naturally about your symptoms in a conversational AI call
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Natural conversation flow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Hands-free assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Real-time AI interaction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">More natural for many users</span>
                  </li>
                </ul>
                <Link href="/quick-diagnosis">
                  <Button className="w-full" size="lg" variant="outline">
                    Start Voice Call
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">When to Use QuickDiagnosis</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your first step in understanding health concerns
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Activity className="h-10 w-10 text-primary mb-4" />
                <CardTitle>New Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  When you notice new symptoms and want to understand their potential significance 
                  before seeing a healthcare provider.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Family Health</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get quick assessments for family members experiencing symptoms, 
                  especially during off-hours when clinics are closed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HeartPulse className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Health Awareness</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn about potential health issues and whether professional 
                  medical attention might be needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Health Insights?</h2>
          <p className="text-xl mb-8 opacity-90">
            Free, instant, and available right now. No registration required.
          </p>
          <Link href="/quick-diagnosis">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Try QuickDiagnosis Free
            </Button>
          </Link>
          <p className="text-sm mt-6 opacity-75">
            Always consult with a qualified healthcare professional for medical advice
          </p>
        </div>
      </section>
    </div>
  );
}
