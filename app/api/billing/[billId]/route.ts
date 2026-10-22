import { NextRequest, NextResponse } from "next/server";
import { getServerBillById, getServerBillByInvoice } from "@/lib/serverStore";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ billId: string }> }
) {
  try {
    const { billId } = await context.params;
    let bill = getServerBillById(billId);
    if (!bill) {
      bill = getServerBillByInvoice(billId);
    }

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ bill });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve bill" },
      { status: 500 }
    );
  }
}
