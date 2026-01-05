import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-narrow mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">About LeadSquad</h1>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Two Decades of Watching Businesses Bleed Leads</h2>
            <p className="text-muted-foreground mb-4">
              For over 20 years, we've been in the trenches of lead generation. We've watched the painful reality unfold thousands of times: every minute between a lead's interest and a business's response is money evaporating.
            </p>
            <p className="text-muted-foreground">
              We've seen contractors lose $100,000 jobs because they called back three hours too late. We've watched dental practices spend $5,000 on Google Ads only to let leads die in voicemail purgatory. The math is brutal—every 10-minute delay reduces conversion by 400%.
            </p>
            <p className="text-muted-foreground mt-4">
              We knew there had to be a better way.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">The Birth of AI-Powered Solutions</h2>
            <p className="text-muted-foreground mb-4">
              In 2023, we launched MERGE AI to solve this problem using cutting-edge artificial intelligence. We built sophisticated AI agents and workflows that transformed how enterprise businesses handled leads. Our systems could respond in seconds, qualify prospects intelligently, and book appointments 24/7.
            </p>
            <p className="text-muted-foreground mb-4">
              The results were extraordinary. Our enterprise clients saw 300% increases in lead conversion. Their AI agents never missed a call, never forgot to follow up, and never let a hot lead go cold.
            </p>
            <p className="text-muted-foreground">
              But there was one problem: the $2,000+ monthly agency retainer.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">The LeadSquad Mission: AI for Everyone</h2>
            <p className="text-muted-foreground mb-4">
              While MERGE AI thrived serving enterprise clients, we couldn't ignore the millions of small-to-mid size businesses suffering from the same lead response crisis. They needed AI just as desperately, but they couldn't afford enterprise solutions or the technical expertise to build their own.
            </p>
            <p className="text-muted-foreground mb-4">
              That's when we decided to democratize AI lead management.
            </p>
            <p className="text-muted-foreground mb-4">
              We took everything we'd learned—every optimization, every best practice, every hard-won insight—and packaged it into LeadSquad. We stripped away the complexity, pre-configured the perfect settings, and built a platform that any business owner could set up in 12 minutes.
            </p>
            <p className="text-muted-foreground">
              No coding. No technical knowledge. No expensive consultants.
            </p>
            <p className="text-muted-foreground mt-4">
              Just plug in your business information, choose your AI voices, connect your calendar, and watch your lead response time drop from hours to seconds.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Two Paths, One Purpose</h2>
            <p className="text-muted-foreground mb-4">
              Today, MERGE AI continues to serve enterprise clients who need custom AI workflows and white-glove service. Meanwhile, LeadSquad empowers thousands of small businesses to compete with the giants.
            </p>
            <p className="text-muted-foreground mb-4">
              It's the same technology. The same expertise. The same commitment to never letting another lead slip away.
            </p>
            <p className="text-muted-foreground">
              The only difference? With LeadSquad, you don't need a $2,000 retainer or a technical degree. You just need 12 minutes and the desire to grow.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why This Matters</h2>
            <p className="text-muted-foreground mb-4">
              Behind every missed lead is a real story. A homeowner with a flooding basement who called someone else. A bride who booked a different photographer. A patient who chose another dentist.
            </p>
            <p className="text-muted-foreground mb-4">
              We've spent two decades watching these stories unfold. With LeadSquad, we're rewriting the ending.
            </p>
            <p className="text-muted-foreground font-semibold">
              Welcome to the future of lead management. Welcome to LeadSquad.
            </p>
            <p className="text-primary mt-4">
              Powered by MERGE AI's enterprise expertise. Built for businesses like yours.
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default About;
