import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Reveal from "@/components/Reveal";
import heroCake from "@/assets/hero-cake.jpg";
import weddingCake from "@/assets/wedding-cake.jpg";
import chocolateCake from "@/assets/chocolate-cake.jpg";
import rainbowCake from "@/assets/rainbow-cake.jpg";

const categories = [
  { name: "Birthday", search: "birthday", image: heroCake },
  { name: "Anniversary", search: "anniversary", image: chocolateCake },
  { name: "Wedding", search: "wedding", image: weddingCake },
  { name: "Chocolate", search: "chocolate", image: chocolateCake },
  { name: "Kids & Fun", search: "kids", image: rainbowCake },
  { name: "Eggless", search: "eggless", image: heroCake },
  { name: "Custom", search: "", image: weddingCake, to: "/contact", custom: true },
];

const popularSearches = ["Chocolate Truffle", "Red Velvet", "Eggless", "Photo Cake"];

const QuickCategories = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/cakes?search=${encodeURIComponent(query.trim())}` : "/cakes");
  };

  return (
    <section aria-label="Find your cake" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Search */}
      <Reveal>
        <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl gap-2">
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
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="uppercase tracking-[0.18em]">Popular:</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              to={`/cakes?search=${encodeURIComponent(term)}`}
              className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground transition-smooth hover:border-primary hover:text-primary"
            >
              {term}
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Category rail */}
      <Reveal delay={100}>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-3 sm:gap-6 sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.to ?? `/cakes?search=${encodeURIComponent(category.search)}`}
              className="group flex shrink-0 snap-start flex-col items-center gap-2.5"
            >
              <div
                className={`relative h-20 w-20 overflow-hidden rounded-full border-[3px] shadow-soft transition-smooth group-hover:-translate-y-1 group-hover:shadow-button sm:h-24 sm:w-24 ${
                  category.custom ? "border-primary" : "border-card"
                }`}
              >
                <img
                  src={category.image}
                  alt={`${category.name} cakes`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {category.custom && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-foreground transition-smooth group-hover:text-primary sm:text-sm">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

export default QuickCategories;
