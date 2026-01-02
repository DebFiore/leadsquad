import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "First month with LeadSquad: 73 appointments booked, $47,000 in new revenue. I should have done this years ago.",
    author: "Sarah Chen",
    company: "Chen Plumbing Services",
    metric: "$47K Revenue",
  },
  {
    quote: "We went from 20% callback rate to 94% contact rate. Our competitors think we hired an army.",
    author: "Mike Rodriguez",
    company: "Solar Solutions Plus",
    metric: "94% Contact Rate",
  },
  {
    quote: "LeadSquad paid for itself in 3 days. Now I actually take weekends off.",
    author: "Jennifer Park",
    company: "Park Family Dental",
    metric: "3 Day ROI",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
            Real Businesses, <span className="text-gradient">Real Results</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-gradient-card border border-border card-shadow group hover:border-primary/50 transition-all duration-500"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {testimonial.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
