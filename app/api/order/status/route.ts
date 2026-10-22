import { NextRequest, NextResponse } from "next/server";
import { updateServerOrderStatus } from "@/lib/serverStore";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { OrderStatus } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status are required" },
        { status: 400 }
      );
    }

    // 1. Update in local server store
    const updated = updateServerOrderStatus(orderId, status as OrderStatus);

    // 2. Update in Supabase if configured
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Order not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
