import { Button } from "@/components/ui/button";
import { Check, Star, Phone } from "lucide-react";

const plans = [
  {
    name: "Starter Squad",
    price: "$197",
    period: "/month",
    features: ["3 AI Agents", "500 minutes", "2 users", "Email support"],
    popular: false,
    cta: "Deploy Now",
  },
  {
    name: "Professional Squad",
    price: "$497",
    period: "/month",
    features: [
      "Everything in Starter",
      "2,000 minutes",
      "Advanced WebHook Integration",
      "4 users",
      "Priority support",
    ],
    popular: true,
    cta: "Deploy Now",
  },
  {
    name: "Managed Services",
    price: "Custom",
    period: "",
    features: [
      "We build and manage everything",
      "White glove setup",
      "Monthly optimization",
      "Dedicated account manager",
    ],
    popular: false,
    cta: "Schedule Call",
    isCustom: true,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding bg-muted/30">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Your Competition Starts Using This Tomorrow
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
              <h3 className="text-xl font-bold mb-4 text-foreground">{plan.name}</h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl md:text-5xl font-black text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                size="lg"
              >
                {plan.isCustom && <Phone className="w-4 h-4 mr-2" />}
                {plan.cta}
              </Button>
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
