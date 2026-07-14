import { Link } from "react-router-dom";
import { ArrowRight, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";

const FinalCTASection = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-button px-6 py-12 text-center text-white shadow-button sm:px-12 sm:py-16">
          {/* Decorative rings */}
          <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full border-[20px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-12 h-64 w-64 rounded-full border-[24px] border-white/10" />

          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
            <BadgePercent className="h-4 w-4" />
            First order offer
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
            Get 20% off your first cake with{" "}
            <span className="italic underline decoration-white/50 underline-offset-4">
              FROSTIQUE20
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 sm:text-base">
            Fresh, handcrafted and at your door today. Sweet moments shouldn't wait.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 font-semibold text-primary shadow-button transition-bounce hover:scale-105 hover:bg-white/90"
            >
              <Link to="/cakes" className="flex items-center gap-2">
                <span>Shop Cakes Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/60 bg-transparent px-8 text-white transition-smooth hover:bg-white/10 hover:text-white"
            >
              <Link to="/contact">Order a Custom Cake</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default FinalCTASection;
