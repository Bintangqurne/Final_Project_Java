"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function productImageUrl(imagePath?: string | null) {
  if (!imagePath) return null;
  return imagePath;
}

export default function AdminEditProductPage() {
  const router = useRouter();
  const routeParams = useParams();
  const idParam = (routeParams as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);

  const imageUrl = useMemo(() => productImageUrl(product?.imagePath), [product?.imagePath]);

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
        const res = await fetch(`/api/admin/products/${parsedId}`);
        const text = await res.text();
        const data: unknown = text ? JSON.parse(text) : null;
        if (!res.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
        }

        const p = data as Product;
        if (!cancelled) {
          setProduct(p);
          setName(p.name ?? "");
          setDescription(p.description ?? "");
          setPrice(String(p.price ?? "0"));
          setStock(String(p.stock ?? 0));
          setActive(!!p.active);
        }
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

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const parsedId = Number(id);
      const res = await fetch(`/api/admin/products/${parsedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          price,
          stock,
          active,
        }),
      });

      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }
      setProduct(data as Product);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const parsedId = Number(id);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`/api/admin/products/${parsedId}/image`, {
        method: "POST",
        body: form,
      });
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }
      setProduct(data as Product);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit product</h1>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()}>
            Refresh
          </Button>
          <Button variant="link" asChild className="px-0">
            <Link href="/admin/products">Back</Link>
          </Button>
        </div>
      </div>

      {loading ? <div className="text-muted-foreground mt-4 text-sm">Loading...</div> : null}
      {error ? <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {product ? (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-muted-foreground text-sm">Product ID</div>
                <div className="mt-1 font-semibold">{product.id}</div>
              </div>
              <div className="bg-muted relative size-24 overflow-hidden rounded-lg">
                {imageUrl ? (
                  <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="96px" />
                ) : null}
              </div>
            </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="file">Upload image</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onUpload(f);
                  }}
                />
                <div className="text-muted-foreground text-xs">Field name must be file.</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <form onSubmit={onSave}>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      type="number"
                      min={0}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      type="number"
                      min={0}
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="active"
                    checked={active}
                    onCheckedChange={(v) => setActive(v === true)}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving} className="font-semibold">
                  {saving ? "Saving..." : "Save"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
