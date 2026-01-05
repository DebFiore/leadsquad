import logo from "@/assets/leadsquad-logo.png";

const Footer = () => {
  const productLinks = ["How It Works", "Features", "Integrations"];
  const pricingLinks = ["Starter - $197", "Professional - $497", "Managed Services"];
  const resourceLinks = ["Blog", "Case Studies", "Help Center"];
  const companyLinks = ["About", "Contact", "Careers"];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <img src={logo} alt="LeadSquad" className="h-14 w-auto" />
              <span className="text-xl font-bold">
                Lead<span className="text-gradient">Squad</span>
              </span>
            </div>
            <p className="text-primary font-semibold text-sm mb-2">Never Miss Another Lead</p>
            <p className="text-sm text-muted-foreground">Powered by MERGE AI</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Pricing</h4>
            <ul className="space-y-3">
              {pricingLinks.map((link) => (
                <li key={link}>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 LeadSquad. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="mailto:support@leadsquad.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              support@leadsquad.ai
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
