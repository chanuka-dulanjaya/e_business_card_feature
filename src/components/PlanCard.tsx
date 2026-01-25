import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  name: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  delay?: number;
  onGetStarted: () => void;
}

export function PlanCard({ name, description, features, highlighted = false, delay = 0, onGetStarted }: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative p-8 rounded-2xl transition-all duration-500 opacity-0 animate-fade-in",
        "hover:scale-[1.02] hover:-translate-y-1",
        highlighted
          ? "bg-gradient-primary shadow-glow ring-2 ring-primary"
          : "glass hover:border-primary/50 hover:shadow-glow"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-card rounded-full text-sm font-medium text-primary border border-primary/50 flex items-center gap-1.5 shadow-glow">
          <Sparkles className="w-3.5 h-3.5" />
          Most Popular
        </div>
      )}

      <h3 className={cn(
        "text-2xl font-bold mb-2",
        highlighted ? "text-primary-foreground" : "text-foreground"
      )}>
        {name}
      </h3>
      
      <p className={cn(
        "mb-6",
        highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
      )}>
        {description}
      </p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <div className={cn(
              "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
              highlighted ? "bg-primary-foreground/20" : "bg-primary/20"
            )}>
              <Check className={cn(
                "w-3 h-3",
                highlighted ? "text-primary-foreground" : "text-primary"
              )} />
            </div>
            <span className={highlighted ? "text-primary-foreground" : "text-foreground"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onGetStarted}
        className={cn(
          "w-full font-semibold transition-all duration-300 hover:scale-105",
          highlighted
            ? "bg-card text-primary hover:bg-card/90 shadow-elevated"
            : "bg-gradient-primary text-primary-foreground hover:shadow-glow"
        )}
      >
        Get Started
      </Button>
    </div>
  );
}
