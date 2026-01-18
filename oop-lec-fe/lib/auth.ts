type AuthResponse = {
  userId: number;
  name: string;
  username: string;
  email: string;
  role: string;
};

type LoginRequest = {
  identifier: string;
  password: string;
};

type RegisterRequest = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as { message?: string } & Partial<AuthResponse>) : null;

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as AuthResponse;
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as { message?: string } & Partial<AuthResponse>) : null;

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as AuthResponse;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
