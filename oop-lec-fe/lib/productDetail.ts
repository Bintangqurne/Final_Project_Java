export type ProductDetail = {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  stock: number;
  active: boolean;
  imagePath?: string | null;
};

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

async function parseOrNull(res: Response): Promise<unknown> {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getProductDetail(id: number): Promise<ProductDetail> {
  const res = await fetch(`/api/products/${id}`);
  const data = await parseOrNull(res);

  if (!res.ok) {
    throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
  }

  return data as ProductDetail;
}
