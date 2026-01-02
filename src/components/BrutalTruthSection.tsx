import { useEffect, useState, useRef } from "react";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

const stats = [
  {
    value: 73,
    suffix: "%",
    label: "of leads are already gone",
    icon: TrendingDown,
  },
  {
    value: 47,
    suffix: " hrs",
    label: "average response time",
    icon: Clock,
  },
  {
    value: 400,
    suffix: "%",
    label: "conversion drop per 10 min delay",
    icon: AlertTriangle,
  },
];

const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl lg:text-7xl font-black text-gradient">
      {count}{suffix}
    </div>
  );
};

const BrutalTruthSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            <span className="text-gradient">73%</span> of Your Leads Are Already Gone
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            While you were reading this sentence, 3 leads just went to competitors who answered first. 
            <span className="text-foreground font-semibold"> 78% of customers buy from whoever contacts them first.</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group p-8 rounded-2xl bg-gradient-card border border-border card-shadow hover:border-primary/50 transition-all duration-500"
            >
              <div className="absolute top-4 right-4">
                <stat.icon className="w-6 h-6 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="mt-4 text-lg text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="mt-12 text-center">
          <p className="text-xl text-muted-foreground">
            Every 10-minute delay reduces your conversion rate by 400%.{" "}
            <span className="text-secondary font-semibold">Your leads aren't patient—they're shopping your competitors right now.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BrutalTruthSection;
