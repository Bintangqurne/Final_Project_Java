"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckIcon, QuestionMarkCircleIcon, StarIcon } from "@heroicons/react/20/solid";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { addToCart } from "../../../lib/cart";
import { getProductDetail, type ProductDetail } from "../../../lib/productDetail";

const reviews = { average: 4, totalCount: 1624 };

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(price: string | number) {
  const n = typeof price === "number" ? price : Number(price);
  if (Number.isFinite(n)) return new Intl.NumberFormat("id-ID").format(n);
  return String(price);
}

function productImageSrc(imagePath?: string | null) {
  if (imagePath) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";
    return `${base}${imagePath}`;
  }
  return "https://tailwindui.com/plus-assets/img/ecommerce-images/product-page-04-featured-product-shot.jpg";
}

export default function ProductDetailPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const routeParams = useParams();
  const idParam = (routeParams as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const parsedId = Number(id);
        if (!id || !Number.isFinite(parsedId)) {
          throw new Error("Invalid product id");
        }
        const p = await getProductDetail(parsedId);
        if (!cancelled) setProduct(p);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function onAdd() {
    if (!product) return;
    setAdding(true);
    setToast(null);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      setToast("Added to cart");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add to cart";
      setToast(msg);
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("401")) {
        window.location.href = "/login";
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        <div className="lg:max-w-lg lg:self-end">
          <nav aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-2">
              <li>
                <div className="flex items-center text-sm">
                  <Link href="/" className="font-medium text-gray-500 hover:text-gray-900">
                    Home
                  </Link>
                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="ml-2 size-5 shrink-0 text-gray-300"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                </div>
              </li>
              <li>
                <div className="flex items-center text-sm">
                  <Link href="/orders" className="font-medium text-gray-500 hover:text-gray-900">
                    Orders
                  </Link>
                </div>
              </li>
            </ol>
          </nav>

          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {loading ? "Loading..." : product?.name ?? "Product"}
            </h1>
          </div>

          {error ? <div className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {toast ? <div className="mt-6 rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-900">{toast}</div> : null}

          <section aria-labelledby="information-heading" className="mt-4">
            <h2 id="information-heading" className="sr-only">
              Product information
            </h2>

            <div className="flex items-center">
              <p className="text-lg text-gray-900 sm:text-xl">
                Rp {product ? formatPrice(product.price) : "-"}
              </p>

              <div className="ml-4 border-l border-gray-300 pl-4">
                <h2 className="sr-only">Reviews</h2>
                <div className="flex items-center">
                  <div>
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          aria-hidden="true"
                          className={classNames(
                            (reviews.average as number) > rating ? "text-yellow-400" : "text-gray-300",
                            "size-5 shrink-0"
                          )}
                        />
                      ))}
                    </div>
                    <p className="sr-only">{reviews.average} out of 5 stars</p>
                  </div>
                  <p className="ml-2 text-sm text-gray-500">{reviews.totalCount} reviews</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-6">
              <p className="text-base text-gray-500">{product?.description ?? "No description"}</p>
            </div>

            <div className="mt-6 flex items-center">
              <CheckIcon aria-hidden="true" className="size-5 shrink-0 text-green-500" />
              <p className="ml-2 text-sm text-gray-500">
                {product ? ((product.stock ?? 0) > 0 ? "In stock and ready to ship" : "Out of stock") : ""}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <Image
              alt={product?.name ?? "Product"}
              src={productImageSrc(product?.imagePath)}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        </div>

        <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
          <section aria-labelledby="options-heading">
            <h2 id="options-heading" className="sr-only">
              Product options
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAdd();
              }}
            >
              <div className="mt-4">
                <a href="#" className="group inline-flex text-sm text-gray-500 hover:text-gray-700">
                  <span>What size should I buy?</span>
                  <QuestionMarkCircleIcon
                    aria-hidden="true"
                    className="ml-2 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                  />
                </a>
              </div>
              <div className="mt-10">
                <button
                  type="submit"
                  disabled={adding || !product || (product.stock ?? 0) <= 0}
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden disabled:opacity-60"
                >
                  {(product?.stock ?? 0) <= 0 ? "Out of stock" : adding ? "Adding..." : "Add to bag"}
                </button>
              </div>
              <div className="mt-6 text-center">
                <a href="#" className="group inline-flex text-base font-medium">
                  <ShieldCheckIcon
                    aria-hidden="true"
                    className="mr-2 size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                  />
                  <span className="text-gray-500 hover:text-gray-700">Lifetime Guarantee</span>
                </a>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
