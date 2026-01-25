import { CreditCard, Users, Building2, QrCode, Shield, ArrowRight, Zap, Globe, Lock, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { PlanCard } from '@/components/PlanCard';
import { StatsSection } from '@/components/StatsSection';
import { HowItWorks } from '@/components/HowItWorks';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FloatingCard } from '@/components/FloatingCard';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HomeProps {
  onNavigateToLogin?: () => void;
  onNavigateToRegister?: () => void;
}

export default function Home({ onNavigateToLogin, onNavigateToRegister }: HomeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNavigate = (page: 'login' | 'register') => {
    if (page === 'login' && onNavigateToLogin) {
      onNavigateToLogin();
    } else if (page === 'register' && onNavigateToRegister) {
      onNavigateToRegister();
    }
  };

  const features = [
    {
      icon: CreditCard,
      title: 'Digital Business Cards',
      description: 'Create professional digital business cards that can be shared instantly with anyone, anywhere in the world.'
    },
    {
      icon: QrCode,
      title: 'QR Code Sharing',
      description: 'Generate unique QR codes for your business cards. Just scan and connect in seconds.'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage your team members and their business cards from one centralized dashboard.'
    },
    {
      icon: Building2,
      title: 'Organization Support',
      description: 'Perfect for organizations with multiple teams, departments, and locations.'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Track card views, link clicks, and engagement with detailed analytics and insights.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade encryption and security measures.'
    }
  ];

  const plans = [
    {
      name: 'Individual',
      description: 'Perfect for freelancers and professionals',
      features: ['1 Digital Business Card', 'QR Code Generation', 'Basic Analytics', 'Public Profile Link'],
      highlighted: false
    },
    {
      name: 'Team',
      description: 'Great for small teams and startups',
      features: ['Unlimited Team Members', 'Team Business Cards', 'Team Management', 'Advanced Analytics', 'Custom Branding'],
      highlighted: true
    },
    {
      name: 'Organization',
      description: 'For enterprises and large organizations',
      features: ['Multiple Teams', 'Organization Dashboard', 'API Access', 'Priority Support', 'Custom Integrations'],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="glass-strong sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className={`flex items-center gap-2 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                  <CreditCard className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">E-Business Card</span>
              </div>
              
              <div className={`flex items-center gap-2 transition-all duration-700 delay-100 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  onClick={() => handleNavigate('login')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavigate('register')}
                  className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6">
                  <Zap className="w-4 h-4" />
                  <span>The Future of Networking</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
                  Your Digital Business Card,{' '}
                  <span className="text-gradient">Reimagined</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                  Create stunning digital business cards, share them instantly with a QR code,
                  and manage your professional network like never before.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => handleNavigate('register')}
                    className="group bg-gradient-primary text-primary-foreground font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    Create Your Card Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleNavigate('login')}
                    className="border-border hover:bg-secondary hover:border-primary/50 transition-all duration-300"
                  >
                    Sign In to Your Account
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 mt-10 pt-10 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="w-5 h-5 text-primary" />
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-sm">Global</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-sm">Instant</span>
                  </div>
                </div>
              </div>

              {/* Floating Card Preview */}
              <div className={`hidden lg:flex justify-center transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <FloatingCard />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <StatsSection />

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
                Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need for{' '}
                <span className="text-gradient">Professional Networking</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform provides all the tools you need to create, share, and manage
                your digital business cards effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={200 + index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Plans Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
                Pricing
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Choose Your <span className="text-gradient">Account Type</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're an individual professional, a team, or an organization,
                we have the right plan for you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <PlanCard
                  key={index}
                  name={plan.name}
                  description={plan.description}
                  features={plan.features}
                  highlighted={plan.highlighted}
                  delay={200 + index * 150}
                  onGetStarted={() => handleNavigate('register')}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-primary opacity-5" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="glass-strong rounded-3xl p-12 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Ready to Go <span className="text-gradient">Digital</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have already made the switch to digital business cards.
                Start free today!
              </p>
              <Button
                size="lg"
                onClick={() => handleNavigate('register')}
                className="group bg-gradient-primary text-primary-foreground font-semibold hover:shadow-glow transition-all duration-300 hover:scale-105"
              >
                Create Your Free Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="glass-strong border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-gradient-primary p-1.5 rounded shadow-glow">
                    <CreditCard className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg text-foreground">E-Business Card</span>
                </div>
                <p className="text-muted-foreground max-w-sm">
                  The modern way to share your professional identity. Create, customize, and share digital business cards instantly.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4">Product</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="hover:text-primary cursor-pointer transition-colors">Features</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Teams</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Enterprise</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="hover:text-primary cursor-pointer transition-colors">About</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Blog</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Careers</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Contact</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} E-Business Card. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
