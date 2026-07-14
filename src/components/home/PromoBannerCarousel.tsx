import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import heroCake from "@/assets/hero-cake.jpg";
import weddingCake from "@/assets/wedding-cake.jpg";
import chocolateCake from "@/assets/chocolate-cake.jpg";

interface BannerSlide {
  id: string;
  kicker: string;
  kickerIcon: typeof BadgePercent;
  title: string;
  accent: string;
  description: string;
  cta: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  image: string;
  imageAlt: string;
  badge?: { top: string; bottom: string };
  background: string;
}

const slides: BannerSlide[] = [
  {
    id: "offer",
    kicker: "Limited-time offer",
    kickerIcon: BadgePercent,
    title: "Flat 20% off",
    accent: "your first cake.",
    description:
      "Use code FROSTIQUE20 at checkout. Freshly baked, delivered the same day.",
    cta: { label: "Shop Bestsellers", to: "/cakes" },
    secondaryCta: { label: "View All Cakes", to: "/cakes" },
    image: heroCake,
    imageAlt: "Bestselling chocolate truffle cake",
    badge: { top: "From", bottom: "₹649" },
    background: "linear-gradient(120deg, hsl(40 45% 96%) 0%, hsl(42 70% 91%) 55%, hsl(38 85% 86%) 100%)",
  },
  {
    id: "custom",
    kicker: "Custom Cake Studio",
    kickerIcon: Sparkles,
    title: "Dream it.",
    accent: "We'll bake it.",
    description:
      "Photo cakes, themed tiers, any flavour — share your idea and get a design & quote within hours.",
    cta: { label: "Start a Custom Order", to: "/contact" },
    secondaryCta: { label: "See Past Creations", to: "/gallery" },
    image: weddingCake,
    imageAlt: "Custom designed wedding cake",
    badge: { top: "Made", bottom: "For You" },
    background: "linear-gradient(120deg, hsl(45 40% 97%) 0%, hsl(35 55% 92%) 55%, hsl(30 65% 87%) 100%)",
  },
  {
    id: "delivery",
    kicker: "Same-day delivery",
    kickerIcon: Clock,
    title: "Fresh today,",
    accent: "at your door.",
    description:
      "Order before 12 PM and celebrate tonight. Free delivery on orders over ₹999.",
    cta: { label: "Order Now", to: "/cakes" },
    image: chocolateCake,
    imageAlt: "Rich chocolate cake ready for delivery",
    badge: { top: "Before", bottom: "12 PM" },
    background: "linear-gradient(120deg, hsl(42 50% 96%) 0%, hsl(38 60% 90%) 55%, hsl(34 75% 85%) 100%)",
  },
];

const AUTOPLAY_MS = 5000;

const PromoBannerCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Autoplay, paused while hovered
  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => {
      if (!hoverRef.current) api.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [api]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  return (
    <section
      aria-label="Offers and highlights"
      className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
    >
      <div className="relative">
        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {slides.map(({ kickerIcon: KickerIcon, ...slide }, i) => (
              <CarouselItem key={slide.id}>
                <div
                  className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-card"
                  style={{ background: slide.background }}
                >
                  {/* Decorative blobs */}
                  <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
                  {/* Ghost slide number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 left-6 select-none font-display text-[9rem] italic font-semibold leading-none text-primary/[0.07]"
                  >
                    0{i + 1}
                  </span>

                  <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-14 lg:py-0 lg:min-h-[420px]">
                    {/* Copy */}
                    <div className="text-center lg:text-left">
                      <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-soft backdrop-blur-sm">
                        <KickerIcon className="h-3.5 w-3.5" />
                        {slide.kicker}
                      </span>
                      <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
                        {slide.title}
                        <br />
                        <span className="italic text-gradient">{slide.accent}</span>
                      </h2>
                      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
                        {slide.description}
                      </p>
                      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                        <Button
                          asChild
                          size="lg"
                          className="rounded-full bg-gradient-button px-8 shadow-button transition-bounce hover:scale-105"
                        >
                          <Link to={slide.cta.to} className="flex items-center gap-2">
                            <span>{slide.cta.label}</span>
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </Button>
                        {slide.secondaryCta && (
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-full border-primary/50 bg-card/60 px-8 text-primary backdrop-blur-sm transition-smooth hover:bg-primary/10"
                          >
                            <Link to={slide.secondaryCta.to}>{slide.secondaryCta.label}</Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative mx-auto w-full max-w-[280px] pb-2 sm:max-w-xs lg:max-w-sm lg:py-10">
                      <div className="relative overflow-hidden rounded-t-[8rem] rounded-b-[1.5rem] border-[6px] border-card shadow-card">
                        <img
                          src={slide.image}
                          alt={slide.imageAlt}
                          className="h-56 w-full object-cover sm:h-64 lg:h-80"
                          loading={i === 0 ? "eager" : "lazy"}
                        />
                      </div>
                      {slide.badge && (
                        <div className="absolute -left-2 bottom-6 rounded-2xl border border-border bg-card px-4 py-2 text-center shadow-card sm:-left-6">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {slide.badge.top}
                          </div>
                          <div className="font-display text-lg font-bold text-primary">
                            {slide.badge.bottom}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Prev / Next */}
        <button
          type="button"
          aria-label="Previous banner"
          onClick={() => api?.scrollPrev()}
          className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-soft backdrop-blur-sm transition-smooth hover:bg-card sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next banner"
          onClick={() => api?.scrollNext()}
          className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow-soft backdrop-blur-sm transition-smooth hover:bg-card sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to banner ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i ? "w-6 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBannerCarousel;
