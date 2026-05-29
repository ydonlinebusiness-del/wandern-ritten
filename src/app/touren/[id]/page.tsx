import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getActivity, listPhotosForActivity } from "@/db/repo";
import { elevationProfile } from "@/lib/geo";
import {
  formatDistance,
  formatDuration,
  formatElevation,
} from "@/lib/stats";
import ElevationChart from "@/components/ElevationChart";
import DynamicTrackMap from "@/components/map/DynamicTrackMap";
import PhotoUpload from "@/components/PhotoUpload";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <div className="text-lg font-semibold text-ritten-forest">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(Number(id)).catch(() => null);
  if (!activity) notFound();

  const photos = await listPhotosForActivity(activity.id).catch(() => []);
  const profile = elevationProfile(activity.track);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div>
        <Link href="/touren" className="text-sm text-slate-500 hover:underline">
          ← Alle Touren
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-ritten-forest">
          {activity.name}
        </h1>
        <p className="text-sm text-slate-500">
          {activity.startDate
            ? new Date(activity.startDate).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : "ohne Datum"}{" "}
          · {activity.type} · Quelle: {activity.source}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Distanz" value={formatDistance(activity.distanceM)} />
        <Stat label="Höhenmeter" value={formatElevation(activity.elevGainM)} />
        <Stat
          label="Höchster Punkt"
          value={activity.maxElevationM ? `${Math.round(activity.maxElevationM)} m` : "–"}
        />
        <Stat
          label="Dauer"
          value={activity.movingTimeS > 0 ? formatDuration(activity.movingTimeS) : "–"}
        />
      </div>

      <div className="h-72 overflow-hidden rounded-xl shadow-sm">
        <DynamicTrackMap track={activity.track} />
      </div>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-700">Höhenprofil</h2>
        <ElevationChart profile={profile} />
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Fotos</h2>
          <PhotoUpload activityId={activity.id} />
        </div>
        {photos.length === 0 ? (
          <p className="text-sm text-slate-400">Noch keine Fotos zu dieser Tour.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <a
                key={p.id}
                href={p.blobUrl}
                target="_blank"
                rel="noreferrer"
                className="relative block aspect-square overflow-hidden rounded-lg bg-slate-100"
              >
                <Image
                  src={p.blobUrl}
                  alt={p.caption ?? "Foto"}
                  fill
                  sizes="(max-width:640px) 50vw, 33vw"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
