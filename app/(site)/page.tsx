import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Story } from "@/components/site/Story";
import { MenuHighlights } from "@/components/site/MenuHighlights";
import { AmbienceGallery } from "@/components/site/AmbienceGallery";
import { LocationHours } from "@/components/site/LocationHours";
import { Footer } from "@/components/site/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#151E19] flex flex-col selection:bg-[#8EBA9D] selection:text-[#1B382B]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Story />
        <MenuHighlights />
        <AmbienceGallery />
        <LocationHours />
      </main>
      <Footer />
    </div>
  );
}
