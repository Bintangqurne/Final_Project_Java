export type Product = {
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

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

function normalizePageResponse<T>(value: unknown, fallbackSize: number): PageResponse<T> {
  const v = (value ?? {}) as Record<string, unknown>;

  const dataObj =
    v.data && typeof v.data === "object" && !Array.isArray(v.data) ? (v.data as Record<string, unknown>) : null;
  const metaObj =
    v.meta && typeof v.meta === "object" && !Array.isArray(v.meta) ? (v.meta as Record<string, unknown>) : null;
  const pageObj =
    v.page && typeof v.page === "object" && !Array.isArray(v.page) ? (v.page as Record<string, unknown>) : null;

  const wrapper = (dataObj ?? v) as Record<string, unknown>;

  const content = (
    Array.isArray(wrapper.content)
      ? wrapper.content
      : Array.isArray(wrapper.items)
        ? wrapper.items
        : Array.isArray(v.items)
          ? v.items
          : Array.isArray(v.data)
            ? v.data
            : []
  ) as T[];

  const numberRaw =
    (wrapper.number ??
      wrapper.page ??
      wrapper.currentPage ??
      (wrapper.pageable && (wrapper.pageable as Record<string, unknown>).pageNumber) ??
      v.number ??
      v.page ??
      v.currentPage ??
      (v.pageable && (v.pageable as Record<string, unknown>).pageNumber) ??
      pageObj?.number ??
      metaObj?.page ??
      metaObj?.currentPage) as
      | number
      | string
      | undefined;

  const currentPageRaw = (metaObj?.current_page ?? metaObj?.currentPage) as number | string | undefined;
  const number = Number.isFinite(Number(numberRaw))
    ? Number(numberRaw)
    : Number.isFinite(Number(currentPageRaw))
      ? Math.max(0, Number(currentPageRaw) - 1)
      : 0;

  const sizeRaw =
    (wrapper.size ??
      wrapper.pageSize ??
      (wrapper.pageable && (wrapper.pageable as Record<string, unknown>).pageSize) ??
      v.size ??
      v.pageSize ??
      (v.pageable && (v.pageable as Record<string, unknown>).pageSize) ??
      pageObj?.size ??
      metaObj?.per_page ??
      metaObj?.perPage) as
      | number
      | string
      | undefined;
  const size = Number.isFinite(Number(sizeRaw)) ? Number(sizeRaw) : fallbackSize;

  const totalElementsRaw = (wrapper.totalElements ??
    wrapper.total_elements ??
    wrapper.total ??
    wrapper.totalCount ??
    wrapper.totalItems ??
    wrapper.totalItem ??
    v.totalElements ??
    v.total_elements ??
    v.total ??
    v.totalCount ??
    v.totalItems ??
    v.totalItem ??
    pageObj?.totalElements ??
    metaObj?.total ??
    metaObj?.totalElements ??
    metaObj?.total_items ??
    metaObj?.totalItems) as
    | number
    | string
    | undefined;
  const totalElements = Number.isFinite(Number(totalElementsRaw)) ? Number(totalElementsRaw) : content.length;

  const totalPagesRaw = (wrapper.totalPages ??
    wrapper.total_pages ??
    wrapper.pages ??
    wrapper.totalPage ??
    v.totalPages ??
    v.total_pages ??
    v.pages ??
    v.totalPage ??
    pageObj?.totalPages ??
    metaObj?.totalPages ??
    metaObj?.total_pages ??
    metaObj?.last_page ??
    metaObj?.lastPage) as number | string | undefined;
  const parsedTotalPages = Number.isFinite(Number(totalPagesRaw)) ? Number(totalPagesRaw) : undefined;
  const totalPages =
    parsedTotalPages !== undefined
      ? parsedTotalPages
      : size > 0
        ? Math.max(1, Math.ceil(totalElements / size))
        : 0;

  return {
    content,
    number,
    size,
    totalElements,
    totalPages,
  };
}

export async function listProducts(params?: {
  page?: number;
  size?: number;
  q?: string;
  categoryId?: number | string;
}): Promise<PageResponse<Product>> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 12;

  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("size", String(size));
  if (params?.q && params.q.trim()) query.set("q", params.q);
  if (params?.categoryId !== undefined && params?.categoryId !== null && String(params.categoryId).trim()) {
    query.set("categoryId", String(params.categoryId));
  }

  const res = await fetch(`/api/products?${query.toString()}`);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return normalizePageResponse<Product>(data, size);
}
