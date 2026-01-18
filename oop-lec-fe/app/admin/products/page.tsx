"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  stock: number;
  active: boolean;
  imagePath?: string | null;
  deletedAt?: string | null;
};

type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

function productImageUrl(imagePath?: string | null) {
  if (!imagePath) return null;
  return imagePath;
}

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

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageResponse<Product> | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const products = useMemo(() => (page?.content ?? []).filter((p) => !p.deletedAt), [page]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products?page=0&size=50");
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }
      setPage(data as PageResponse<Product>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id: number) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const text = await res.text();
        let data: unknown = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }
        setError(extractMessage(data) ?? `Request failed (${res.status})`);
        return;
      }

      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex-none text-xl font-bold tracking-tight">Products</h2>
          <Button asChild>
            <Link href="/admin/products/new">New product</Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">Create, update, delete products, and upload images.</p>
      </div>

      {loading ? <div className="text-muted-foreground text-sm">Loading...</div> : null}
      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Product</TableHead>
                <TableHead className="px-4">Price</TableHead>
                <TableHead className="px-4">Stock</TableHead>
                <TableHead className="px-4">Active</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-6 text-muted-foreground">
                    No products.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => {
                  const img = productImageUrl(p.imagePath);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted relative size-10 overflow-hidden rounded-md">
                            {img ? (
                              <Image src={img} alt={p.name} fill className="object-cover" sizes="40px" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-muted-foreground text-xs">ID: {p.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">Rp {formatPrice(p.price)}</TableCell>
                      <TableCell className="px-4 py-4">{p.stock}</TableCell>
                      <TableCell className="px-4 py-4">{p.active ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/products/${p.id}`}>Edit</Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="destructive" size="sm" disabled={deletingId === p.id}>
                                {deletingId === p.id ? "Deleting..." : "Delete"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the product. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={deletingId === p.id}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                  disabled={deletingId === p.id}
                                  onClick={() => onDelete(p.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
