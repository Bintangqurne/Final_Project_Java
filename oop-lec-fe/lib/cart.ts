export type AddToCartRequest = {
  productId: number;
  quantity: number;
};

export type CartItem = {
  id: number;
  productId: number;
  productName: string;
  price: string | number;
  quantity: number;
  subtotal: string | number;
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

export async function addToCart(body: AddToCartRequest): Promise<void> {
  const res = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await parseOrNull(res);

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
}

export async function getCart(): Promise<CartItem[]> {
  const res = await fetch("/api/cart");
  const data = await parseOrNull(res);

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as CartItem[];
}

export async function clearCart(): Promise<void> {
  const res = await fetch("/api/cart", { method: "DELETE" });
  const data = await parseOrNull(res);

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
}

export async function removeCartItem(cartItemId: number): Promise<void> {
  const res = await fetch(`/api/cart/items/${cartItemId}`, { method: "DELETE" });
  const data = await parseOrNull(res);

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<void> {
  const res = await fetch(`/api/cart/items/${cartItemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  const data = await parseOrNull(res);

  if (!res.ok) {
    const message = extractMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
}
