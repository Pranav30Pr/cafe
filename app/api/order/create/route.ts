import { NextRequest, NextResponse } from "next/server";
import { createServerOrder } from "@/lib/serverStore";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderType, tableToken, customerName, customerPhone, notes, lineItems } = body;

    // Validation
    if (!orderType || !customerName || !customerPhone || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: "Invalid order parameters. Missing required fields." },
        { status: 400 }
      );
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "Cart cannot be empty." },
        { status: 400 }
      );
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Customer phone must be a valid 10-digit number." },
        { status: 400 }
      );
    }

    // 1. In-memory / Network real-time broadcast store
    const localOrder = createServerOrder({
      orderType,
      tableToken,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      notes,
      lineItems,
    });

    // 2. If Supabase is configured, persist to PostgreSQL
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        const { data: dbOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_type: localOrder.orderType,
            table_token: localOrder.tableToken,
            table_label: localOrder.tableLabel,
            pickup_token: localOrder.pickupToken,
            customer_name: localOrder.customerName,
            customer_phone: localOrder.customerPhone,
            notes: localOrder.notes,
            status: localOrder.status,
            subtotal: localOrder.subtotal,
            discount_amount: localOrder.discountAmount,
            taxable_amount: localOrder.taxableAmount,
            tax_amount: localOrder.taxAmount,
            total_amount: localOrder.totalAmount,
          })
          .select()
          .single();

        if (!orderError && dbOrder) {
          // Insert order items
          const dbItems = localOrder.items.map((item) => ({
            order_id: dbOrder.id,
            menu_item_id: item.menuItemId,
            item_name_snapshot: item.itemNameSnapshot,
            unit_price_snapshot: item.unitPriceSnapshot,
            quantity: item.quantity,
            selected_options: item.selectedOptions,
            item_total: item.itemTotal,
          }));

          await supabase.from("order_items").insert(dbItems);
          return NextResponse.json({ order: { ...localOrder, id: dbOrder.id } });
        }
      } catch (dbErr) {
        console.error("Supabase sync warning:", dbErr);
      }
    }

    return NextResponse.json({ order: localOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    if (error?.message?.startsWith("TABLE_BILLED")) {
      return NextResponse.json(
        { error: error.message.replace("TABLE_BILLED: ", "") },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
