import { NextRequest, NextResponse } from "next/server";
import { settleBill } from "@/lib/serverStore";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, paymentMode, splitBreakdown, settledBy } = body;

    if (!billId || !paymentMode) {
      return NextResponse.json(
        { error: "Missing required fields: billId and paymentMode are mandatory" },
        { status: 400 }
      );
    }

    const settled = settleBill(
      billId,
      paymentMode,
      splitBreakdown,
      settledBy || "Counter Staff"
    );

    // If Supabase is available, sync settlement
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase
          .from("bills")
          .update({
            payment_status: "paid",
            payment_mode: settled.paymentMode,
            settled_at: settled.settledAt,
          })
          .eq("id", billId);
      } catch (dbErr) {
        console.warn("Supabase bill sync warning:", dbErr);
      }
    }

    return NextResponse.json({ bill: settled });
  } catch (error: any) {
    console.error("Billing settlement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to settle bill" },
      { status: 400 }
    );
  }
}
