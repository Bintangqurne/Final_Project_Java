"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { clearCart, getCart, removeCartItem, updateCartItemQuantity, type CartItem } from "@/lib/cart";
import { getProductDetail, type ProductDetail } from "@/lib/productDetail";

type Props = {
  open: boolean;
  onClose: (open: boolean) => void;
};

function formatPrice(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(value);
}

function productImageSrc(imagePath?: string | null) {
  if (imagePath) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";
    return `${base}${imagePath}`;
  }

  return "https://tailwindui.com/plus-assets/img/ecommerce-images/shopping-cart-page-04-product-03.jpg";
}

export default function CartModal({ open, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [productsById, setProductsById] = useState<Record<number, ProductDetail>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      setItems(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;

    const missingProductIds = Array.from(new Set(items.map((i) => i.productId))).filter(
      (id) => productsById[id] === undefined
    );

    if (missingProductIds.length === 0) return;

    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        missingProductIds.map(async (id) => {
          try {
            const detail = await getProductDetail(id);
            return [id, detail] as const;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      setProductsById((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (!r) continue;
          const [id, detail] = r;
          next[id] = detail;
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [open, items, productsById]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const n = typeof item.subtotal === "number" ? item.subtotal : Number(item.subtotal);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
  }, [items]);

  const hasItems = items.length > 0;

  async function onRemove(cartItemId: number) {
    setMutatingId(cartItemId);
    setError(null);
    try {
      await removeCartItem(cartItemId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove item");
    } finally {
      setMutatingId(null);
    }
  }

  async function onQuantityChange(cartItemId: number, nextQuantity: number) {
    if (nextQuantity <= 0) return;
    setMutatingId(cartItemId);
    setError(null);
    try {
      await updateCartItemQuantity(cartItemId, nextQuantity);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update quantity");
    } finally {
      setMutatingId(null);
    }
  }

  async function onClear() {
    setClearing(true);
    setError(null);
    try {
      await clearCart();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  }

  function onContinueToPayment() {
    onClose(false);
    router.push("/checkout");
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="hidden data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:fixed sm:inset-0 sm:block sm:bg-gray-500/75 sm:transition-opacity"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-stretch justify-center text-center sm:items-center sm:px-6 lg:px-8">
          <DialogPanel
            transition
            className="flex w-full max-w-3xl transform text-left text-base transition data-closed:scale-105 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8"
          >
            <div className="relative flex w-full flex-col overflow-hidden bg-white pt-6 pb-8 sm:rounded-lg sm:pb-6 lg:py-8">
              <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
                <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {error ? (
                <div className="mt-4 px-4 sm:px-6 lg:px-8">
                  <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                </div>
              ) : null}

              <section aria-labelledby="cart-heading">
                <h2 id="cart-heading" className="sr-only">
                  Items in your shopping cart
                </h2>

                {loading ? (
                  <div className="px-4 pt-6 text-sm text-gray-500 sm:px-6 lg:px-8">Loading...</div>
                ) : !hasItems ? (
                  <div className="px-4 pt-6 text-sm text-gray-500 sm:px-6 lg:px-8">Your cart is empty.</div>
                ) : (
                  <ul role="list" className="divide-y divide-gray-200 px-4 sm:px-6 lg:px-8">
                    {items.map((item, idx) => (
                      <li key={item.id} className="flex py-8 text-sm sm:items-center">
                        <img
                          alt={productsById[item.productId]?.name ?? item.productName}
                          src={productImageSrc(productsById[item.productId]?.imagePath)}
                          className="size-24 flex-none rounded-lg border border-gray-200 sm:size-32"
                        />
                        <div className="ml-4 grid flex-auto grid-cols-1 grid-rows-1 items-start gap-x-5 gap-y-3 sm:ml-6 sm:flex sm:items-center sm:gap-0">
                          <div className="row-end-1 flex-auto sm:pr-6">
                            <h3 className="font-medium text-gray-900">
                              <Link href={`/products/${item.productId}`} onClick={() => onClose(false)} className="hover:underline">
                                {productsById[item.productId]?.name ?? item.productName}
                              </Link>
                            </h3>
                            <p className="mt-1 text-gray-500">Rp {formatPrice(item.price)}</p>
                          </div>

                          <p className="row-span-2 row-end-2 font-medium text-gray-900 sm:order-1 sm:ml-6 sm:w-1/3 sm:flex-none sm:text-right">
                            Rp {formatPrice(item.subtotal)}
                          </p>

                          <div className="flex items-center sm:block sm:flex-none sm:text-center">
                            <div className="inline-grid w-full max-w-16 grid-cols-1">
                              <select
                                name={`quantity-${idx}`}
                                aria-label={`Quantity, ${item.productName}`}
                                value={item.quantity}
                                disabled={mutatingId === item.id}
                                onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
                                className="col-start-1 row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:opacity-60 sm:text-sm/6"
                              >
                                {Array.from({ length: 8 }).map((_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                              />
                            </div>

                            <button
                              type="button"
                              disabled={mutatingId === item.id}
                              onClick={() => onRemove(item.id)}
                              className="ml-4 font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-60 sm:mt-2 sm:ml-0"
                            >
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="summary-heading" className="mt-auto sm:px-6 lg:px-8">
                <div className="bg-gray-50 p-6 sm:rounded-lg sm:p-8">
                  <h2 id="summary-heading" className="sr-only">
                    Order summary
                  </h2>

                  <div className="flow-root">
                    <dl className="-my-4 divide-y divide-gray-200 text-sm">
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-gray-600">Subtotal</dt>
                        <dd className="font-medium text-gray-900">Rp {formatPrice(total)}</dd>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-gray-600">Shipping</dt>
                        <dd className="font-medium text-gray-900">Rp 0</dd>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-gray-600">Tax</dt>
                        <dd className="font-medium text-gray-900">Rp 0</dd>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-base font-medium text-gray-900">Order total</dt>
                        <dd className="text-base font-medium text-gray-900">Rp {formatPrice(total)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onClose(false)}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={clearing || !hasItems}
                      onClick={onClear}
                      className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-60"
                    >
                      {clearing ? "Clearing..." : "Clear cart"}
                    </button>
                  </div>
                </div>
              </section>

              <div className="mt-8 flex justify-end px-4 sm:px-6 lg:px-8">
                <button
                  type="button"
                  disabled={!hasItems}
                  onClick={onContinueToPayment}
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
