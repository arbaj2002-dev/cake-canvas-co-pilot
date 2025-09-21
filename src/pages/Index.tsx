import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedCakes from "@/pages/FeaturedCakes";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main>
        <HeroSection />
        <FeaturedCakes />
      </main>
    </div>
  );
};

export default Index;
