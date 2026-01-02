import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need technical skills?",
    answer:
      "Zero. If you can use Facebook, you can use LeadSquad. Our most successful user is a 67-year-old plumber who \"hates computers.\"",
  },
  {
    question: "Will it sound like a robot?",
    answer:
      "Our AI uses natural voices from ElevenLabs. Most callers can't tell it's AI. Choose from 12 different voices to match your brand.",
  },
  {
    question: "What if I already have a CRM?",
    answer:
      "Perfect. LeadSquad connects to your existing tools (GoHighLevel, Pipedrive, ZOHO, and more) in one click.",
  },
  {
    question: "How fast will I see results?",
    answer:
      "Most businesses book their first AI-powered appointment within 24 hours. ROI typically happens in week one.",
  },
  {
    question: "What makes this different from chatbots?",
    answer:
      "Chatbots wait for typed messages. LeadSquad proactively calls, texts, and emails leads the second they show interest. It's offense, not defense.",
  },
  {
    question: "Can I customize the scripts?",
    answer:
      "Yes. Start with our proven industry templates, then tweak every word to match your voice.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-background">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="px-6 rounded-xl bg-card border border-border data-[state=open]:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
