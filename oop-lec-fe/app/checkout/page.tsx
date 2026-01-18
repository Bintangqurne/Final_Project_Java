"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCart, type CartItem } from "../../lib/cart";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Address = {
  id: number;
  label: string;
  recipientName?: string | null;
  addressLine: string;
  phone: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
 };

type CheckoutResponse = {
  orderId: number;
  orderCode: string;
  status: string;
  totalAmount: string | number;
  shippingAddress?: string | null;
  shippingPhone?: string | null;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: string | number;
    subtotal: string | number;
  }>;
};

type SnapCreateResponse = {
  paymentId: number;
  orderId: number;
  orderCode: string;
  snapToken: string;
  redirectUrl: string;
};

function formatPrice(price: string | number) {
  const n = typeof price === "number" ? price : Number(price);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(price);
}

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [paying, setPaying] = useState(false);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "manual" | null>(null);
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  function goNext() {
    setError(null);
    setStep((s) => (s === 2 ? 2 : ((s + 1) as 0 | 1 | 2)));
  }

  function goBack() {
    setError(null);
    setStep((s) => (s === 0 ? 0 : ((s - 1) as 0 | 1 | 2)));
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [cart, addrRes] = await Promise.all([
          getCart(),
          fetch("/api/addresses").catch(() => null),
        ]);

        if (!cancelled) setItems(cart);

        if (addrRes) {
          const addrText = await addrRes.text();
          const addrData: unknown = addrText ? JSON.parse(addrText) : null;
          if (!addrRes.ok) {
            const msg = extractMessage(addrData) ?? `Request failed (${addrRes.status})`;
            throw new Error(msg);
          }

          const list = Array.isArray(addrData) ? (addrData as Address[]) : [];
          if (!cancelled) {
            setAddresses(list);
            if (list.length > 0) {
              const def = list.find((a) => a.isDefault) ?? list[0];
              setSelectedAddressId(def.id);
            } else {
              setSelectedAddressId("manual");
            }
          }
        } else {
          if (!cancelled) {
            setAddresses([]);
            setSelectedAddressId("manual");
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load cart";
        if (!cancelled) setError(msg);
        if (
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("forbidden") ||
          msg.includes("401") ||
          msg.includes("403")
        ) {
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

  const selectedAddress = useMemo(() => {
    if (typeof selectedAddressId !== "number") return null;
    return addresses.find((a) => a.id === selectedAddressId) ?? null;
  }, [addresses, selectedAddressId]);

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const n = typeof it.subtotal === "number" ? it.subtotal : Number(it.subtotal);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [items]);

  async function onPay() {
    setPaying(true);
    setError(null);
    try {
      const useManual = selectedAddressId === "manual" || selectedAddressId == null || addresses.length === 0;

      const addressId = typeof selectedAddressId === "number" ? selectedAddressId : null;
      if (!useManual && addressId == null) {
        throw new Error("Pilih alamat pengiriman");
      }

      if (useManual) {
        if (!shippingAddress.trim()) {
          throw new Error("Alamat pengiriman wajib diisi");
        }
        if (!shippingPhone.trim()) {
          throw new Error("No HP wajib diisi");
        }
      }

      const checkoutRes = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(useManual
            ? { shippingAddress, shippingPhone }
            : {
                addressId,
              }),
        }),
      });
      const checkoutText = await checkoutRes.text();
      const checkoutData = checkoutText ? (JSON.parse(checkoutText) as unknown) : null;
      if (!checkoutRes.ok) {
        const msg =
          checkoutData && typeof checkoutData === "object" && "message" in checkoutData
            ? String((checkoutData as { message: unknown }).message)
            : `Request failed (${checkoutRes.status})`;
        throw new Error(msg);
      }

      const order = checkoutData as CheckoutResponse;

      try {
        window.localStorage.setItem("lastOrderId", String(order.orderId));
      } catch {
      }

      const snapRes = await fetch(`/api/payments/midtrans/snap/${order.orderId}`, { method: "POST" });
      const snapText = await snapRes.text();
      const snapData = snapText ? (JSON.parse(snapText) as unknown) : null;
      if (!snapRes.ok) {
        const msg =
          snapData && typeof snapData === "object" && "message" in snapData
            ? String((snapData as { message: unknown }).message)
            : `Request failed (${snapRes.status})`;
        throw new Error(msg);
      }

      const snap = snapData as SnapCreateResponse;
      window.location.href = snap.redirectUrl;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment failed";
      setError(msg);
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        window.location.href = "/login";
      }
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="bg-muted min-h-screen py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="border-none shadow-none">
          <CardContent>
            <div className="flex items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Checkout</h1>
                <p className="mt-2 text-sm text-gray-500">Cart → Address → Payment</p>
              </div>
              <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Continue shopping
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className={`rounded-full px-3 py-1 ${step === 0 ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border"}`}>Cart</span>
              <span className={`rounded-full px-3 py-1 ${step === 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border"}`}>Address</span>
              <span className={`rounded-full px-3 py-1 ${step === 2 ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border"}`}>Payment</span>
            </div>

            <Separator className="my-6" />

            {error ? (
              <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            {loading ? (
              <div className="mt-8 text-sm text-gray-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="mt-8 text-sm text-gray-500">
                Cart is empty. {" "}
                <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                  Go back
                </Link>
              </div>
            ) : step === 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-lg border border-gray-200 bg-white">
                    <ul role="list" className="divide-y divide-gray-200">
                      {items.map((it) => (
                        <li key={it.id} className="flex items-center justify-between px-4 py-4 text-sm">
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
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray-900">Total</p>
                    <p className="font-semibold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(total)}</p>
                  </div>
                  <Button className="mt-4 w-full" onClick={goNext}>
                    Next
                  </Button>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pilih alamat tersimpan</label>
                      {addresses.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-500">
                          Kamu belum punya alamat tersimpan. Tambah di halaman <Link href="/profile" className="text-indigo-600 hover:text-indigo-500">Profile</Link>.
                        </p>
                      ) : (
                        <div className="mt-2 space-y-3">
                          {addresses.map((a) => (
                            <label
                              key={a.id}
                              className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50"
                            >
                              <input
                                type="radio"
                                name="shippingAddressMode"
                                checked={selectedAddressId === a.id}
                                onChange={() => setSelectedAddressId(a.id)}
                                className="mt-1"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                                  {a.isDefault ? (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                                      Default
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{a.addressLine}</p>
                                <p className="mt-1 text-xs text-gray-500">Phone: {a.phone}</p>
                              </div>
                            </label>
                          ))}

                          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
                            <input
                              type="radio"
                              name="shippingAddressMode"
                              checked={selectedAddressId === "manual"}
                              onChange={() => setSelectedAddressId("manual")}
                            />
                            <span className="text-sm font-medium text-gray-900">Isi manual</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {selectedAddressId == null || selectedAddressId === "manual" || addresses.length === 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">No HP</label>
                          <Input
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Alamat pengiriman</label>
                          <textarea
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Tulis alamat lengkap..."
                            className="mt-1 min-h-32 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ) : selectedAddress ? (
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-medium text-gray-900">Deliver to</p>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{selectedAddress.addressLine}</p>
                        <p className="mt-2 text-sm text-gray-700">Phone: {selectedAddress.phone}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray-900">Total</p>
                    <p className="font-semibold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(total)}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={goBack}>
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        const useManual = selectedAddressId === "manual" || selectedAddressId == null || addresses.length === 0;
                        if (useManual) {
                          if (!shippingAddress.trim()) {
                            setError("Alamat pengiriman wajib diisi");
                            return;
                          }
                          if (!shippingPhone.trim()) {
                            setError("No HP wajib diisi");
                            return;
                          }
                        }
                        goNext();
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-900">Deliver to</p>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                    {selectedAddress ? selectedAddress.addressLine : shippingAddress || "-"}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">Phone: {selectedAddress ? selectedAddress.phone : shippingPhone || "-"}</p>

                  <Separator className="my-4" />
                  <p className="text-sm font-medium text-gray-900">Items</p>
                  <ul role="list" className="mt-2 divide-y divide-gray-200">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center justify-between py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{it.productName}</p>
                          <p className="text-gray-500">Qty: {it.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">Rp {formatPrice(it.subtotal)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-gray-900">Total</p>
                    <p className="font-semibold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(total)}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={goBack} disabled={paying}>
                      Back
                    </Button>
                    <Button onClick={onPay} disabled={paying}>
                      {paying ? "Redirecting..." : "Pay with Midtrans"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
