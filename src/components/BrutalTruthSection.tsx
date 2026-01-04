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
    <section className="section-padding section-light">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-foreground">
            In the Next <span className="text-gradient">8 Seconds</span>, $4,700 Worth of Leads Will Dial Your Competitors Instead of Waiting for Your Call
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Because here's what nobody tells you about the lead game: That prospect who just called you? They've got 4 other numbers written down. That web form they filled out? They submitted it to 5 companies. And <span className="text-foreground font-semibold">78% of the time, their money goes to whoever gets them on the phone first.</span> Not who's cheapest. Not who's been in business longest. Not who provides the best service.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group p-8 rounded-2xl bg-white border border-[hsl(var(--light-border))] card-shadow-light hover:border-primary/50 transition-all duration-500"
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
