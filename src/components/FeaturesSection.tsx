import { Link2, FileText, SlidersHorizontal, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "One-click CRM connections",
    description: "GoHighLevel, Pipedrive, ZOHO and more",
  },
  {
    icon: FileText,
    title: "Pre-built industry scripts",
    description: "Templates that actually convert",
  },
  {
    icon: SlidersHorizontal,
    title: "Drag-and-drop customization",
    description: "Add your unique touch in seconds",
  },
  {
    icon: BarChart3,
    title: "Real-time dashboard",
    description: "See every dollar earned instantly",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Built for Business Owners
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            If You Can Order Pizza Online,<br />
            <span className="text-gradient">You Can Deploy Your Squad</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
              <div className="mt-3 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                ✓ Included
              </div>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="mt-12 text-center">
          <p className="text-xl text-muted-foreground">
            We handle the complexity. <span className="text-foreground font-semibold">You handle the growth.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
