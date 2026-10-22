"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Banknote,
  QrCode,
  CreditCard,
  Split,
  Receipt,
  Percent,
  AlertCircle,
  CheckCircle2,
  Printer,
  Share2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { DatabaseBill, PaymentMode } from "@/lib/supabase/types";
import { ThermalReceipt } from "./ThermalReceipt";

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableToken?: string;
  orderId?: string;
  tableLabel?: string;
  onSettled?: (bill: DatabaseBill) => void;
}

export function SettlementModal({
  isOpen,
  onClose,
  tableToken,
  orderId,
  tableLabel,
  onSettled,
}: SettlementModalProps) {
  const [bill, setBill] = useState<DatabaseBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settlement Form State
  const [selectedMode, setSelectedMode] = useState<PaymentMode>("cash");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>("");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [splitCash, setSplitCash] = useState<string>("");
  const [splitUpi, setSplitUpi] = useState<string>("");
  const [splitCard, setSplitCard] = useState<string>("");
  const [isSettling, setIsSettling] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState<string>("");
  const [isVoiding, setIsVoiding] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  // Fetch or generate initial bill
  const fetchBill = async (discount: number = 0, reason: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableToken,
          orderId,
          discountAmount: discount,
          discountReason: reason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate bill");
      }

      const data = await res.json();
      setBill(data.bill);

      // Pre-fill cash tendered with exact amount if empty
      if (!cashTendered) {
        setCashTendered(String(data.bill.grandTotal));
      }

      // Generate UPI dynamic QR
      const upiUri = `upi://pay?pa=meevagreens@okhdfcbank&pn=Meeva%20Greens&am=${data.bill.grandTotal}&cu=INR&tn=${data.bill.invoiceNumber}`;
      QRCode.toDataURL(upiUri, { width: 160, margin: 1 })
        .then((url) => setUpiQrUrl(url))
        .catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed to load billing details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDiscountAmount(0);
      setDiscountReason("");
      fetchBill(0, "");
    } else {
      setBill(null);
    }
  }, [isOpen, tableToken, orderId]);

  // Recalculate bill with discount
  const handleApplyDiscount = (amount: number, reason: string) => {
    setDiscountAmount(amount);
    setDiscountReason(reason);
    fetchBill(amount, reason);
  };

  const handleApplyPercentDiscount = (percent: number) => {
    if (!bill) return;
    const calculated = Math.round((bill.subtotal * percent) / 100);
    handleApplyDiscount(calculated, `${percent}% Courtesy`);
  };

  // Perform Settlement
  const handleSettle = async (autoPrint: boolean = false) => {
    if (!bill) return;
    setIsSettling(true);
    setError(null);

    let splitBreakdown: { cash?: number; upi?: number; card?: number } | undefined;

    if (selectedMode === "split") {
      const cash = Number(splitCash) || 0;
      const upi = Number(splitUpi) || 0;
      const card = Number(splitCard) || 0;
      const totalSplit = cash + upi + card;

      if (Math.round(totalSplit) !== Math.round(bill.grandTotal)) {
        setError(
          `Split amounts (₹${totalSplit}) must equal grand total (₹${bill.grandTotal})`
        );
        setIsSettling(false);
        return;
      }

      splitBreakdown = { cash, upi, card };
    }

    try {
      const res = await fetch("/api/billing/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: bill.id,
          paymentMode: selectedMode,
          splitBreakdown,
          settledBy: "Floor Admin",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Settlement failed");
      }

      const data = await res.json();
      setBill(data.bill);
      if (onSettled) onSettled(data.bill);

      if (autoPrint) {
        setTimeout(() => window.print(), 300);
      }
    } catch (err: any) {
      setError(err.message || "Failed to settle bill");
    } finally {
      setIsSettling(false);
    }
  };

  // Void Invoice
  const handleVoid = async () => {
    if (!bill || !voidReason) return;
    try {
      const res = await fetch("/api/billing/void", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId: bill.id, reason: voidReason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Void failed");
      }
      const data = await res.json();
      setBill(data.bill);
      setIsVoiding(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  // Change calculation
  const tenderedNum = Number(cashTendered) || 0;
  const changeDue = bill ? Math.max(0, tenderedNum - bill.grandTotal) : 0;

  // Split calculations
  const splitTotal =
    (Number(splitCash) || 0) + (Number(splitUpi) || 0) + (Number(splitCard) || 0);
  const splitRemaining = bill ? bill.grandTotal - splitTotal : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FBF9F4] rounded-3xl border border-[#E6E1D5] max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-auto text-[#151E19]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E7A63] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Counter Billing & Settlement
              </span>
              {bill && (
                <span className="font-mono text-xs font-bold text-[#1B382B]">
                  {bill.invoiceNumber}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1B382B] mt-1">
              {tableLabel || (tableToken ? `Table ${tableToken}` : "Takeaway Order")}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F3EFE6] text-[#55635B] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-[#1B382B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#55635B]">
              Consolidating session orders & calculating server totals...
            </p>
          </div>
        ) : !bill ? (
          <div className="py-12 text-center text-[#55635B] text-xs">
            No active orders to bill.
          </div>
        ) : bill.paymentStatus === "paid" ? (
          /* SETTLED / RECEIPT VIEW */
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-serif font-bold text-sm">
                    Bill Settled & Table Freed
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Paid via {(bill.paymentMode || "counter").toUpperCase()} at{" "}
                    {new Date(bill.settledAt || "").toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <span className="font-mono font-bold text-lg text-emerald-900">
                ₹{bill.grandTotal}
              </span>
            </div>

            {/* Embedded Printable Thermal Receipt */}
            <div className="max-h-[50vh] overflow-y-auto p-4 bg-white/80 rounded-2xl border border-[#E6E1D5]">
              <ThermalReceipt bill={bill} showControls={true} />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#1B382B] text-white text-xs font-bold hover:bg-[#2A5743] transition-colors"
              >
                Done / Close Session
              </button>
            </div>
          </div>
        ) : (
          /* BILLING CALCULATION & PAYMENT INTERFACE */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Consolidated Items & Fiscal Calculation */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E6E1D5] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-2">
                  <span className="text-xs font-bold text-[#1B382B]">
                    Consolidated Order Items
                  </span>
                  <span className="text-[11px] text-[#55635B]">
                    {bill.customerName} (+91 {bill.customerPhone})
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-[#F3EFE6] pr-1 space-y-1">
                  {bill.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 flex items-center justify-between text-xs"
                    >
                      <div className="max-w-[70%]">
                        <p className="font-medium text-[#151E19] truncate">
                          <span className="font-bold text-[#1B382B] mr-1.5">
                            {item.quantity}×
                          </span>
                          {item.name}
                        </p>
                        {item.optionsSummary && item.optionsSummary.length > 0 && (
                          <p className="text-[10px] text-[#55635B] truncate">
                            +{item.optionsSummary.join(", ")}
                          </p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#1B382B]">
                        ₹{item.itemTotal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Section */}
              <div className="bg-white rounded-2xl border border-[#E6E1D5] p-4 space-y-2.5">
                <span className="text-xs font-bold text-[#1B382B] block">
                  Discretionary Discount (Pre-Tax)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPercentDiscount(5)}
                    className="px-2.5 py-1 rounded-lg border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-medium"
                  >
                    5% Off
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPercentDiscount(10)}
                    className="px-2.5 py-1 rounded-lg border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-medium"
                  >
                    10% Off
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscount(50, "₹50 Promo")}
                    className="px-2.5 py-1 rounded-lg border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-medium"
                  >
                    ₹50 Off
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDiscount(100, "₹100 Promo")}
                    className="px-2.5 py-1 rounded-lg border border-[#E6E1D5] hover:bg-[#F3EFE6] text-xs font-medium"
                  >
                    ₹100 Off
                  </button>
                  {discountAmount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleApplyDiscount(0, "")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-[#F3EFE6] rounded-2xl p-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#55635B]">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">
                    ₹{bill.subtotal.toFixed(2)}
                  </span>
                </div>

                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>
                      Discount {bill.discountReason ? `(${bill.discountReason})` : ""}
                    </span>
                    <span className="font-mono">
                      -₹{bill.discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#55635B] text-[11px]">
                  <span>Taxable Value</span>
                  <span className="font-mono">
                    ₹{bill.taxableAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-[#55635B] text-[11px]">
                  <span>GST @ 0% (Decoupled Baseline)</span>
                  <span className="font-mono">
                    ₹{bill.taxAmount.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E6E1D5] flex justify-between items-baseline font-bold">
                  <span className="text-sm text-[#1B382B]">Grand Total</span>
                  <span className="font-serif text-2xl text-[#1B382B]">
                    ₹{bill.grandTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Counter Payment Recording */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#55635B] block">
                Select Settlement Mode
              </span>

              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMode("cash")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMode === "cash"
                      ? "bg-[#1B382B] text-white border-[#1B382B] shadow-sm"
                      : "bg-white text-[#55635B] border-[#E6E1D5] hover:bg-[#F3EFE6]"
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-bold">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("upi")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMode === "upi"
                      ? "bg-[#1B382B] text-white border-[#1B382B] shadow-sm"
                      : "bg-white text-[#55635B] border-[#E6E1D5] hover:bg-[#F3EFE6]"
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-bold">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("card")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMode === "card"
                      ? "bg-[#1B382B] text-white border-[#1B382B] shadow-sm"
                      : "bg-white text-[#55635B] border-[#E6E1D5] hover:bg-[#F3EFE6]"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("split")}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMode === "split"
                      ? "bg-[#1B382B] text-white border-[#1B382B] shadow-sm"
                      : "bg-white text-[#55635B] border-[#E6E1D5] hover:bg-[#F3EFE6]"
                  }`}
                >
                  <Split className="w-5 h-5" />
                  <span className="text-xs font-bold">Split</span>
                </button>
              </div>

              {/* Mode Specific Controls */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6E1D5] min-h-[170px] flex flex-col justify-center">
                {selectedMode === "cash" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-[#151E19] block">
                      Cash Tendered
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-[#55635B]">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#E6E1D5] text-lg font-mono font-bold text-[#1B382B] focus:outline-none focus:ring-2 focus:ring-[#1B382B]"
                        placeholder={String(bill.grandTotal)}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#55635B] font-medium">Change Due:</span>
                      <span
                        className={`font-mono text-base font-bold ${
                          changeDue > 0 ? "text-emerald-700" : "text-[#151E19]"
                        }`}
                      >
                        ₹{changeDue}
                      </span>
                    </div>
                  </div>
                )}

                {selectedMode === "upi" && (
                  <div className="flex items-center gap-4">
                    {upiQrUrl && (
                      <img
                        src={upiQrUrl}
                        alt="UPI QR"
                        className="w-24 h-24 border border-gray-200 rounded-xl p-1"
                      />
                    )}
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-[#1B382B] block">
                        Scan to Pay ₹{bill.grandTotal}
                      </span>
                      <p className="text-[11px] font-mono text-[#55635B]">
                        meevagreens@okhdfcbank
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium">
                        Instant soundbox / app verification
                      </p>
                    </div>
                  </div>
                )}

                {selectedMode === "card" && (
                  <div className="text-center space-y-2">
                    <CreditCard className="w-8 h-8 text-[#1B382B] mx-auto" />
                    <p className="text-xs font-bold text-[#1B382B]">
                      Swipe or Tap on POS Terminal
                    </p>
                    <p className="text-[11px] text-[#55635B]">
                      Collect ₹{bill.grandTotal} via debit/credit card
                    </p>
                  </div>
                )}

                {selectedMode === "split" && (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-[#55635B] font-semibold block">
                          Cash
                        </span>
                        <input
                          type="number"
                          value={splitCash}
                          onChange={(e) => setSplitCash(e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 rounded-lg border border-[#E6E1D5] font-mono text-xs font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-[#55635B] font-semibold block">
                          UPI
                        </span>
                        <input
                          type="number"
                          value={splitUpi}
                          onChange={(e) => setSplitUpi(e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 rounded-lg border border-[#E6E1D5] font-mono text-xs font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-[#55635B] font-semibold block">
                          Card
                        </span>
                        <input
                          type="number"
                          value={splitCard}
                          onChange={(e) => setSplitCard(e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 rounded-lg border border-[#E6E1D5] font-mono text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between font-mono text-[11px]">
                      <span>Remaining:</span>
                      <span
                        className={`font-bold ${
                          splitRemaining === 0
                            ? "text-emerald-700"
                            : splitRemaining > 0
                            ? "text-amber-700"
                            : "text-red-600"
                        }`}
                      >
                        {splitRemaining === 0 ? "✓ Balanced" : `₹${splitRemaining}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Settlement Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSettle(true)}
                  disabled={isSettling}
                  className="w-full py-3 rounded-2xl bg-[#1B382B] hover:bg-[#2A5743] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Settle & Print Thermal Receipt</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSettle(false)}
                    disabled={isSettling}
                    className="flex-1 py-2.5 rounded-xl border border-[#1B382B] text-[#1B382B] hover:bg-[#F3EFE6] font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    Settle Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVoiding(!isVoiding)}
                    className="px-3 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Void</span>
                  </button>
                </div>

                {isVoiding && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2 text-xs">
                    <span className="font-bold text-red-800 block">
                      Void Invoice #{bill.invoiceNumber}
                    </span>
                    <input
                      type="text"
                      placeholder="Reason for voiding (e.g. guest left / double entered)"
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-red-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleVoid}
                      disabled={!voidReason}
                      className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold disabled:opacity-50"
                    >
                      Confirm Void
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
