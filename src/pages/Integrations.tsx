import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Users, 
  Share2, 
  Mail, 
  BarChart3, 
  MessageSquare, 
  Calendar,
} from "lucide-react";
import klaviyoLogo from "@/assets/integrations/klaviyo.png";

// Custom logos for integrations not available on simple-icons
const customLogos: Record<string, string> = {
  klaviyo: klaviyoLogo,
};

const integrationCategories = [
  {
    icon: Users,
    title: "CRM Platforms",
    description: "Seamlessly connect with your existing CRM system",
    integrations: [
      { name: "HighLevel", slug: "gohighlevel", status: "popular" },
      { name: "Salesforce", slug: "salesforce", status: "popular" },
      { name: "HubSpot", slug: "hubspot", status: "popular" },
      { name: "Pipedrive", slug: "pipedrive", status: "available" },
      { name: "Zoho CRM", slug: "zoho", status: "available" },
      { name: "Microsoft Dynamics", slug: "dynamics365", status: "available" },
    ],
  },
  {
    icon: Share2,
    title: "Social Platforms",
    description: "Expand your reach across social networks",
    integrations: [
      { name: "LinkedIn", slug: "linkedin", status: "popular" },
      { name: "Twitter", slug: "x", status: "available" },
      { name: "Facebook", slug: "facebook", status: "available" },
      { name: "Instagram", slug: "instagram", status: "available" },
      { name: "YouTube", slug: "youtube", status: "available" },
      { name: "TikTok", slug: "tiktok", status: "available" },
    ],
  },
  {
    icon: Mail,
    title: "Email Platforms",
    description: "Enhance your email marketing campaigns",
    integrations: [
      { name: "Mailchimp", slug: "mailchimp", status: "popular" },
      { name: "Klaviyo", slug: "klaviyo", status: "popular" },
      { name: "SendGrid", slug: "sendgrid", status: "available" },
      { name: "Constant Contact", slug: "constantcontact", status: "available" },
      { name: "Mailgun", slug: "mailgun", status: "available" },
      { name: "Postmark", slug: "postmark", status: "available" },
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Data",
    description: "Connect with analytics and data enrichment tools",
    integrations: [
      { name: "Google Analytics", slug: "googleanalytics", status: "available" },
      { name: "Adobe Analytics", slug: "adobe", status: "available" },
      { name: "Clearbit", slug: "clearbit", status: "available" },
      { name: "ZoomInfo", slug: "zoominfo", status: "available" },
      { name: "Apollo", slug: "apollo", status: "available" },
      { name: "Segment", slug: "segment", status: "available" },
    ],
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Integrate with messaging and communication tools",
    integrations: [
      { name: "Slack", slug: "slack", status: "popular" },
      { name: "Microsoft Teams", slug: "microsoftteams", status: "available" },
      { name: "Discord", slug: "discord", status: "available" },
      { name: "Messenger", slug: "messenger", status: "available" },
      { name: "WhatsApp", slug: "whatsapp", status: "popular" },
      { name: "Telegram", slug: "telegram", status: "available" },
    ],
  },
  {
    icon: Calendar,
    title: "Scheduling",
    description: "Sync with calendar and scheduling applications",
    integrations: [
      { name: "Calendly", slug: "calendly", status: "popular" },
      { name: "Acuity", slug: "acuityscheduling", status: "available" },
      { name: "Google Calendar", slug: "googlecalendar", status: "available" },
      { name: "Outlook", slug: "microsoftoutlook", status: "available" },
      { name: "Zoom", slug: "zoom", status: "available" },
      { name: "Cal.com", slug: "caldotcom", status: "available" },
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
                        {/* Integration Icon */}
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-2 p-2">
                          <img 
                            src={customLogos[integration.slug] || `https://cdn.simpleicons.org/${integration.slug}`}
                            alt={integration.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${getInitials(integration.name)}</span>`;
                            }}
                          />
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
