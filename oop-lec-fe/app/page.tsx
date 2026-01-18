"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { addToCart } from "../lib/cart";
import { listCategories, type Category } from "../lib/categories";
import { listProducts, type Product } from "../lib/products";

function formatPrice(price: Product["price"]) {
  if (typeof price === "number") return new Intl.NumberFormat("id-ID").format(price);
  const n = Number(price);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(price);
}

function productImageSrc(imagePath?: string | null) {
  if (imagePath) {
    return imagePath;
  }
  return "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-04-featured-product-shot.jpg";
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [q, setQ] = useState<string>("");
  const [searchDraft, setSearchDraft] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const cats = await listCategories({ page: 0, size: 50 });
        if (!cancelled) setCategories(cats.content ?? []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const pageData = await listProducts({
          page,
          size,
          q,
          categoryId: categoryId ? Number(categoryId) : undefined,
        });
        if (!cancelled) {
          setProducts(pageData.content ?? []);
          setTotalPages(pageData.totalPages ?? 0);
          setTotalElements(pageData.totalElements ?? 0);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [page, q, categoryId]);

  useEffect(() => {
    if (totalPages <= 0) {
      if (page !== 0) setPage(0);
      return;
    }
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const hasProducts = useMemo(() => products.length > 0, [products.length]);

  const currentPage = useMemo(() => Math.min(page, Math.max(totalPages - 1, 0)), [page, totalPages]);
  const showingFrom = useMemo(() => {
    if (totalElements <= 0) return 0;
    return currentPage * size + 1;
  }, [currentPage, size, totalElements]);
  const showingTo = useMemo(() => {
    const to = (currentPage + 1) * size;
    return Math.min(to, totalElements);
  }, [currentPage, size, totalElements]);

  async function onAddToCart(productId: number) {
    setAddingId(productId);
    setToast(null);
    try {
      await addToCart({ productId, quantity: 1 });
      setToast("Added to cart");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add to cart";
      setToast(msg);
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        window.location.href = "/login";
      }
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:max-w-7xl lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Products</h1>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(0);
              setQ(searchDraft);
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search products"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden sm:w-72"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setPage(0);
                  setCategoryId(e.target.value);
                }}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden sm:w-56"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              Apply
            </button>
          </form>

          <div className="text-sm text-gray-500">
            {totalElements > 0 ? (
              <span>
                Showing {showingFrom}-{showingTo} of {totalElements}
              </span>
            ) : (
              <span>Showing 0</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : !hasProducts ? (
          <div className="mt-8 text-sm text-gray-500">No products found.</div>
        ) : (
          <div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <div className="aspect-square w-full bg-gray-200">
                    <div className="relative size-full">
                      <Image
                        alt={product.name}
                        src={productImageSrc(product.imagePath)}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col space-y-2 p-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        <Link href={`/products/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">Rp {formatPrice(product.price)}</p>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">{product.description ?? "No description"}</p>

                    <div className="flex flex-1 flex-col justify-end">
                      <p className="text-xs text-gray-500 italic">Stock: {product.stock}</p>
                      <button
                        type="button"
                        disabled={addingId === product.id || product.stock <= 0}
                        onClick={() => onAddToCart(product.id)}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {product.stock <= 0
                          ? "Out of stock"
                          : addingId === product.id
                            ? "Adding..."
                            : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                disabled={loading || currentPage <= 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-60"
              >
                Prev
              </button>
              <div className="text-sm text-gray-600">
                Page {totalPages > 0 ? currentPage + 1 : 0} of {Math.max(totalPages, 0)}
              </div>
              <button
                type="button"
                disabled={loading || totalPages <= 0 || currentPage >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications - fixed at bottom right */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 400, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 400, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200 shadow-lg"
          >
            <Check className="h-5 w-5 text-green-600" />
            <span>{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-green-600 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
