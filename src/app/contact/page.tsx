import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get in touch with our team. We're here to help you transform patient care.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john.doe@hospital.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Organization</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Hospital or Healthcare Organization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">I'm interested in</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>CRM Platform Demo</option>
                      <option>QuickDiagnosis Integration</option>
                      <option>Enterprise Pricing</option>
                      <option>Technical Support</option>
                      <option>Partnership Opportunities</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <Button className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">info@avelohealth.com</p>
                      <p className="text-muted-foreground">support@avelohealth.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office</h3>
                      <p className="text-muted-foreground">
                        123 Healthcare Blvd, Suite 500<br />
                        San Francisco, CA 94102<br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">Monday - Friday: 9am - 6pm EST</p>
                      <p className="text-muted-foreground">Saturday - Sunday: Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href="/solutions/crm" className="flex items-center gap-2 text-primary hover:underline">
                    <MessageSquare className="h-4 w-4" />
                    Learn about CRM Platform
                  </a>
                  <a href="/quick-diagnosis" className="flex items-center gap-2 text-primary hover:underline">
                    <MessageSquare className="h-4 w-4" />
                    Try QuickDiagnosis Free
                  </a>
                  <a href="/about" className="flex items-center gap-2 text-primary hover:underline">
                    <MessageSquare className="h-4 w-4" />
                    About AveloHealth
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">Need Immediate Support?</h3>
                  <p className="mb-4 opacity-90">
                    Our support team is available during business hours to help with technical issues and account questions.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Visit Support Center
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visit Our Office</h2>
            <p className="text-muted-foreground">
              We welcome in-person meetings. Schedule a visit to see our solutions in action.
            </p>
          </div>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Map Placeholder</p>
              <p className="text-xs text-muted-foreground">Google Maps integration</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
