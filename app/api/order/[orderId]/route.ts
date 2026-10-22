import { NextRequest, NextResponse } from "next/server";
import { getServerOrderById } from "@/lib/serverStore";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { orderId } = await params;

  // 1. Try local server store first
  const localOrder = getServerOrderById(orderId);
  if (localOrder) {
    return NextResponse.json({ order: localOrder });
  }

  // 2. Try Supabase if configured
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data: dbOrder } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (dbOrder) {
      return NextResponse.json({ order: dbOrder });
    }
  }

  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}
