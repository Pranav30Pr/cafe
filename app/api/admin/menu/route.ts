import { NextRequest, NextResponse } from "next/server";
import { CAFE_CONFIG, MenuItem } from "@/config/cafe";

// In-memory runtime override store for edited menu items
let menuOverrides: MenuItem[] = [...CAFE_CONFIG.menuItems];

export async function GET() {
  return NextResponse.json({ items: menuOverrides });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, item, itemId, updates } = body;

    if (action === "update" && itemId && updates) {
      const idx = menuOverrides.findIndex((i) => i.id === itemId);
      if (idx !== -1) {
        menuOverrides[idx] = { ...menuOverrides[idx], ...updates };
        return NextResponse.json({ item: menuOverrides[idx] });
      }
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (action === "create" && item) {
      const newItem: MenuItem = {
        ...item,
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        isAvailable: item.isAvailable !== false,
      };
      menuOverrides.push(newItem);
      return NextResponse.json({ item: newItem }, { status: 201 });
    }

    if (action === "reset") {
      menuOverrides = [...CAFE_CONFIG.menuItems];
      return NextResponse.json({ items: menuOverrides });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to modify menu" }, { status: 500 });
  }
}
