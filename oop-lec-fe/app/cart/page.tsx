"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Trash2Icon } from "lucide-react";
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "../../lib/cart";
import { getProductDetail } from "../../lib/productDetail";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function formatPrice(price: CartItem["price"]) {
  if (typeof price === "number") return new Intl.NumberFormat("id-ID").format(price);
  const n = Number(price);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(price);
}

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<number, boolean>>({});
  const [productImages, setProductImages] = useState<Record<number, string | null>>({});

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setItems(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load cart";
      setError(msg);
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const uniqueProductIds = Array.from(new Set(items.map((it) => it.productId)));
      const missing = uniqueProductIds.filter((id) => !(id in productImages));
      if (missing.length === 0) return;

      const results = await Promise.all(
        missing.map(async (productId) => {
          try {
            const p = await getProductDetail(productId);
            return { productId, imagePath: p.imagePath ?? null };
          } catch {
            return { productId, imagePath: null };
          }
        })
      );

      if (cancelled) return;
      setProductImages((prev) => {
        const next = { ...prev };
        for (const r of results) {
          next[r.productId] = r.imagePath;
        }
        return next;
      });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [items, productImages]);

  function productImageSrc(productId: number): string {
    const path = productImages[productId];
    if (path) return path;
    return "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-04-featured-product-shot.jpg";
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const n = typeof it.subtotal === "number" ? it.subtotal : Number(it.subtotal);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [items]);

  async function onRemove(cartItemId: number) {
    setBusyId(cartItemId);
    setToast(null);
    try {
      await removeCartItem(cartItemId);
      await refresh();
      setToast("Removed from cart");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove");
    } finally {
      setBusyId(null);
    }
  }

  async function onUpdateQuantity(cartItemId: number, quantity: number) {
    setBusyId(cartItemId);
    setToast(null);
    try {
      await updateCartItemQuantity(cartItemId, quantity);
      await refresh();
      setToast("Cart updated");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to update quantity");
    } finally {
      setBusyId(null);
    }
  }

  async function onClear() {
    setClearing(true);
    setToast(null);
    try {
      await clearCart();
      await refresh();
      setToast("Cart cleared");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  }

  return (
    <section className="bg-muted min-h-screen py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>
            <p className="text-muted-foreground mt-2 text-sm">{items.length} Items in cart</p>
          </div>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Continue shopping
          </Link>
        </div>

        {toast ? (
          <div className="mb-6 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900">
            {toast}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : items.length === 0 ? (
          <div className="mt-8 text-sm text-gray-500">Your cart is empty.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-3 px-0 lg:col-span-2 lg:px-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 border-t pb-4 pt-7 max-sm:flex-col sm:items-center">
                  <div className="flex grow items-center gap-4">
                    <div className="size-25 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={productImageSrc(item.productId)}
                        alt={item.productName}
                        width={100}
                        height={100}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-medium text-gray-900">{item.productName}</h3>
                        <p className="text-muted-foreground text-sm">Price: Rp {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <Select
                      value={String(item.quantity)}
                      onValueChange={(value) => {
                        const next = Number(value);
                        if (Number.isFinite(next) && next > 0) {
                          onUpdateQuantity(item.id, next);
                        }
                      }}
                    >
                      <SelectTrigger className="w-24 shadow-none">
                        <SelectValue placeholder="Qty" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }).map((_, idx) => {
                          const val = String(idx + 1);
                          return (
                            <SelectItem key={val} value={val}>
                              {val}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <p className="text-sm font-semibold text-gray-900">Rp {formatPrice(item.subtotal)}</p>

                    <Popover
                      open={openPopovers[item.id] || false}
                      onOpenChange={(open) => setOpenPopovers((prev) => ({ ...prev, [item.id]: open }))}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={busyId === item.id}>
                          <Trash2Icon className="size-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="flex flex-col gap-3">
                          <p className="text-sm font-semibold">Remove this item?</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setOpenPopovers((prev) => ({ ...prev, [item.id]: false }))}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                setOpenPopovers((prev) => ({ ...prev, [item.id]: false }));
                                await onRemove(item.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <Card className="w-full max-w-md border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-xl">Apply Coupon</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setToast("Coupon is not implemented");
                    }}
                  >
                    <div className="flex grow gap-3 sm:justify-end">
                      <Input type="text" placeholder="Coupon Code" className="w-full max-w-xs" />
                      <Button className="rounded-lg shadow-sm" type="submit">
                        Apply
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="w-full max-w-md gap-8 border-0 shadow-none">
                <CardContent>
                  <div className="space-y-6">
                    <h5 className="text-xl font-semibold">Price Details</h5>
                    <div className="space-y-5">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">Rp {new Intl.NumberFormat("id-ID").format(total)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="font-medium">Rp {new Intl.NumberFormat("id-ID").format(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-3.5">
                  <Button asChild className="w-full" disabled={clearing}>
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                  <Button variant="secondary" className="w-full" disabled={clearing} onClick={onClear}>
                    {clearing ? "Clearing..." : "Clear cart"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
