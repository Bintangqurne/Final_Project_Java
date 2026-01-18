"use client";

import { useEffect, useMemo, useState } from "react";

type MeResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
};

type Address = {
  id: number;
  label: string;
  recipientName?: string | null;
  addressLine: string;
  phone: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function extractMessage(value: unknown): string | undefined {
  if (value && typeof value === "object" && "message" in value) {
    const msg = (value as { message?: unknown }).message;
    return typeof msg === "string" ? msg : undefined;
  }
  return undefined;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrRecipientName, setAddrRecipientName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrMakeDefault, setAddrMakeDefault] = useState(false);

  const isEditingAddress = useMemo(() => editingAddressId != null, [editingAddressId]);

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddrLabel("");
    setAddrRecipientName("");
    setAddrPhone("");
    setAddrLine("");
    setAddrMakeDefault(false);
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, addrRes] = await Promise.all([fetch("/api/me"), fetch("/api/addresses")]);

      const meText = await meRes.text();
      const meData: unknown = meText ? JSON.parse(meText) : null;
      if (!meRes.ok) {
        throw new Error(extractMessage(meData) ?? `Request failed (${meRes.status})`);
      }

      const addrText = await addrRes.text();
      const addrData: unknown = addrText ? JSON.parse(addrText) : null;
      if (!addrRes.ok) {
        throw new Error(extractMessage(addrData) ?? `Request failed (${addrRes.status})`);
      }

      const meObj = meData as MeResponse;
      setMe(meObj);
      setName(meObj.name ?? "");
      setUsername(meObj.username ?? "");
      setEmail(meObj.email ?? "");

      setAddresses(Array.isArray(addrData) ? (addrData as Address[]) : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load profile";
      setError(msg);
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function onSaveProfile() {
    setSavingProfile(true);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, username, email }),
      });
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }

      const meObj = data as MeResponse;
      setMe(meObj);
      setName(meObj.name ?? "");
      setUsername(meObj.username ?? "");
      setEmail(meObj.email ?? "");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to update profile";
      setError(msg);
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        window.location.href = "/login";
      }
    } finally {
      setSavingProfile(false);
    }
  }

  function onEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddrLabel(address.label ?? "");
    setAddrRecipientName(address.recipientName ?? "");
    setAddrPhone(address.phone ?? "");
    setAddrLine(address.addressLine ?? "");
    setAddrMakeDefault(Boolean(address.isDefault));
  }

  async function onSubmitAddress() {
    setSavingAddress(true);
    setError(null);
    try {
      const payload = {
        label: addrLabel,
        recipientName: addrRecipientName,
        addressLine: addrLine,
        phone: addrPhone,
        isDefault: addrMakeDefault,
      };

      const res = await fetch(isEditingAddress ? `/api/addresses/${editingAddressId}` : "/api/addresses", {
        method: isEditingAddress ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }

      resetAddressForm();
      await loadAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save address";
      setError(msg);
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        window.location.href = "/login";
      }
    } finally {
      setSavingAddress(false);
    }
  }

  async function onDeleteAddress(addressId: number) {
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" });
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }
      if (editingAddressId === addressId) {
        resetAddressForm();
      }
      await loadAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete address";
      setError(msg);
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        window.location.href = "/login";
      }
    }
  }

  async function onSetDefault(addressId: number) {
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${addressId}/default`, { method: "POST" });
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : null;
      if (!res.ok) {
        throw new Error(extractMessage(data) ?? `Request failed (${res.status})`);
      }
      await loadAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to set default";
      setError(msg);
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("forbidden") ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        window.location.href = "/login";
      }
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Profile</h1>
          <p className="mt-2 text-sm text-gray-500">Edit profile dan alamat pengiriman.</p>
        </div>

        {loading ? <div className="mt-8 text-sm text-gray-500">Loading...</div> : null}
        {error ? <div className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {!loading ? (
          <div className="mt-10 grid grid-cols-1 gap-10">
            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <p className="mt-1 text-sm text-gray-500">Data ini dipakai untuk akun kamu.</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="Nama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="Username"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="text-xs text-gray-500">Role: {me?.role ?? "-"}</div>
                <button
                  type="button"
                  onClick={onSaveProfile}
                  disabled={savingProfile}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Alamat</h2>
              <p className="mt-1 text-sm text-gray-500">Simpan beberapa alamat, pilih satu sebagai default.</p>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Daftar Alamat</h3>

                  {addresses.length === 0 ? (
                    <div className="mt-3 text-sm text-gray-500">Belum ada alamat.</div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {addresses.map((a) => (
                        <div key={a.id} className="rounded-md border border-gray-200 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{a.label}</p>
                                {a.isDefault ? (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                                    Default
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{a.addressLine}</p>
                              <p className="mt-1 text-xs text-gray-500">Phone: {a.phone}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {!a.isDefault ? (
                                <button
                                  type="button"
                                  onClick={() => onSetDefault(a.id)}
                                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  Set default
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => onEditAddress(a)}
                                className="text-xs font-medium text-gray-700 hover:text-gray-900"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteAddress(a.id)}
                                className="text-xs font-medium text-red-600 hover:text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{isEditingAddress ? "Edit alamat" : "Tambah alamat"}</h3>

                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Label</label>
                      <input
                        value={addrLabel}
                        onChange={(e) => setAddrLabel(e.target.value)}
                        placeholder="Rumah / Kantor"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nama penerima (opsional)</label>
                      <input
                        value={addrRecipientName}
                        onChange={(e) => setAddrRecipientName(e.target.value)}
                        placeholder="Nama penerima"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">No HP</label>
                      <input
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alamat lengkap</label>
                      <textarea
                        value={addrLine}
                        onChange={(e) => setAddrLine(e.target.value)}
                        placeholder="Tulis alamat lengkap..."
                        className="mt-1 min-h-28 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={addrMakeDefault}
                        onChange={(e) => setAddrMakeDefault(e.target.checked)}
                      />
                      Jadikan default
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onSubmitAddress}
                        disabled={savingAddress}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {savingAddress ? "Saving..." : isEditingAddress ? "Update" : "Add"}
                      </button>

                      {isEditingAddress ? (
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
