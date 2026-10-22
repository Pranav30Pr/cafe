import { NextRequest, NextResponse } from "next/server";
import {
  getServerBills,
  getServerBillById,
  getServerBillByInvoice,
  getServerBillByOrderId,
  createOrGetTableBill,
  createTakeawayBill,
  getActiveTableSession,
  getAllTableSessions,
} from "@/lib/serverStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const billId = searchParams.get("id");
    const invoice = searchParams.get("invoice");
    const tableToken = searchParams.get("tableToken");
    const orderId = searchParams.get("orderId");

    if (billId) {
      const bill = getServerBillById(billId);
      if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      return NextResponse.json({ bill });
    }

    if (invoice) {
      const bill = getServerBillByInvoice(invoice);
      if (!bill) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      return NextResponse.json({ bill });
    }

    if (tableToken) {
      const session = getActiveTableSession(tableToken);
      if (!session) {
        return NextResponse.json({ session: null, bill: null });
      }
      const bills = getServerBills();
      const bill = bills.find((b) => b.tableSessionId === session.id);
      return NextResponse.json({ session, bill: bill || null });
    }

    if (orderId) {
      const bill = getServerBillByOrderId(orderId);
      return NextResponse.json({ bill });
    }

    // Default: return all bills and sessions for admin
    return NextResponse.json({
      bills: getServerBills(),
      sessions: getAllTableSessions(),
    });
  } catch (error: any) {
    console.error("Billing GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve billing info" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableToken, orderId, discountAmount = 0, discountReason } = body;

    if (!tableToken && !orderId) {
      return NextResponse.json(
        { error: "Must provide either tableToken or orderId to generate bill" },
        { status: 400 }
      );
    }

    let bill;
    if (tableToken) {
      bill = createOrGetTableBill(tableToken, Number(discountAmount), discountReason);
    } else if (orderId) {
      bill = createTakeawayBill(orderId, Number(discountAmount), discountReason);
    }

    return NextResponse.json({ bill });
  } catch (error: any) {
    console.error("Billing POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bill" },
      { status: 400 }
    );
  }
}
