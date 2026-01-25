import { CreditCard, Mail, Phone, Globe, Linkedin, QrCode } from 'lucide-react';

export function FloatingCard() {
  return (
    <div className="relative w-full max-w-sm animate-float">
      {/* Main Card */}
      <div className="relative bg-gradient-card rounded-2xl p-6 border border-border/50 shadow-elevated">
        {/* QR Code floating element */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-card rounded-xl border border-border/50 flex items-center justify-center shadow-card animate-bounce-subtle">
          <QrCode className="w-8 h-8 text-primary" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <CreditCard className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Alex Thompson</h3>
            <p className="text-primary font-medium">Product Designer</p>
            <p className="text-muted-foreground text-sm">TechStartup Inc.</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm">alex@techstartup.io</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm">alexthompson.design</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
            <Linkedin className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
            <Globe className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute -top-3 -right-3 w-20 h-20 bg-accent/10 rounded-full blur-2xl" />
      </div>

      {/* Background shadow cards */}
      <div className="absolute inset-0 bg-gradient-card rounded-2xl border border-border/30 -rotate-3 -z-10 scale-95 opacity-50" />
      <div className="absolute inset-0 bg-gradient-card rounded-2xl border border-border/20 rotate-3 -z-20 scale-90 opacity-30" />
    </div>
  );
}
