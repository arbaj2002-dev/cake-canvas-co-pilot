import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Star, Truck, ShieldCheck, BadgePercent, Cake } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroCake from "@/assets/hero-cake.jpg";

const marqueeItems = [
  "Same-Day Delivery",
  "100% Fresh Cream",
  "Custom Designs",
  "Eggless Options",
  "Premium Ingredients",
  "Baked to Order",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/cakes?search=${encodeURIComponent(query.trim())}` : "/cakes");
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-16 -left-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-24 -right-16 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      {/* Oversized ghost word */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none font-display italic font-semibold text-[22vw] leading-none text-primary/[0.05] whitespace-nowrap"
      >
        Frostique
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* ——— Left: copy ——— */}
          <div className="text-center lg:text-left">
            {/* Kicker */}
            <div
              className="animate-fade-up flex items-center justify-center gap-3 lg:justify-start"
              style={{ animationDelay: "0ms" }}
            >
              <span className="hidden h-px w-10 bg-primary/60 sm:block" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Artisan Cake Studio
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-button px-3 py-1 text-xs font-semibold text-white shadow-button">
                <BadgePercent className="h-3.5 w-3.5" />
                20% off first order
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up mt-6 font-display text-[2.75rem] font-semibold leading-[1.05] text-foreground sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "120ms" }}
            >
              Fresh cakes,
              <br />
              <span className="relative inline-block italic text-gradient pr-2">
                delivered today.
                {/* hand-drawn underline */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 220 12"
                  className="absolute -bottom-2 left-0 w-full text-primary/50"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9C60 3 160 2 218 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            {/* Sub copy */}
            <p
              className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0"
              style={{ animationDelay: "240ms" }}
            >
              Handcrafted for birthdays, weddings and every sweet occasion — baked fresh each
              morning and brought to your doorstep.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="animate-fade-up mx-auto mt-8 flex max-w-md gap-2 lg:mx-0"
              style={{ animationDelay: "360ms" }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chocolate, red velvet, eggless…"
                  className="h-[3.25rem] rounded-full border-border bg-card pl-11 shadow-soft"
                />
              </div>
              <Button
                type="submit"
                className="h-[3.25rem] rounded-full bg-gradient-button px-6 shadow-button transition-bounce hover:scale-105"
              >
                <Search className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>

            {/* CTAs */}
            <div
              className="animate-fade-up mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
              style={{ animationDelay: "480ms" }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gradient-button px-8 py-6 text-base shadow-button transition-bounce hover:scale-105"
              >
                <Link to="/cakes" className="flex items-center gap-2">
                  <span>Shop All Cakes</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-primary px-8 py-6 text-base text-primary transition-smooth hover:bg-primary/10"
              >
                <Link to="/gallery">Browse Gallery</Link>
              </Button>
            </div>

            {/* Trust row */}
            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start"
              style={{ animationDelay: "600ms" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" /> Free delivery over ₹999
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" /> 4.9 · 200+ reviews
              </span>
            </div>
          </div>

          {/* ——— Right: arch image ——— */}
          <div
            className="animate-fade-up relative mx-auto w-full max-w-md lg:max-w-none"
            style={{ animationDelay: "300ms" }}
          >
            {/* Arch frame */}
            <div className="relative overflow-hidden rounded-t-[10rem] rounded-b-[2rem] border-8 border-card shadow-card sm:rounded-t-[14rem]">
              <img
                src={heroCake}
                alt="Bestselling handcrafted birthday cake"
                className="h-[380px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[480px] lg:h-[560px]"
              />
              {/* Bottom legibility gradient */}
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Product info */}
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 text-white">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                    Today's Special
                  </div>
                  <div className="font-display text-lg font-semibold leading-tight sm:text-xl">
                    Classic Chocolate Truffle
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xl font-bold sm:text-2xl">₹649</span>
                    <span className="text-sm text-white/60 line-through">₹811</span>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="shrink-0 rounded-full bg-white font-semibold text-primary shadow-button hover:bg-white/90"
                >
                  <Link to="/cakes">Order Now</Link>
                </Button>
              </div>
            </div>

            {/* Rotating badge */}
            <div className="absolute -top-6 -right-2 hidden h-28 w-28 sm:block lg:-right-6">
              <div className="animate-spin-slow motion-reduce:animate-none absolute inset-0">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <path id="badge-circle" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                  </defs>
                  <text className="fill-primary text-[10.5px] font-semibold uppercase tracking-[0.22em]">
                    <textPath href="#badge-circle">
                      Freshly Baked · Every Morning ·
                    </textPath>
                  </text>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-button text-white shadow-button">
                  <Cake className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Floating rating card */}
            <div className="animate-float motion-reduce:animate-none absolute -left-3 top-16 rounded-2xl border border-border bg-card/95 px-4 py-2.5 shadow-card backdrop-blur-sm sm:-left-8">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-foreground">4.9 rating</div>
                  <div className="text-[11px] text-muted-foreground">200+ happy reviews</div>
                </div>
              </div>
            </div>

            {/* Floating delivery card */}
            <div
              className="animate-float motion-reduce:animate-none absolute -bottom-5 left-6 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-card"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-button text-white">
                <Truck className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-xs font-semibold text-foreground">Same-day delivery</div>
                <div className="text-[11px] text-muted-foreground">Order before 12 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ——— Marquee strip ——— */}
      <div className="relative z-10 border-y border-border bg-card/60 py-3 backdrop-blur-sm">
        <div className="flex overflow-hidden" aria-hidden="true">
          <div className="animate-marquee motion-reduce:animate-none flex shrink-0 items-center">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="mx-6 flex items-center gap-6 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                {item}
                <span className="text-primary">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
