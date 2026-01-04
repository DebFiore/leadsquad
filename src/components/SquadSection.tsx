import { Sparkles, Star } from "lucide-react";

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
        <div className="group relative p-8 md:p-12 rounded-2xl bg-white border border-[hsl(var(--light-border))] card-shadow-light overflow-hidden">
          {/* Wand with radiating sparkles - styled like reference */}
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24">
            {/* Radiating lines around wand tip */}
            <div className="absolute -top-3 left-1 w-16 h-16 md:w-20 md:h-20">
              {/* Burst lines */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-foreground/60 origin-bottom group-hover:animate-pulse"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-100%)`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
              {/* Center star */}
              <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 fill-yellow-400 group-hover:animate-sparkle" />
            </div>
            
            {/* The wand */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full group-hover:animate-wand-glow transition-all"
            >
              {/* Wand handle (pink/primary gradient) */}
              <defs>
                <linearGradient id="wandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(27 92% 53%)" />
                  <stop offset="100%" stopColor="hsl(27 100% 65%)" />
                </linearGradient>
              </defs>
              <rect 
                x="45" y="25" 
                width="12" height="55" 
                rx="3" 
                fill="url(#wandGradient)"
                transform="rotate(45 50 50)"
                className="drop-shadow-md"
              />
              {/* Wand tip (dark) */}
              <rect 
                x="46" y="20" 
                width="10" height="8" 
                rx="1" 
                fill="hsl(233 50% 15%)"
                transform="rotate(45 50 50)"
              />
            </svg>
            
            {/* Floating sparkles */}
            <Sparkles className="absolute -top-4 left-2 w-3 h-3 text-yellow-400 opacity-0 group-hover:animate-sparkle" />
            <Sparkles className="absolute -top-2 -left-2 w-4 h-4 text-primary opacity-0 group-hover:animate-sparkle-delay-1" />
            <Sparkles className="absolute top-0 left-10 w-3 h-3 text-yellow-400 opacity-0 group-hover:animate-sparkle-delay-2" />
            <div className="absolute -top-6 left-6 w-2 h-2 rounded-full bg-yellow-400 opacity-0 group-hover:animate-sparkle-delay-3" />
            <div className="absolute top-2 -left-4 w-2 h-2 rounded-full bg-yellow-400 opacity-0 group-hover:animate-sparkle" />
          </div>
          
          <div className="ml-24 md:ml-32">
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">The Magic</h3>
            <p className="text-lg text-muted-foreground">
              Your squad shares intelligence in real-time. When one agent learns something, they all know it instantly. 
              Plus automatic <span className="text-primary font-semibold">SMS and email follow-ups</span> ensure no lead escapes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SquadSection;
