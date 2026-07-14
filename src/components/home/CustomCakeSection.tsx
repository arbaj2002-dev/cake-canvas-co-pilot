import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Palette, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import weddingCake from "@/assets/wedding-cake.jpg";
import rainbowCake from "@/assets/rainbow-cake.jpg";

const steps = [
  {
    icon: MessageCircle,
    title: "Share your idea",
    description: "A photo, a theme, or just a vibe — tell us what you're dreaming of.",
  },
  {
    icon: Palette,
    title: "We design & quote",
    description: "Our bakers sketch your cake and send a price within a few hours.",
  },
  {
    icon: Truck,
    title: "Delivered fresh",
    description: "Baked to order and hand-delivered right on time for the big moment.",
  },
];

const CustomCakeSection = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image collage */}
          <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] border-8 border-card shadow-card">
                <img
                  src={weddingCake}
                  alt="Custom designed multi-tier cake"
                  className="h-[340px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[420px]"
                  loading="lazy"
                />
              </div>
              {/* Overlapping second photo */}
              <div className="absolute -bottom-8 -right-3 w-36 overflow-hidden rounded-[1.5rem] border-[6px] border-card shadow-card sm:-right-8 sm:w-48">
                <img
                  src={rainbowCake}
                  alt="Colourful custom kids cake"
                  className="h-32 w-full object-cover sm:h-40"
                  loading="lazy"
                />
              </div>
              {/* Floating tag */}
              <div className="animate-float motion-reduce:animate-none absolute -left-3 top-8 rounded-2xl border border-border bg-card/95 px-4 py-2.5 shadow-card backdrop-blur-sm sm:-left-6">
                <div className="text-sm font-bold text-foreground">100% Yours</div>
                <div className="text-[11px] text-muted-foreground">Any theme · Any flavour</div>
              </div>
            </div>
          </Reveal>

          {/* Copy + steps */}
          <div>
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="hidden h-px w-10 bg-primary/60 sm:block" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Custom Cake Studio
                </span>
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
                Your story, told in{" "}
                <span className="italic text-gradient">buttercream.</span>
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Photo cakes, themed tiers, character cakes — if you can imagine it, our bakers
                can build it. Custom orders start at just ₹899.
              </p>
            </Reveal>

            <div className="mt-8 space-y-5">
              {steps.map(({ icon: Icon, title, description }, i) => (
                <Reveal key={title} delay={i * 100}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-button text-white shadow-button">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm italic text-primary/60">0{i + 1}</span>
                        <h3 className="font-semibold text-foreground">{title}</h3>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-button px-8 shadow-button transition-bounce hover:scale-105"
                >
                  <Link to="/contact" className="flex items-center gap-2">
                    <span>Start a Custom Order</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full border-primary px-8 text-primary transition-smooth hover:bg-primary/10"
                >
                  <Link to="/gallery">Browse Inspiration</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomCakeSection;
