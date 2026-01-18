"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: string | number;
  subtotal: string | number;
};

type Order = {
  id: number;
  orderCode: string;
  status: string;
  totalAmount: string | number;
  shippingAddress?: string | null;
  shippingPhone?: string | null;
  createdAt?: string;
  items: OrderItem[];
};

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function formatPrice(price: string | number) {
  const n = typeof price === "number" ? price : Number(price);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(price);
}

function displayStatus(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "PENDING_PAYMENT") return "Menunggu pembayaran";
  if (normalized === "PAID") return "Menunggu admin approval";
  if (normalized === "DELIVERING") return "Sedang dikirim oleh kurir";
  if (normalized === "DELIVERED") return "Sudah sampai (menunggu konfirmasi kamu)";
  if (normalized === "COMPLETED") return "Selesai";
  if (normalized === "REJECTED") return "Ditolak";
  if (normalized === "CANCELLED") return "Dibatalkan";
  return status ?? "-";
}

export default function CheckoutConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const orderIdFromQuery = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("orderId") : null;
  const orderIdFromStorage = typeof window !== "undefined" ? window.localStorage.getItem("lastOrderId") : null;

  const orderId = useMemo(() => {
    const raw = orderIdFromQuery || orderIdFromStorage;
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [orderIdFromQuery, orderIdFromStorage]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (!orderId) throw new Error("Order not found");
        const resp = await fetch(`/api/orders/${encodeURIComponent(String(orderId))}`);
        const text = await resp.text();
        const data: unknown = text ? JSON.parse(text) : null;
        if (!resp.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${resp.status})`);
        }
        if (!cancelled) setOrder(data as Order);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const total = useMemo(() => {
    if (!order) return 0;
    const n = typeof order.totalAmount === "number" ? order.totalAmount : Number(order.totalAmount);
    return Number.isFinite(n) ? n : 0;
  }, [order]);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Confirmation</h1>
            <p className="mt-2 text-sm text-gray-500">Status pemesanan akan diproses setelah admin menyetujui.</p>
          </div>
          <Link href="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Order history
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : !order ? null : (
          <div className="mt-10 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="text-lg font-semibold text-gray-900">{order.orderCode}</p>
                </div>
                <div className="text-sm text-gray-700">Status: <span className="font-semibold">{displayStatus(order.status)}</span></div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Shipping address</p>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{order.shippingAddress || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="mt-1 text-sm text-gray-600">{order.shippingPhone || "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
              <ul role="list" className="divide-y divide-gray-200">
                {order.items.map((it) => (
                  <li key={`${order.id}-${it.productId}`} className="flex items-center justify-between px-4 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{it.productName}</p>
                      <p className="mt-1 text-gray-500">Qty: {it.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">Rp {formatPrice(it.subtotal)}</p>
                      <p className="mt-1 text-gray-500">@ Rp {formatPrice(it.price)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-gray-900">Total</p>
                <p className="font-semibold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(total)}</p>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Continue shopping
                </Link>
                <Link
                  href={`/orders/${encodeURIComponent(String(order.id))}`}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  View order detail
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
