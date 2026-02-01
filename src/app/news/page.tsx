import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, TrendingUp } from 'lucide-react';

export default function NewsPage() {
  const newsItems = [
    {
      id: 1,
      title: "AveloHealth Raises $50M Series B to Expand AI-Powered Patient Care Platform",
      excerpt: "Funding will accelerate development of new AI features and expand market reach to healthcare organizations nationwide.",
      date: "January 28, 2026",
      category: "Company News",
      image: "📰",
    },
    {
      id: 2,
      title: "New Partnership with Major Hospital Network Brings AveloHealth CRM to 200+ Facilities",
      excerpt: "Strategic partnership will deploy our intelligent patient management system across one of the nation's largest healthcare networks.",
      date: "January 15, 2026",
      category: "Partnerships",
      image: "🤝",
    },
    {
      id: 3,
      title: "QuickDiagnosis Surpasses 1 Million Free Assessments Milestone",
      excerpt: "Our free AI-powered symptom assessment tool has now helped over one million users understand their health concerns.",
      date: "January 10, 2026",
      category: "Product",
      image: "🎉",
    },
    {
      id: 4,
      title: "AveloHealth Achieves SOC 2 Type II Compliance Certification",
      excerpt: "Latest security certification demonstrates our commitment to protecting sensitive healthcare data and maintaining the highest standards.",
      date: "December 20, 2025",
      category: "Security",
      image: "🔒",
    },
    {
      id: 5,
      title: "Gemini AI Integration Reduces Patient Risk Assessment Time by 80%",
      excerpt: "New study shows healthcare professionals using AveloHealth CRM can identify high-risk patients significantly faster.",
      date: "December 15, 2025",
      category: "Research",
      image: "📊",
    },
    {
      id: 6,
      title: "Teli AI Voice Platform Launches Multi-Language Support",
      excerpt: "Automated patient calls now available in English, Spanish, Mandarin, and 12 additional languages.",
      date: "December 1, 2025",
      category: "Product",
      image: "🌍",
    },
    {
      id: 7,
      title: "AveloHealth Named to Healthcare Innovation 50 List",
      excerpt: "Industry recognition highlights our impact on patient care and technological advancement in healthcare.",
      date: "November 18, 2025",
      category: "Awards",
      image: "🏆",
    },
    {
      id: 8,
      title: "Webinar Series: AI in Healthcare - Best Practices and Real-World Results",
      excerpt: "Join our healthcare experts for monthly webinars exploring practical AI implementation strategies.",
      date: "November 5, 2025",
      category: "Events",
      image: "🎓",
    },
    {
      id: 9,
      title: "Case Study: Regional Health System Reduces No-Show Rates by 45%",
      excerpt: "Learn how automated reminders and intelligent scheduling improved appointment adherence.",
      date: "October 22, 2025",
      category: "Case Study",
      image: "📈",
    },
  ];

  const categories = ["All", "Company News", "Product", "Partnerships", "Research", "Security", "Awards", "Events", "Case Study"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">News & Updates</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stay informed about the latest developments, partnerships, and innovations at AveloHealth
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <Badge 
                key={cat} 
                variant={cat === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Featured Story</h2>
          </div>
          <Card className="hover:shadow-xl transition-shadow cursor-pointer">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-video bg-muted flex items-center justify-center text-6xl lg:rounded-l-lg">
                {newsItems[0].image}
              </div>
              <div className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4">{newsItems[0].category}</Badge>
                <h3 className="text-3xl font-bold mb-4">{newsItems[0].title}</h3>
                <p className="text-muted-foreground mb-6 text-lg">{newsItems[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {newsItems[0].date}
                  </div>
                  <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all">
                    Read More <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-2xl font-bold mb-8">Recent News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(1).map((item) => (
              <Card key={item.id} className="hover:shadow-xl transition-all cursor-pointer group">
                <div className="aspect-video bg-muted flex items-center justify-center text-5xl rounded-t-lg">
                  {item.image}
                </div>
                <CardHeader>
                  <Badge className="w-fit mb-2">{item.category}</Badge>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {item.date}
                    </div>
                    <button className="text-primary hover:gap-2 transition-all flex items-center gap-1">
                      Read <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter for the latest news, product updates, and healthcare insights
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground"
            />
            <button className="px-6 py-3 bg-primary-foreground text-primary rounded-lg hover:bg-primary-foreground/90 transition-colors font-medium">
              Subscribe
            </button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
