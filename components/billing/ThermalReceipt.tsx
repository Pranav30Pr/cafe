"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { Printer, Share2, Copy, Check, Download } from "lucide-react";
import { DatabaseBill } from "@/lib/supabase/types";
import { CAFE_CONFIG } from "@/config/cafe";

interface ThermalReceiptProps {
  bill: DatabaseBill;
  showControls?: boolean;
  onClose?: () => void;
}

export function ThermalReceipt({
  bill,
  showControls = true,
  onClose,
}: ThermalReceiptProps) {
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("80mm");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Generate QR code pointing to this digital receipt
  useEffect(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const receiptUrl = `${origin}/receipt/${bill.id || bill.invoiceNumber}`;

    QRCode.toDataURL(receiptUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Receipt QR generation error:", err));
  }, [bill.id, bill.invoiceNumber]);

  // Direct Browser Thermal Print
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp formatted text receipt
  const handleWhatsAppShare = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const receiptUrl = `${origin}/receipt/${bill.id || bill.invoiceNumber}`;

    let itemsText = "";
    bill.items.forEach((item) => {
      itemsText += `${item.quantity}x ${item.name} - ₹${item.itemTotal}\n`;
      if (item.optionsSummary && item.optionsSummary.length > 0) {
        itemsText += `   (${item.optionsSummary.join(", ")})\n`;
      }
    });

    const message = `🌿 *MEEVA GREENS*
*Botanical Cafe & Specialty Coffee*
Invoice: ${bill.invoiceNumber}
Date: ${new Date(bill.createdAt).toLocaleDateString()} ${new Date(bill.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
Station: ${bill.tableLabel || (bill.orderType === "dine_in" ? "Dine-In" : "Takeaway")}
Guest: ${bill.customerName} (+91 ${bill.customerPhone})
--------------------------------
${itemsText}--------------------------------
Subtotal: ₹${bill.subtotal}
${bill.discountAmount > 0 ? `Discount: -₹${bill.discountAmount}\n` : ""}Tax (0% GST): ₹${bill.taxAmount}
*GRAND TOTAL: ₹${bill.grandTotal}*
Status: ${bill.paymentStatus.toUpperCase()} (${(bill.paymentMode || "COUNTER").toUpperCase()})
--------------------------------
View Digital Copy: ${receiptUrl}
*Nourish. Brew. Gather.*`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = bill.customerPhone ? bill.customerPhone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone
      ? `https://wa.me/91${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, "_blank");
  };

  const handleCopyLink = () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const receiptUrl = `${origin}/receipt/${bill.id || bill.invoiceNumber}`;
    navigator.clipboard.writeText(receiptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Control Toolbar */}
      {showControls && (
        <div className="w-full max-w-md mb-4 bg-white p-3 rounded-2xl border border-[#E6E1D5] flex flex-wrap items-center justify-between gap-2 shadow-xs no-print">
          <div className="flex items-center gap-1.5 bg-[#F3EFE6] p-1 rounded-xl">
            <button
              onClick={() => setPaperWidth("58mm")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                paperWidth === "58mm"
                  ? "bg-white text-[#1B382B] shadow-xs"
                  : "text-[#55635B] hover:text-[#151E19]"
              }`}
            >
              58mm Roll
            </button>
            <button
              onClick={() => setPaperWidth("80mm")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                paperWidth === "80mm"
                  ? "bg-white text-[#1B382B] shadow-xs"
                  : "text-[#55635B] hover:text-[#151E19]"
              }`}
            >
              80mm Roll
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Send to Guest WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#1B382B] hover:bg-[#2A5743] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              title="Print to Thermal Printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-xl border border-[#E6E1D5] hover:bg-[#F3EFE6] text-[#55635B] transition-colors"
              title="Copy Digital Receipt URL"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-2 py-1 text-xs text-[#55635B] hover:text-black font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Card */}
      <div
        id="thermal-receipt-printable"
        ref={receiptRef}
        className={`bg-white text-black p-6 font-mono text-xs shadow-md border border-gray-200 transition-all ${
          paperWidth === "58mm" ? "w-[280px]" : "w-[360px]"
        }`}
        style={{
          fontFamily: "'Courier New', Courier, monospace",
          lineHeight: "1.4",
        }}
      >
        {/* Header */}
        <div className="text-center space-y-1 mb-3">
          <h2 className="text-base font-extrabold uppercase tracking-widest">
            {CAFE_CONFIG.identity.name}
          </h2>
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-700">
            Botanical Cafe & Specialty Coffee
          </p>
          <p className="text-[9px] text-gray-600 leading-tight">
            {CAFE_CONFIG.identity.address.street}, {CAFE_CONFIG.identity.address.city}
          </p>
          <p className="text-[9px] text-gray-600 font-bold">
            Phone: {CAFE_CONFIG.identity.phone}
          </p>
          <p className="text-[8px] text-gray-500 uppercase tracking-tight">
            FSSAI Lic: 21524068000412 • Unregistered
          </p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Invoice Meta */}
        <div className="space-y-0.5 text-[10px]">
          <div className="flex justify-between font-bold">
            <span>INVOICE:</span>
            <span>{bill.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>DATE:</span>
            <span>
              {new Date(bill.createdAt).toLocaleDateString()}{" "}
              {new Date(bill.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>STATION:</span>
            <span className="font-bold">
              {bill.tableLabel || (bill.orderType === "dine_in" ? "Dine-In" : "Takeaway")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>GUEST:</span>
            <span>{bill.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>PHONE:</span>
            <span>+91 {bill.customerPhone}</span>
          </div>
          {bill.settledBy && (
            <div className="flex justify-between text-gray-600">
              <span>CASHIER:</span>
              <span>{bill.settledBy}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Items Table */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between font-bold border-b border-gray-300 pb-1">
            <span className="w-1/2">ITEM</span>
            <span className="w-1/6 text-center">QTY</span>
            <span className="w-1/6 text-right">RATE</span>
            <span className="w-1/6 text-right">AMT</span>
          </div>

          {bill.items.map((item, idx) => (
            <div key={idx} className="py-0.5">
              <div className="flex justify-between">
                <span className="w-1/2 font-semibold truncate pr-1">
                  {item.name}
                </span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/6 text-right">₹{item.unitPrice}</span>
                <span className="w-1/6 text-right font-bold">
                  ₹{item.itemTotal}
                </span>
              </div>
              {item.optionsSummary && item.optionsSummary.length > 0 && (
                <div className="text-[9px] text-gray-600 italic pl-1">
                  +{item.optionsSummary.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2" />

        {/* Calculations Breakdown */}
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{bill.subtotal.toFixed(2)}</span>
          </div>

          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>
                Discount {bill.discountReason ? `(${bill.discountReason})` : ""}:
              </span>
              <span>-₹{bill.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-600 text-[9px]">
            <span>Taxable Value:</span>
            <span>₹{bill.taxableAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600 text-[9px]">
            <span>GST @ 0% (Decoupled Baseline):</span>
            <span>₹{bill.taxAmount.toFixed(2)}</span>
          </div>

          <div className="border-t border-double border-gray-500 my-1.5" />

          <div className="flex justify-between text-sm font-extrabold">
            <span>GRAND TOTAL:</span>
            <span>₹{bill.grandTotal}</span>
          </div>

          <div className="border-t border-double border-gray-500 my-1.5" />
        </div>

        {/* Payment Summary */}
        <div className="space-y-1 text-[10px] my-2">
          <div className="flex justify-between font-bold">
            <span>PAYMENT STATUS:</span>
            <span
              className={
                bill.paymentStatus === "paid"
                  ? "text-black"
                  : bill.paymentStatus === "void"
                  ? "text-red-600"
                  : "text-amber-700"
              }
            >
              {bill.paymentStatus.toUpperCase()}
            </span>
          </div>

          {bill.paymentMode && (
            <div className="flex justify-between">
              <span>PAYMENT MODE:</span>
              <span className="font-bold uppercase">{bill.paymentMode}</span>
            </div>
          )}

          {bill.splitBreakdown && (
            <div className="text-[9px] text-gray-700 space-y-0.5 pl-2 border-l border-gray-300">
              {bill.splitBreakdown.cash ? (
                <div>Cash: ₹{bill.splitBreakdown.cash}</div>
              ) : null}
              {bill.splitBreakdown.upi ? (
                <div>UPI: ₹{bill.splitBreakdown.upi}</div>
              ) : null}
              {bill.splitBreakdown.card ? (
                <div>Card: ₹{bill.splitBreakdown.card}</div>
              ) : null}
            </div>
          )}

          {bill.settledAt && (
            <div className="flex justify-between text-[9px] text-gray-600">
              <span>SETTLED AT:</span>
              <span>
                {new Date(bill.settledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* QR Code for Digital Copy */}
        {qrDataUrl && (
          <div className="mt-4 pt-2 border-t border-dashed border-gray-300 flex flex-col items-center text-center">
            <img
              src={qrDataUrl}
              alt="Digital Receipt QR"
              className="w-20 h-20 mb-1"
            />
            <span className="text-[8px] uppercase tracking-wider text-gray-600">
              Scan for Digital Copy & Rewards
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-dashed border-gray-400 text-center space-y-1">
          <p className="font-bold text-[9px] uppercase tracking-wider">
            Nourish. Brew. Gather.
          </p>
          <p className="text-[8px] text-gray-600">
            Thank you for gathering with us at Meeva Greens!
          </p>
          <p className="text-[8px] text-gray-500">
            Instagram: @meevagreens • Pune
          </p>
        </div>
      </div>
    </div>
  );
}
