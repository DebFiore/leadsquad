import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PRICE_IDS = {
  starter: {
    monthly: "price_1StrhbE7OFNZIO4SHVnP8kAW",
    annual: "price_1StrhbE7OFNZIO4SHVnP8kAW", // Update if you have a separate annual price
  },
  scale: {
    monthly: "price_1StriLE7OFNZIO4SwhUVEan0",
    annual: "price_1StriLE7OFNZIO4SwhUVEan0", // Update if you have a separate annual price
  },
};

const plans = [
  {
    name: "STARTER",
    planKey: "starter" as const,
    description: "For solopreneurs and small teams ready to multiply their lead conversion without multiplying their costs.",
    monthlyPrice: "$197",
    annualPrice: "$177",
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
    planKey: "scale" as const,
    description: "For ambitious businesses handling serious lead volume across multiple channels and team members.",
    monthlyPrice: "$497",
    annualPrice: "$477",
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
    planKey: null,
    description: "For businesses that want white-glove service with experts handling every detail of their AI lead conversion.",
    monthlyPrice: "Let's Talk",
    annualPrice: "Let's Talk",
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
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, organization, loading: authLoading } = useAuth();

  const handleGetStarted = async (planKey: "starter" | "scale") => {
    // If not authenticated, redirect to auth with plan info
    if (!user) {
      const priceId = isAnnual ? PRICE_IDS[planKey].annual : PRICE_IDS[planKey].monthly;
      navigate(`/auth?redirect=checkout&priceId=${priceId}`);
      return;
    }

    // If authenticated but no organization, redirect to onboarding
    if (!organization) {
      toast.error("Please complete onboarding first");
      navigate("/onboarding");
      return;
    }

    // User is authenticated and has an organization - create checkout session
    setLoadingPlan(planKey);
    try {
      const priceId = isAnnual ? PRICE_IDS[planKey].annual : PRICE_IDS[planKey].monthly;
      
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          organizationId: organization.id,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/#pricing`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

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

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                !isAnnual
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                isAnnual
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
            </button>
          </div>
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
              <div className="mb-4 text-center">
                <span className="text-4xl md:text-5xl font-black text-foreground">
                  {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* CTA below price */}
              {plan.isCustom ? (
                <Button
                  variant="outline"
                  className="w-full mb-6"
                  size="lg"
                  asChild
                >
                  <a href="https://calendly.com/mergeai/leadsquad-managed-services" target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4 mr-2" />
                    {plan.cta}
                  </a>
                </Button>
              ) : (
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full mb-6"
                  size="lg"
                  onClick={() => plan.planKey && handleGetStarted(plan.planKey)}
                  disabled={loadingPlan === plan.planKey || authLoading}
                >
                  {loadingPlan === plan.planKey ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              )}

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
