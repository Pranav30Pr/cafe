import { NextRequest, NextResponse } from "next/server";
import { voidBill } from "@/lib/serverStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, reason } = body;

    if (!billId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: billId and reason are mandatory to void an invoice" },
        { status: 400 }
      );
    }

    const voided = voidBill(billId, reason);
    return NextResponse.json({ bill: voided });
  } catch (error: any) {
    console.error("Billing void error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to void bill" },
      { status: 400 }
    );
  }
}
