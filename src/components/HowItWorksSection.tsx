import { Button } from "@/components/ui/button";
import { Phone, Brain, CalendarCheck, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Phone,
    title: "Instant Lead Response",
    description:
      "The moment a lead calls, texts, or fills out a form, your 3-agent squad springs into action. Inbound agents answer calls in 2 rings. Outbound agents call web leads within 7 seconds. Every lead gets immediate human-like engagement across voice, text, and email.",
  },
  {
    number: "2",
    icon: Brain,
    title: "Smart Qualification & Follow-Up",
    description:
      "Your AI squad asks the right questions, captures key information, and identifies hot prospects. They handle objections, answer FAQs, and nurture leads with personalized follow-ups that sound like your best sales rep on their best day.",
  },
  {
    number: "3",
    icon: CalendarCheck,
    title: "Appointments Booked Automatically",
    description:
      "Qualified leads get booked directly into your calendar while your AI squad continues intelligent follow-up with everyone else. No lead falls through the cracks. Your human team only talks to ready-to-buy prospects.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding section-light">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-navy">
            Scale Revenue. <span className="text-gradient">Not Headcount.</span>
          </h2>
          <p className="text-lg text-navy/70 max-w-3xl mx-auto">
            Your AI squad works 24/7 to capture, qualify, and book every lead—so you grow revenue without growing payroll.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col md:flex-row gap-6 p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Number badge */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-glow flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Step {step.number}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-navy">
                    {step.title}
                  </h3>
                </div>
                <p className="text-navy/70 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Result callout */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-navy to-navy-light mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl md:text-3xl font-black text-white">
              The Result:
            </span>
          </div>
          <p className="text-xl md:text-2xl text-white/90">
            You capture{" "}
            <span className="text-primary font-bold">73% more revenue</span>{" "}
            without hiring a single person.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg">
            See Your Squad in Action
          </Button>
          <Button variant="outline" size="lg">
            Start Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
