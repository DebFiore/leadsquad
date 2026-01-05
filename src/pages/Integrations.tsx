import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Users, 
  Share2, 
  Mail, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Linkedin,
  Youtube,
  Facebook,
  Instagram
} from "lucide-react";

const integrationCategories = [
  {
    icon: Users,
    title: "CRM Platforms",
    description: "Seamlessly connect with your existing CRM system",
    integrations: [
      { name: "HighLevel", status: "popular" },
      { name: "Salesforce", status: "popular" },
      { name: "HubSpot", status: "popular" },
      { name: "Pipedrive", status: "available" },
      { name: "Zoho CRM", status: "available" },
      { name: "Microsoft Dynamics", status: "available" },
    ],
  },
  {
    icon: Share2,
    title: "Social Platforms",
    description: "Expand your reach across social networks",
    integrations: [
      { name: "LinkedIn", status: "popular" },
      { name: "Twitter", status: "available" },
      { name: "Facebook", status: "available" },
      { name: "Instagram", status: "available" },
      { name: "YouTube", status: "available" },
      { name: "TikTok", status: "available" },
    ],
  },
  {
    icon: Mail,
    title: "Email Platforms",
    description: "Enhance your email marketing campaigns",
    integrations: [
      { name: "Mailchimp", status: "popular" },
      { name: "Klaviyo", status: "popular" },
      { name: "SendGrid", status: "available" },
      { name: "Constant Contact", status: "available" },
      { name: "Mailgun", status: "available" },
      { name: "Postmark", status: "available" },
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Data",
    description: "Connect with analytics and data enrichment tools",
    integrations: [
      { name: "Google Analytics", status: "available" },
      { name: "Adobe Analytics", status: "available" },
      { name: "Clearbit", status: "available" },
      { name: "ZoomInfo", status: "available" },
      { name: "Apollo", status: "available" },
      { name: "Triple Whale", status: "available" },
    ],
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Integrate with messaging and communication tools",
    integrations: [
      { name: "Slack", status: "popular" },
      { name: "Microsoft Teams", status: "available" },
      { name: "Discord", status: "available" },
      { name: "Messenger", status: "available" },
      { name: "WhatsApp", status: "popular" },
      { name: "Telegram", status: "available" },
    ],
  },
  {
    icon: Calendar,
    title: "Scheduling",
    description: "Sync with calendar and scheduling applications",
    integrations: [
      { name: "Calendly", status: "popular" },
      { name: "Acuity", status: "available" },
      { name: "Google Calendar", status: "available" },
      { name: "Outlook Calendar", status: "available" },
      { name: "Zoom", status: "available" },
      { name: "Cal.com", status: "available" },
    ],
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Integrations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="section-padding">
          <div className="container-narrow mx-auto text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              100+ Integrations
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              Connect Your Existing{" "}
              <span className="text-gradient">Tech Stack</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              LeadSquad integrates with 100+ popular tools and platforms ensuring
              seamless workflow integration and maximum productivity
            </p>
          </div>
        </section>

        {/* Integration Categories Grid */}
        <section className="section-padding pt-0">
          <div className="container-narrow mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {integrationCategories.map((category, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  {/* Category Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Integration Items */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {category.integrations.map((integration, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        {/* Integration Icon Placeholder */}
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2 text-xs font-bold text-muted-foreground">
                          {getInitials(integration.name)}
                        </div>
                        <span className="text-xs font-medium text-foreground mb-1 line-clamp-1">
                          {integration.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            integration.status === "popular"
                              ? "bg-primary/20 text-primary"
                              : "bg-green-500/20 text-green-500"
                          }`}
                        >
                          {integration.status === "popular" ? "Popular" : "Available"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding">
          <div className="container-narrow mx-auto text-center">
            <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-primary/10 to-orange-glow/10 border border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Don't see your tool?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                We're constantly adding new integrations. Contact us to request
                a specific integration for your workflow.
              </p>
              <a
                href="mailto:support@leadsquad.ai"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Request Integration
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Integrations;
