export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] p-4 flex flex-col justify-between">
      <header className="p-4 bg-white rounded-2xl border border-[#E6E1D5] shadow-sm">
        <span className="text-xs uppercase tracking-wider text-[#1B382B] font-semibold">
          Manager Portal
        </span>
        <h1 className="text-xl font-serif text-[#1B382B] mt-1">
          Meeva Greens Administration
        </h1>
        <p className="text-xs text-[#55635B] mt-0.5">
          Floor tables, live sessions, menu management & billing reconciliation
        </p>
      </header>

      <main className="py-16 text-center text-[#55635B]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E6E1D5] flex items-center justify-center mx-auto mb-3 text-2xl text-[#1B382B]">
          📊
        </div>
        <p className="text-base font-medium text-[#151E19]">Operations Dashboard Scaffold</p>
        <p className="text-xs mt-1 max-w-sm mx-auto">
          Phase 5 & 6 milestone: QR sheet generator, live bill closer, and menu 86 toggle.
        </p>
      </main>

      <footer className="p-4 bg-white rounded-2xl border border-[#E6E1D5] text-center text-xs text-[#55635B] pb-safe">
        Meeva Greens Operations Engine
      </footer>
    </div>
  );
}
