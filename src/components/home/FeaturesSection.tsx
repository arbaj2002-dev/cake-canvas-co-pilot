import { Cake, Truck, Leaf, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/home/SectionHeading";

const features = [
  {
    icon: Cake,
    title: "Freshly Baked",
    description: "Every cake is baked to order using premium, locally-sourced ingredients.",
  },
  {
    icon: Truck,
    title: "Same-Day Delivery",
    description: "Order before noon and get your cake delivered to your doorstep today.",
  },
  {
    icon: Sparkles,
    title: "Custom Designs",
    description: "Personalize flavours, sizes and decorations for any celebration.",
  },
  {
    icon: Leaf,
    title: "Quality Guarantee",
    description: "No preservatives, no shortcuts — just pure, handcrafted goodness.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Why Frostique"
          title="Baked for every"
          accent="celebration."
          description="Quality, craft and care go into every single order — here's what sets us apart."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] border border-border bg-card/80 p-6 text-center shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-button">
                <span className="pointer-events-none absolute -top-2 right-4 font-display text-5xl italic text-primary/10 transition-smooth group-hover:text-primary/20">
                  0{i + 1}
                </span>
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-button text-white shadow-button">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative font-display text-lg font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
