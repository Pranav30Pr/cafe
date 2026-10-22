import Image from "next/image";
import { Camera, Sparkles } from "lucide-react";

export function AmbienceGallery() {
  const images = [
    {
      src: "/images/interior.jpg",
      title: "The Main Hall & Espresso Bar",
      subtitle: "Fluted oak, matte brass, and living greenery",
      colSpan: "sm:col-span-2 lg:col-span-2",
      aspect: "aspect-[16/10]",
    },
    {
      src: "/images/coffee.jpg",
      title: "Single-Estate Coffee Craft",
      subtitle: "Flat whites & botanical iced espresso tonics",
      colSpan: "sm:col-span-1 lg:col-span-1",
      aspect: "aspect-[4/3] sm:aspect-auto",
    },
    {
      src: "/images/brunch.jpg",
      title: "Nourishing Artisanal Brunch",
      subtitle: "Country sourdough toasts and superfood grain bowls",
      colSpan: "sm:col-span-1 lg:col-span-1",
      aspect: "aspect-[4/3] sm:aspect-auto",
    },
    {
      src: "/images/patio.jpg",
      title: "The Outdoor Garden Pergola",
      subtitle: "Al fresco relaxation under lush hanging ferns",
      colSpan: "sm:col-span-2 lg:col-span-2",
      aspect: "aspect-[16/10]",
    },
  ];

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-[#F3EFE6]/50 border-t border-[#E6E1D5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E6E1D5] text-[#4E7A63] text-xs font-semibold">
            <Camera className="w-3.5 h-3.5" />
            <span>The Ambiance</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1B382B]">
            A space conceived for quiet delight
          </h2>
          <p className="text-sm sm:text-base text-[#55635B]">
            Glimpses into our sunlit indoor sanctuary and tranquil outdoor pergola garden.
          </p>
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`group relative rounded-3xl overflow-hidden shadow-md border-2 border-white ${img.colSpan} ${img.aspect} min-h-[260px]`}
            >
              <Image
                src={img.src}
                alt={img.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] uppercase tracking-wider text-[#8EBA9D] font-semibold">
                  Meeva Moments
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
                  {img.title}
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  {img.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
