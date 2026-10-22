export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { orderId } = await params;

  return (
    <div className="min-h-screen bg-[#FBF9F4] p-4 flex flex-col justify-between">
      <header className="p-4 bg-white rounded-2xl border border-[#E6E1D5] shadow-sm">
        <span className="text-xs uppercase tracking-wider text-[#4E7A63] font-semibold">
          Order Tracker
        </span>
        <h1 className="text-xl font-serif text-[#1B382B] mt-1">
          Live Order Status
        </h1>
        <p className="text-xs text-[#55635B] mt-0.5">
          Order ID: <code className="bg-[#F3EFE6] px-1.5 py-0.5 rounded font-mono text-[11px]">{orderId}</code>
        </p>
      </header>

      <main className="py-12 text-center text-[#55635B]">
        <div className="w-12 h-12 rounded-full bg-[#8EBA9D]/20 border border-[#8EBA9D] flex items-center justify-center mx-auto mb-3 text-[#1B382B] text-lg font-bold">
          ⏱️
        </div>
        <p className="text-sm font-medium text-[#151E19]">Real-time Status Scaffold</p>
        <p className="text-xs mt-1">Lifecycle: Placed &rarr; Accepted &rarr; Preparing &rarr; Ready &rarr; Served</p>
      </main>

      <footer className="p-4 bg-white rounded-2xl border border-[#E6E1D5] text-center text-xs text-[#55635B] pb-safe">
        Status refreshes automatically in real time
      </footer>
    </div>
  );
}
