import { Star, Quote } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Birthday order",
    rating: 5,
    text: "The chocolate truffle cake was absolutely divine! Fresh, moist and delivered right on time. My daughter's birthday was a hit.",
  },
  {
    name: "Rahul Verma",
    role: "Wedding order",
    rating: 5,
    text: "Ordered a 3-tier wedding cake and it exceeded every expectation. Beautiful design and even better taste. Highly recommend!",
  },
  {
    name: "Ananya Iyer",
    role: "Anniversary order",
    rating: 5,
    text: "Frostique made our anniversary special. The custom design was exactly what I imagined. Will order again for sure!",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Testimonials"
          title="Loved by our"
          accent="customers."
          description="Don't just take our word for it — here's what our sweet-toothed customers have to say."
        />

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card">
                <Quote className="absolute top-4 right-5 h-10 w-10 text-primary/10" />
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="relative mb-5 flex-1 font-display text-base italic leading-relaxed text-foreground">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-button font-display font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
