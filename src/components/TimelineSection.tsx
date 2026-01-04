import { Check, Rocket } from "lucide-react";

const steps = [
  { time: "3:00", label: "Sign up and choose your plan" },
  { time: "3:05", label: "Connect your CRM (one click)" },
  { time: "3:08", label: "Pick your AI voices and scripts" },
  { time: "3:12", label: "Your squad goes live" },
  { time: "3:13", label: "Watch your first lead get booked" },
];

const TimelineSection = () => {
  return (
    <section className="section-padding section-light">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            From Zero to Domination
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-foreground">
            Live in <span className="text-gradient">12 Minutes</span>, Not 12 Weeks
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />

            {/* Steps */}
            {steps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-6 mb-8 last:mb-0 group">
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all duration-300">
                  <span className="text-sm font-bold text-primary">{step.time}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-4">
                  <p className="text-lg md:text-xl text-foreground font-medium group-hover:text-primary transition-colors">
                    {step.label}
                  </p>
                </div>

                {/* Check for completed */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[60px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom message */}
        <div className="mt-16 text-center">
          <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            No developers. No training. No IT department. <span className="text-foreground font-semibold">Just results.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
