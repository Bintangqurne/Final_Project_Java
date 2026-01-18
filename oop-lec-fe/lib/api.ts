export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

type ApiError = {
  message?: string;
};

export async function apiPost<TResponse, TBody>(
  path: string,
  body: TBody,
  token?: string
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }
  );

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = (data ?? {}) as ApiError;
    throw new Error(err.message ?? `Request failed (${res.status})`);
  }

  return data as TResponse;
}
