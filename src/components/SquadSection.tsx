import { Wand2, Sparkles } from "lucide-react";

const agents = [
  {
    emoji: "📞",
    title: "The Inbound Specialist",
    description: "Answers every call in 2 rings. Books appointments while you sleep. Never takes a sick day.",
    color: "from-primary/10 to-primary/5",
    borderColor: "border-primary/30",
  },
  {
    emoji: "⏱️",
    title: "The Speed Demon",
    description: "Calls online leads within 7 seconds of form submission. First contact = first sale.",
    color: "from-primary/10 to-primary/5",
    borderColor: "border-primary/30",
  },
  {
    emoji: "📅",
    title: "The Closer's Assistant",
    description: "Qualifies leads and fills your calendar with ready-to-buy appointments. Your closers only talk to hot prospects.",
    color: "from-primary/10 to-primary/5",
    borderColor: "border-primary/30",
  },
];

const SquadSection = () => {
  return (
    <section id="features" className="section-padding section-light">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Your Unfair Advantage
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-foreground">
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
              <div className="text-4xl mb-6">{agent.emoji}</div>
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
        <div className="group relative p-8 md:p-12 rounded-2xl bg-gradient-card border border-border card-shadow overflow-hidden">
          {/* Wand with sparkles - positioned freely on background */}
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20">
            <Wand2 className="w-full h-full text-primary/80 -rotate-45 group-hover:animate-wand-glow transition-all" />
            {/* Sparkle effects around the magic tip (upper-left) */}
            <Sparkles className="absolute -top-2 left-0 w-4 h-4 text-primary opacity-0 group-hover:animate-sparkle" />
            <Sparkles className="absolute -top-4 left-4 w-3 h-3 text-primary opacity-0 group-hover:animate-sparkle-delay-1" />
            <Sparkles className="absolute top-0 -left-3 w-4 h-4 text-primary opacity-0 group-hover:animate-sparkle-delay-2" />
            <Sparkles className="absolute -top-1 left-8 w-3 h-3 text-primary opacity-0 group-hover:animate-sparkle-delay-3" />
            <Sparkles className="absolute top-2 -left-2 w-2 h-2 text-primary opacity-0 group-hover:animate-sparkle" />
          </div>
          
          <div className="ml-20 md:ml-28">
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">The Magic</h3>
            <p className="text-lg text-muted-foreground">
              Your squad shares intelligence in real-time. When one agent learns something, they all know it instantly. 
              Plus automatic <span className="text-secondary font-semibold">SMS and email follow-ups</span> ensure no lead escapes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SquadSection;
