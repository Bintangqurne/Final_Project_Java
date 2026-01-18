"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getOrder, type Order } from "../../../lib/orders";

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

export default function OrderDetailPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [confirming, setConfirming] = useState(false);
  const routeParams = useParams();
  const orderIdParam = (routeParams as { orderId?: string | string[] } | null)?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam;

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const parsedId = Number(orderId);
      if (!orderId || !Number.isFinite(parsedId)) {
        throw new Error("Invalid order id");
      }
      const data = await getOrder(parsedId);
      setOrder(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load order";
      setError(msg);
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        await refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load order";
        if (!cancelled) setError(msg);
        if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
          window.location.href = "/login";
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function onConfirmReceived() {
    setConfirming(true);
    setError(null);
    try {
      const parsedId = Number(orderId);
      if (!orderId || !Number.isFinite(parsedId)) {
        throw new Error("Invalid order id");
      }
      const res = await fetch(`/api/orders/${encodeURIComponent(String(parsedId))}/confirm-received`, {
        method: "POST",
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "message" in data
            ? String((data as { message?: unknown }).message)
            : `Request failed (${res.status})`;
        throw new Error(msg);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to confirm");
    } finally {
      setConfirming(false);
    }
  }

  const total = useMemo(() => {
    if (!order) return 0;
    const n = typeof order.totalAmount === "number" ? order.totalAmount : Number(order.totalAmount);
    return Number.isFinite(n) ? n : 0;
  }, [order]);

  const isPaid = (order?.status ?? "").toUpperCase() === "PAID";

  return (
    <>
      <main className="relative lg:min-h-full bg-white">
        <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
          <div className="relative size-full">
            <Image
              alt="Order"
              src="/logo.svg"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        </div>

        <div>
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
            <div className="lg:col-start-2">
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : error ? (
                <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : order ? (
                <>
                  <h1 className="text-sm font-medium text-indigo-600">
                    {isPaid ? "Payment successful" : "Order detail"}
                  </h1>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    {isPaid ? "Thanks for ordering" : `Order ${order.orderCode}`}
                  </p>
                  <p className="mt-2 text-base text-gray-500">
                    Status: <span className="font-medium text-gray-900">{displayStatus(order.status)}</span>
                  </p>

                  <dl className="mt-6 text-sm font-medium">
                    <dt className="text-gray-900">Shipping</dt>
                    <dd className="mt-2 text-gray-700 whitespace-pre-line">{order.shippingAddress ?? "-"}</dd>
                    <dt className="mt-4 text-gray-900">Phone</dt>
                    <dd className="mt-2 text-gray-700">{order.shippingPhone ?? "-"}</dd>

                    <dt className="mt-4 text-gray-900">Courier</dt>
                    <dd className="mt-2 text-gray-700">{order.courierPhone || order.courierPlate ? "" : "-"}</dd>
                    {order.courierPhone ? <dd className="mt-1 text-gray-700">Phone: {order.courierPhone}</dd> : null}
                    {order.courierPlate ? <dd className="mt-1 text-gray-700">Plate: {order.courierPlate}</dd> : null}
                  </dl>

                  <dl className="mt-16 text-sm font-medium">
                    <dt className="text-gray-900">Order code</dt>
                    <dd className="mt-2 text-indigo-600">{order.orderCode}</dd>
                  </dl>

                  <ul
                    role="list"
                    className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500"
                  >
                    {order.items.map((it) => (
                      <li key={`${order.id}-${it.productId}`} className="flex space-x-6 py-6">
                        <div className="relative size-24 flex-none overflow-hidden rounded-md bg-gray-100">
                          <Image
                            alt={it.productName}
                            src="https://tailwindui.com/plus-assets/img/ecommerce-images/confirmation-page-06-product-01.jpg"
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                        <div className="flex-auto space-y-1">
                          <h3 className="text-gray-900">
                            <Link href={`/products/${it.productId}`}>{it.productName}</Link>
                          </h3>
                          <p>Qty: {it.quantity}</p>
                        </div>
                        <p className="flex-none font-medium text-gray-900">Rp {formatPrice(it.subtotal)}</p>
                      </li>
                    ))}
                  </ul>

                  <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                      <dt className="text-base">Total</dt>
                      <dd className="text-base">Rp {new Intl.NumberFormat("id-ID").format(total)}</dd>
                    </div>
                  </dl>

                  <div className="mt-16 border-t border-gray-200 py-6 text-right">
                    {(order.status ?? "").toUpperCase() === "DELIVERED" ? (
                      <button
                        type="button"
                        disabled={confirming}
                        onClick={onConfirmReceived}
                        className="mr-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {confirming ? "Confirming..." : "Confirm Received"}
                      </button>
                    ) : null}
                    <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
