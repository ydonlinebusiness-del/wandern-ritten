"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Foto-Upload für eine Tour (lädt nach Vercel Blob über /api/photos/upload). */
export default function PhotoUpload({ activityId }: { activityId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("activityId", String(activityId));
        const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error ?? `Upload fehlgeschlagen (${res.status})`);
        }
      }
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-ritten-forest px-3 py-2 text-sm font-medium text-white hover:bg-ritten-moss">
        {busy ? "Lädt hoch …" : "📷 Fotos hinzufügen"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={busy}
          onChange={onChange}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
