import Header from "@/components/Header";
import PromoBannerCarousel from "@/components/home/PromoBannerCarousel";
import QuickCategories from "@/components/home/QuickCategories";
import BestsellersSection from "@/components/home/BestsellersSection";
import CustomCakeSection from "@/components/home/CustomCakeSection";
import TrustStrip from "@/components/home/TrustStrip";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FinalCTASection from "@/components/home/FinalCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />
      <main className="flex-1">
        <PromoBannerCarousel />
        <QuickCategories />
        <BestsellersSection />
        <TrustStrip />
        <CustomCakeSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
