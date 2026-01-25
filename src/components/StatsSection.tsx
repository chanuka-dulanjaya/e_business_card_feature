import { AnimatedCounter } from '@/components/ui/animated-counter';

const stats = [
  { value: 50000, suffix: '+', label: 'Active Users' },
  { value: 2, suffix: 'M+', label: 'Cards Shared' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
  { value: 150, suffix: '+', label: 'Countries' },
];

export function StatsSection() {
  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
