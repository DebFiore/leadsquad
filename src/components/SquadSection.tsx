import { Phone, Zap, Calendar, Sparkles } from "lucide-react";

const agents = [
  {
    icon: Phone,
    emoji: "🎯",
    title: "The Inbound Specialist",
    description: "Answers every call in 2 rings. Books appointments while you sleep. Never takes a sick day.",
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
  },
  {
    icon: Zap,
    emoji: "🚀",
    title: "The Speed Demon",
    description: "Calls online leads within 7 seconds of form submission. First contact = first sale.",
    color: "from-secondary/20 to-secondary/5",
    borderColor: "border-secondary/30",
  },
  {
    icon: Calendar,
    emoji: "📅",
    title: "The Closer's Assistant",
    description: "Qualifies leads and fills your calendar with ready-to-buy appointments. Your closers only talk to hot prospects.",
    color: "from-orange-glow/20 to-orange-glow/5",
    borderColor: "border-orange/30",
  },
];

const SquadSection = () => {
  return (
    <section id="features" className="section-padding bg-muted/30">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Your Unfair Advantage
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            Meet Your <span className="text-gradient">Always-On</span> Revenue Squad
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Three AI Agents Working as One Unstoppable Team
          </p>
        </div>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {agents.map((agent, index) => (
            <div
              key={index}
              className={`relative group p-8 rounded-2xl bg-gradient-to-b ${agent.color} border ${agent.borderColor} backdrop-blur-sm hover:scale-105 transition-all duration-500`}
            >
              <div className="text-5xl mb-6">{agent.emoji}</div>
              <h3 className="text-xl font-bold mb-4 text-foreground">{agent.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                style={{ boxShadow: '0 0 40px rgba(244, 126, 28, 0.1)' }} 
              />
            </div>
          ))}
        </div>

        {/* The Magic Section */}
        <div className="relative p-8 md:p-12 rounded-2xl bg-gradient-card border border-border card-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">The Magic</h3>
              <p className="text-lg text-muted-foreground">
                Your squad shares intelligence in real-time. When one agent learns something, they all know it instantly. 
                Plus automatic <span className="text-secondary font-semibold">SMS and email follow-ups</span> ensure no lead escapes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SquadSection;
