import { NextResponse } from "next/server";
import { getServerOrders } from "@/lib/serverStore";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const localOrders = getServerOrders();

  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data: dbOrders } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (dbOrders && dbOrders.length > 0) {
      return NextResponse.json({ orders: dbOrders });
    }
  }

  return NextResponse.json({ orders: localOrders });
}
