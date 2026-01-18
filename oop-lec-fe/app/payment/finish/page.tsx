"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

export default function PaymentFinishPage() {
  const lastOrderId = typeof window !== "undefined" ? window.localStorage.getItem("lastOrderId") : null;
  const midtransOrderId =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("order_id") : null;
  const fallbackRedirectTarget = useMemo(() => {
    if (!lastOrderId) return null;
    const numeric = Number(lastOrderId);
    if (!Number.isFinite(numeric)) return null;
    return `/checkout/confirmation?orderId=${encodeURIComponent(String(numeric))}`;
  }, [lastOrderId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (midtransOrderId) {
        try {
          const resp = await fetch(`/api/orders/by-code/${encodeURIComponent(midtransOrderId)}`);
          const text = await resp.text();
          const data: unknown = text ? JSON.parse(text) : null;

          if (!cancelled && resp.ok && data && typeof data === "object" && "id" in data) {
            const idVal = (data as { id?: unknown }).id;
            const numericId = typeof idVal === "number" ? idVal : Number(idVal);
            if (Number.isFinite(numericId)) {
              window.location.href = `/checkout/confirmation?orderId=${encodeURIComponent(String(numericId))}`;
              return;
            }
          }
        } catch {
        }
      }

      if (!cancelled && fallbackRedirectTarget) {
        window.location.href = fallbackRedirectTarget;
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [midtransOrderId, fallbackRedirectTarget]);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payment</h1>
        <p className="mt-4 text-sm text-gray-500">
          {midtransOrderId || fallbackRedirectTarget
            ? "Finishing payment..."
            : "Order not found. Please open Order history."}
        </p>
        <div className="mt-8">
          <Link href="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Go to order history
          </Link>
        </div>
      </div>
    </div>
  );
}
