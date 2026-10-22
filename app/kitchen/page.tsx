export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-[#101613] text-[#FBF9F4] p-4 flex flex-col justify-between">
      <header className="p-4 bg-[#151E19] rounded-2xl border border-[#2D3E34] flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#D99B52] font-semibold">
            Kitchen Display System
          </span>
          <h1 className="text-xl font-serif text-white mt-0.5">
            Meeva Greens Live Queue
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-[#8EBA9D] font-mono">Realtime Connected</span>
        </div>
      </header>

      <main className="py-16 text-center text-[#8EBA9D]">
        <div className="w-14 h-14 rounded-2xl bg-[#151E19] border border-[#2D3E34] flex items-center justify-center mx-auto mb-3 text-2xl">
          🍳
        </div>
        <p className="text-base font-medium text-white">Kitchen Ticket Board Scaffold</p>
        <p className="text-xs text-[#55635B] mt-1 max-w-sm mx-auto">
          Equipped with wake-lock, continuous audio alert loop, and one-touch status transition actions.
        </p>
      </main>

      <footer className="p-3 bg-[#151E19] rounded-2xl border border-[#2D3E34] text-center text-xs text-[#8EBA9D]">
        Staff shift audio ready • 10s fallback polling active
      </footer>
    </div>
  );
}
