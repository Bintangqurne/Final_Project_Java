type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Category = {
  id: number;
  name: string;
  description?: string | null;
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

export async function listCategories(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<Category>> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 50;

  const res = await fetch(`/api/categories?page=${page}&size=${size}`);
  const data = await parseOrNull(res);

  if (!res.ok) {
    throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
  }

  return data as PageResponse<Category>;
}
