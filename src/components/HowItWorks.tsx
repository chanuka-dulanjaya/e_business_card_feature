import { UserPlus, Palette, Share2, Smartphone } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Account',
    description: 'Sign up in seconds and start building your digital presence.'
  },
  {
    icon: Palette,
    step: '02',
    title: 'Design Your Card',
    description: 'Customize your card with your brand colors, logo, and information.'
  },
  {
    icon: Share2,
    step: '03',
    title: 'Share Instantly',
    description: 'Share via QR code, link, or NFC tap with anyone, anywhere.'
  },
  {
    icon: Smartphone,
    step: '04',
    title: 'Connect & Grow',
    description: 'Track views, manage contacts, and grow your network effortlessly.'
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple four-step process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative opacity-0 animate-fade-in"
                style={{ animationDelay: `${200 + index * 150}ms`, animationFillMode: 'forwards' }}
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                <div className="relative z-10 text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 shadow-glow group-hover:animate-float transition-all duration-300">
                    <Icon className="w-9 h-9 text-primary-foreground" />
                  </div>
                  
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-primary text-primary text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
