export default function TakeawayOrderPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] p-4 flex flex-col justify-between">
      <header className="p-4 bg-white rounded-2xl border border-[#E6E1D5] shadow-sm">
        <span className="text-xs uppercase tracking-wider text-[#C4623F] font-semibold">
          Self-Pickup
        </span>
        <h1 className="text-xl font-serif text-[#1B382B] mt-1">
          Takeaway Order
        </h1>
        <p className="text-xs text-[#55635B] mt-0.5">
          Order ahead for pickup at Meeva Greens counter
        </p>
      </header>

      <main className="py-12 text-center text-[#55635B]">
        <div className="w-12 h-12 rounded-full bg-[#F3EFE6] border border-[#E6E1D5] flex items-center justify-center mx-auto mb-3 text-[#C4623F] text-lg font-bold">
          🥡
        </div>
        <p className="text-sm font-medium text-[#151E19]">Takeaway App Shell Scaffold</p>
        <p className="text-xs mt-1">Requires customer name and phone verification upon checkout.</p>
      </main>

      <footer className="p-4 bg-white rounded-2xl border border-[#E6E1D5] text-center text-xs text-[#55635B] pb-safe">
        Collect and pay at the cafe counter
      </footer>
    </div>
  );
}
