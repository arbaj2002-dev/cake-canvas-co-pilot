import { Cake, Leaf, Star, Truck } from "lucide-react";
import Reveal from "@/components/Reveal";

const items = [
  { icon: Truck, stat: "Same-Day", label: "Delivery before 12 PM" },
  { icon: Cake, stat: "Baked Fresh", label: "Every single morning" },
  { icon: Star, stat: "4.9 / 5", label: "200+ happy reviews" },
  { icon: Leaf, stat: "100% Pure", label: "No preservatives, ever" },
];

const TrustStrip = () => {
  return (
    <section aria-label="Why order from Frostique" className="border-y border-border bg-card/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 divide-border py-6 sm:py-8 lg:grid-cols-4 lg:divide-x">
            {items.map(({ icon: Icon, stat, label }) => (
              <div key={stat} className="flex items-center justify-center gap-3 py-2 lg:py-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <div className="font-display text-base font-semibold text-foreground sm:text-lg">
                    {stat}
                  </div>
                  <div className="text-[11px] text-muted-foreground sm:text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default TrustStrip;
