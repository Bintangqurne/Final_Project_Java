"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listOrders, type Order } from "../../lib/orders";

function formatPrice(price: string | number) {
  const n = typeof price === "number" ? price : Number(price);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(price);
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await listOrders();
        if (!cancelled) setOrders(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load orders";
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
  }, []);

  const hasOrders = useMemo(() => orders.length > 0, [orders.length]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order history</h1>
          <p className="mt-2 text-sm text-gray-500">Check the status of recent orders.</p>
        </div>

        {loading ? <div className="mt-8 text-sm text-gray-500">Loading...</div> : null}
        {error ? <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {!loading && !error && !hasOrders ? (
          <div className="mt-8 text-sm text-gray-500">No orders yet.</div>
        ) : null}

        <div className="mt-16">
          <h2 className="sr-only">Recent orders</h2>

          <div className="space-y-20">
            {orders.map((order) => (
              <div key={order.orderCode}>
                <h3 className="sr-only">Order {order.orderCode}</h3>

                <div className="rounded-lg bg-gray-50 px-4 py-6 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:px-6 lg:space-x-8">
                  <dl className="flex-auto divide-y divide-gray-200 text-sm text-gray-600 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-8">
                    <div className="max-sm:flex max-sm:justify-between max-sm:py-6 max-sm:first:pt-0 max-sm:last:pb-0">
                      <dt className="font-medium text-gray-900">Date placed</dt>
                      <dd className="sm:mt-1">
                        <time dateTime={order.createdAt ?? undefined}>{formatDate(order.createdAt)}</time>
                      </dd>
                    </div>
                    <div className="max-sm:flex max-sm:justify-between max-sm:py-6 max-sm:first:pt-0 max-sm:last:pb-0">
                      <dt className="font-medium text-gray-900">Order number</dt>
                      <dd className="sm:mt-1">{order.orderCode}</dd>
                    </div>
                    <div className="max-sm:flex max-sm:justify-between max-sm:py-6 max-sm:first:pt-0 max-sm:last:pb-0">
                      <dt className="font-medium text-gray-900">Total amount</dt>
                      <dd className="font-medium text-gray-900 sm:mt-1">Rp {formatPrice(order.totalAmount)}</dd>
                    </div>
                  </dl>

                  <Link
                    href={`/orders/${order.id}`}
                    className="mt-6 flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden sm:mt-0 sm:w-auto"
                  >
                    View Detail
                    <span className="sr-only">for order {order.orderCode}</span>
                  </Link>
                </div>

                <table className="mt-4 w-full text-gray-500 sm:mt-6">
                  <caption className="sr-only">Products</caption>
                  <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
                    <tr>
                      <th scope="col" className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3">
                        Product
                      </th>
                      <th scope="col" className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell">
                        Price
                      </th>
                      <th scope="col" className="hidden py-3 pr-8 font-normal sm:table-cell">
                        Status
                      </th>
                      <th scope="col" className="w-0 py-3 text-right font-normal">
                        Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
                    {order.items.map((it) => (
                      <tr key={`${order.id}-${it.productId}`}>
                        <td className="py-6 pr-8">
                          <div className="flex items-center">
                            <div className="relative mr-6 size-16 overflow-hidden rounded-sm bg-gray-100">
                              <Image
                                alt={it.productName}
                                src="https://tailwindui.com/plus-assets/img/ecommerce-images/order-history-page-02-product-01.jpg"
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{it.productName}</div>
                              <div className="mt-1 sm:hidden">Rp {formatPrice(it.price)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden py-6 pr-8 sm:table-cell">Rp {formatPrice(it.price)}</td>
                        <td className="hidden py-6 pr-8 sm:table-cell">{displayStatus(order.status)}</td>
                        <td className="py-6 text-right font-medium whitespace-nowrap">
                          <Link href={`/products/${it.productId}`} className="text-indigo-600">
                            View<span className="hidden lg:inline"> Product</span>
                            <span className="sr-only">, {it.productName}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
