"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id: number;
  name: string;
  description: string | null;
  imagePath?: string | null;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
};

function categoryImageUrl(imagePath?: string | null) {
  if (!imagePath) return null;
  return imagePath;
}

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

export default function AdminEditCategoryPage() {
  const routeParams = useParams();
  const idParam = (routeParams as { id?: string | string[] } | null)?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const imageUrl = useMemo(() => categoryImageUrl(category?.imagePath), [category?.imagePath]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const parsedId = Number(id);
        if (!id || !Number.isFinite(parsedId)) {
          throw new Error("Invalid category id");
        }

        const res = await fetch(`/api/admin/categories/${parsedId}`);
        const text = await res.text();
        const data: unknown = text ? JSON.parse(text) : null;
        if (!res.ok) {
          throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
        }

        const c = data as Category;
        if (!cancelled) {
          setCategory(c);
          setName(c.name ?? "");
          setDescription(c.description ?? "");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load category");
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
      const res = await fetch(`/api/admin/categories/${parsedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
        }),
      });

      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }

      setCategory(data as Category);
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
      const res = await fetch(`/api/admin/categories/${parsedId}/image`, {
        method: "POST",
        body: form,
      });
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }
      setCategory(data as Category);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit category</h1>
        <Button variant="link" asChild className="px-0">
          <Link href="/admin/categories">Back</Link>
        </Button>
      </div>

      {loading ? <div className="text-muted-foreground mt-4 text-sm">Loading...</div> : null}
      {error ? <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {category ? (
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-muted-foreground text-sm">Category ID</div>
                  <div className="mt-1 font-semibold">{category.id}</div>
                </div>
                <div className="bg-muted relative size-24 overflow-hidden rounded-lg">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={category.name} fill className="object-cover" sizes="96px" />
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
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <form onSubmit={onSave}>
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
