import { Button } from "@/components/ui/button";
import { Check, Star, Phone } from "lucide-react";

const plans = [
  {
    name: "STARTER",
    description: "For solopreneurs and small teams ready to multiply their lead conversion without multiplying their costs.",
    price: "$197",
    period: "/month",
    features: [
      "1 Squad / 3 AI Agents",
      "500 Voice Minutes",
      "Up to 5 Campaigns",
      "2 Users",
      "Daily Reporting",
      "Call Recording",
      "CRM Integrations",
      "1 Outbound Number",
      "6 Voice Library",
      "TCPA Compliant",
      "Chat, Slack & Email Support",
    ],
    popular: false,
    cta: "GET STARTED",
  },
  {
    name: "SCALE",
    description: "For ambitious businesses handling serious lead volume across multiple channels and team members.",
    price: "$497",
    period: "/month",
    features: [
      "Everything in Starter, Plus:",
      "2,000 Voice Minutes",
      "Unlimited Campaigns",
      "4 Users",
      "Advanced Webhook Integration",
      "12 Voice Library",
      "4 Outbound Numbers",
      "GDPR & HIPAA Compliance",
    ],
    popular: true,
    cta: "GET STARTED",
  },
  {
    name: "MANAGED SERVICES",
    description: "For businesses that want white-glove service with experts handling every detail of their AI lead conversion.",
    price: "Let's Talk",
    period: "",
    features: [
      "We Build and Manage Everything",
      "White Glove Setup",
      "Monthly Optimizations",
      "Dedicated Account Manager",
    ],
    popular: false,
    cta: "Schedule Call",
    isCustom: true,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            3 Agents. One Mission. Never Miss Another Lead.
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            Lock In Your <span className="text-gradient">Market Advantage</span> Today
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-500 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-card border-primary glow-orange scale-105"
                  : "bg-gradient-card border-border hover:border-primary/50"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4" /> Most Popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-xl font-bold mb-2 text-foreground text-center">{plan.name}</h3>

              {/* Description */}
              {plan.description && (
                <p className="text-sm text-muted-foreground mb-4 text-center">{plan.description}</p>
              )}

              {/* Price */}
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-black text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* CTA below price */}
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full mb-6"
                size="lg"
              >
                {plan.isCustom && <Phone className="w-4 h-4 mr-2" />}
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="text-center">
          <p className="text-muted-foreground">
            30-day money back guarantee • Cancel anytime • No setup fees
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
