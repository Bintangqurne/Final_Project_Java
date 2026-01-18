export type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: string | number;
  subtotal: string | number;
};

export type Order = {
  id: number;
  orderCode: string;
  status: string;
  totalAmount: string | number;
  shippingAddress?: string | null;
  shippingPhone?: string | null;
  courierPhone?: string | null;
  courierPlate?: string | null;
  createdAt?: string;
  items: OrderItem[];
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

export async function listOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  const data = await parseOrNull(res);

  if (!res.ok) {
    throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
  }

  return data as Order[];
}

export async function getOrder(orderId: number): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}`);
  const data = await parseOrNull(res);

  if (!res.ok) {
    throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
  }

  return data as Order;
}
