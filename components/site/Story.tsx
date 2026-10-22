import Image from "next/image";
import { Leaf, Heart, Compass, ShieldCheck } from "lucide-react";

export function Story() {
  return (
    <section id="story" className="py-16 sm:py-24 bg-[#F3EFE6]/70 border-y border-[#E6E1D5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Image with layered decorative element */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-square">
              <Image
                src="/images/brunch.jpg"
                alt="Artisanal sourdough brunch and superfood bowl at Meeva Greens"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
            {/* Quote badge overlay */}
            <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:right-6 bg-[#1B382B] text-white p-5 rounded-2xl shadow-xl max-w-xs border border-[#4E7A63]/30 hidden sm:block">
              <p className="text-xs italic text-[#8EBA9D] leading-relaxed">
                &ldquo;We created Meeva Greens to be a pause button for modern life—where good food and green spaces restore your rhythm.&rdquo;
              </p>
              <span className="block text-[11px] font-semibold text-white/90 mt-2">
                — Founders, Meeva Greens
              </span>
            </div>
          </div>

          {/* Right Column: Story Narrative */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E6E1D5] text-[#4E7A63] text-xs font-semibold tracking-wide">
              <Leaf className="w-3.5 h-3.5" />
              <span>Our Philosophy</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B382B] leading-tight">
              Rooted in mindful eating, slow brewing, and honest botanicals.
            </h2>

            <p className="text-sm sm:text-base text-[#55635B] leading-relaxed">
              Meeva Greens began with a simple belief: dining out shouldn’t feel rushed,
              mass-produced, or severed from nature. In the heart of Pimpri-Chinchwad, we built
              a garden sanctuary where specialty coffee is treated as an art form and our food
              is prepared from unadulterated, whole ingredients.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#E6E1D5] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#1B382B]/10 text-[#1B382B] flex items-center justify-center font-bold">
                  🌱
                </div>
                <h3 className="text-sm font-bold text-[#151E19]">Living Greenery</h3>
                <p className="text-xs text-[#55635B] leading-normal">
                  Over 40 botanical varieties purify our indoor air, creating an oasis of quiet focus and restoration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E6E1D5] space-y-2">
                <div className="w-8 h-8 rounded-lg bg-[#C4623F]/10 text-[#C4623F] flex items-center justify-center font-bold">
                  ☕
                </div>
                <h3 className="text-sm font-bold text-[#151E19]">Micro-Lot Coffees</h3>
                <p className="text-xs text-[#55635B] leading-normal">
                  Direct-trade beans roasted in small batches to preserve distinctive floral and chocolate notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
