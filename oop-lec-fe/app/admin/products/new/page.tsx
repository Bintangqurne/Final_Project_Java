"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id: number;
  name: string;
};

type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ProductRequest = {
  name: string;
  description?: string | null;
  price: string;
  stock: string;
  active?: boolean;
  categoryId?: number | null;
};

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);
  const [categoryId, setCategoryId] = useState<string>("none");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/admin/categories?page=0&size=100");
        const text = await res.text();
        const data: unknown = text ? JSON.parse(text) : null;
        if (!res.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
        }

        const page = data as PageResponse<Category>;
        if (!cancelled) {
          setCategories(Array.isArray(page.content) ? page.content : []);
        }
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: ProductRequest = {
        name,
        description: description || null,
        price,
        stock,
        active,
        categoryId: categoryId && categoryId !== "none" ? Number(categoryId) : null,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }

      const created = data as { id: number };
      if (imageFile) {
        const form = new FormData();
        form.append("file", imageFile);
        const uploadRes = await fetch(`/api/admin/products/${created.id}/image`, {
          method: "POST",
          body: form,
        });
        const uploadText = await uploadRes.text();
        const uploadData: unknown = uploadText ? JSON.parse(uploadText) : null;
        if (!uploadRes.ok) {
          throw new Error(extractMessage(uploadData) ?? `Request failed (${uploadRes.status})`);
        }
      }

      router.push(`/admin/products/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">New product</h1>
        <Button variant="link" asChild className="px-0">
          <Link href="/admin/products">Back</Link>
        </Button>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <Card className="mt-6">
        <form onSubmit={onSubmit}>
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

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label htmlFor="file">Upload image</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <div className="text-muted-foreground text-xs">Field name must be file.</div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving} className="font-semibold">
              {saving ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
