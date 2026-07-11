import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/home/SectionHeading";
import chocolateCake from "@/assets/chocolate-cake.jpg";
import rainbowCake from "@/assets/rainbow-cake.jpg";
import weddingCake from "@/assets/wedding-cake.jpg";
import heroCake from "@/assets/hero-cake.jpg";

const categories = [
  { name: "Birthday", image: heroCake, blurb: "Make their day unforgettable" },
  { name: "Wedding", image: weddingCake, blurb: "Elegant tiers for your big day" },
  { name: "Chocolate", image: chocolateCake, blurb: "Rich, decadent indulgence" },
  { name: "Kids & Fun", image: rainbowCake, blurb: "Colourful, playful treats" },
];

const CategorySection = () => {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Curated Collections"
          title="Shop by"
          accent="occasion."
          description="From birthdays to weddings, find the perfect cake for every moment worth celebrating."
        />

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, i) => (
            <Reveal key={category.name} delay={i * 100}>
              <Link
                to="/cakes"
                className="group relative block overflow-hidden rounded-[1.75rem] shadow-card transition-smooth hover:shadow-button"
              >
                <img
                  src={category.image}
                  alt={`${category.name} cakes`}
                  className="h-44 sm:h-56 lg:h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                {/* Index number, award-site style */}
                <span className="absolute top-4 left-4 font-display text-sm italic text-white/70">
                  0{i + 1}
                </span>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                  <h3 className="font-display text-lg sm:text-xl font-semibold">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-white/80 mb-2 hidden sm:block">
                    {category.blurb}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-white/90 transition-all group-hover:gap-2">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
