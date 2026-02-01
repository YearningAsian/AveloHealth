import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Zap, Shield, Heart, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">About AveloHealth</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to ensure no patient falls through the cracks by bridging 
              clinical data and human interaction with intelligent technology.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At AveloHealth, we believe every patient deserves proactive, personalized care. 
                Our mission is to empower healthcare organizations with AI-driven insights and 
                automation that keep patients engaged and connected to their care teams.
              </p>
              <p className="text-lg text-muted-foreground">
                By combining cutting-edge artificial intelligence with intuitive healthcare workflows, 
                we're creating a future where technology enhances—not replaces—the human touch in medicine.
              </p>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Mission Image</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Vision Image</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We envision a healthcare system where AI works seamlessly alongside clinicians, 
                automatically identifying at-risk patients, facilitating timely interventions, 
                and ensuring continuity of care across every touchpoint.
              </p>
              <p className="text-lg text-muted-foreground">
                Through our CRM platform and accessible tools like QuickDiagnosis, we're democratizing 
                advanced healthcare technology for organizations of all sizes and making preliminary 
                health assessments available to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Patient-First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every feature, every decision is made with patient outcomes and wellbeing at the forefront.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We push the boundaries of what's possible with AI and healthcare technology.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  HIPAA compliance and data protection are non-negotiable foundations of our platform.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We work closely with healthcare professionals to build tools that truly serve their needs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Precision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI models are continuously refined for accuracy and reliability in clinical settings.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We measure success by the lives improved and the care gaps closed through our technology.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
          </div>
          
          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">The Beginning</h3>
              <p className="text-muted-foreground">
                AveloHealth was founded by healthcare professionals and technologists who witnessed firsthand 
                the challenges of managing patient care at scale. We saw patients lost to follow-up, 
                high-risk individuals overlooked, and clinicians overwhelmed by administrative burdens.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">The Problem</h3>
              <p className="text-muted-foreground">
                Traditional healthcare systems struggle with fragmented data, reactive care models, 
                and limited resources. Meanwhile, AI technology was advancing rapidly but remaining 
                inaccessible to most healthcare organizations.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">Our Solution</h3>
              <p className="text-muted-foreground">
                We built AveloHealth CRM to bridge this gap—combining Gemini AI for intelligent triage, 
                Teli AI for automated patient engagement, and a modern interface that healthcare 
                professionals actually enjoy using. We also created QuickDiagnosis, making AI-powered 
                health assessments accessible to everyone, everywhere.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-semibold mb-3">Today</h3>
              <p className="text-muted-foreground">
                Today, AveloHealth serves healthcare organizations of all sizes, from small clinics 
                to large hospital networks. Our platform analyzes thousands of patient interactions 
                daily, identifying risks, automating outreach, and ensuring no patient is forgotten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Leadership Team</h2>
            <p className="text-xl text-muted-foreground">
              Experienced leaders from healthcare and technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Team Member {i}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Position Title</p>
                  <p className="text-sm text-muted-foreground">
                    Brief bio and background information about this team member.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Join Us in Transforming Healthcare</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you're a healthcare organization looking to improve patient care or a 
            talented professional wanting to make an impact, we'd love to hear from you.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/contact" className="inline-block">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Contact Us
              </button>
            </a>
            <a href="/solutions/crm" className="inline-block">
              <button className="px-8 py-3 border rounded-lg hover:bg-muted transition-colors">
                View Solutions
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
