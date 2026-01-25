import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative p-8 rounded-2xl glass hover:border-primary/50 transition-all duration-500",
        "hover:shadow-glow hover:scale-[1.02] hover:-translate-y-1",
        "opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-primary mb-5 shadow-glow group-hover:animate-pulse-glow transition-all duration-300">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-gradient transition-all duration-300">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
