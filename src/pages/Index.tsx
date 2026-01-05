import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import BrutalTruthSection from "@/components/BrutalTruthSection";
import SquadSection from "@/components/SquadSection";
import TimelineSection from "@/components/TimelineSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BrutalTruthSection />
        <SquadSection />
        <TimelineSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
