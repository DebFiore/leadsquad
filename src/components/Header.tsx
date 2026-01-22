import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/leadsquad-logo-transparent.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container-narrow mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="LeadSquad" className="h-14 md:h-16 w-auto" />
            <span className="text-xl md:text-2xl font-bold text-foreground">
              Lead<span className="text-gradient">Squad</span>
            </span>
          </a>
          
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                Client Dashboard
              </Link>
            </nav>

            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
