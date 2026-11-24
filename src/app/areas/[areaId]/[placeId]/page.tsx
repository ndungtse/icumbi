import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { NearbyExplorer } from "@/components/NearbyExplorer";
import { button, Notice, PROBLEM } from "@/components/ui";
import { getArea, PHOTO_CREDITS, STAY_TYPES } from "@/lib/data";
import { getNearby, getPhotos, getStays } from "@/lib/places";

export default async function StayPage({ params }: PageProps<"/areas/[areaId]/[placeId]">) {
  const { areaId, placeId } = await params;
  const area = getArea(areaId);
  if (!area) notFound();

  await connection();
  const loaded = await getStays(area)
    .then(async (stays) => {
      const stay = stays.find((s) => s.id === placeId);
      if (!stay) return "missing" as const;
      const [nearby, photos] = await Promise.all([getNearby(stay), getPhotos(stay.lat, stay.lng)]);
      return { stay, nearby, photos };
    })
    .catch((err) => {
      console.error("could not load stay", err);
      return null;
    });
  if (loaded === "missing") notFound();

  const back = (
    <Link href={`/areas/${area.id}`} className="text-sm text-primary hover:underline">
      &larr; Places to stay in {area.name}
    </Link>
  );
  if (!loaded) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        {back}
        <div className="mt-4">
          <Notice>
            {PROBLEM}{" "}
            <a href={`/areas/${area.id}/${placeId}`} className="font-medium text-primary underline">
              Try again
            </a>
          </Notice>
        </div>
      </div>
    );
  }

  const { stay, nearby, photos } = loaded;
  const main = stay.image ?? photos[0]?.url ?? (area.photo ? `/photos/${area.photo}.jpg` : undefined);
  const side = (stay.image ? photos : photos.slice(1)).slice(0, 2);
  const credits = photos.slice(0, stay.image ? 2 : 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {back}

      <div className="mt-4 grid h-64 gap-2 overflow-hidden rounded-3xl bg-primary-dark sm:h-80 sm:grid-cols-3">
        {/* eslint-disable @next/next/no-img-element */}
        {main && <img src={main} alt={`${stay.name}`} className={`h-full w-full object-cover ${side.length ? "sm:col-span-2" : "sm:col-span-3"}`} />}
        {side.length > 0 && (
          <div className="hidden grid-rows-2 gap-2 sm:grid">
            {side.map((p) => (
              <img key={p.url} src={p.url} alt="" className="h-full w-full object-cover" />
            ))}
          </div>
        )}
        {/* eslint-enable @next/next/no-img-element */}
      </div>
      <p className="mt-2 text-xs text-muted">
        {credits.length > 0
          ? `Photos taken near here (Wikimedia Commons): ${credits.map((p) => `${p.author}, ${p.license}`).join(" · ")}`
          : !stay.image && area.photo
            ? `Photo of ${area.name}: ${PHOTO_CREDITS[area.photo]}`
            : ""}
      </p>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">{stay.name}</h1>
          <p className="mt-1 text-muted">
            {STAY_TYPES[stay.type] ?? stay.type}
            {stay.address ? ` · ${stay.address}` : ""}
          </p>
          {stay.phone && <p className="mt-1 text-sm text-muted">{stay.phone}</p>}
        </div>
        <div className="flex gap-2">
          {stay.website && (
            <a href={stay.website} target="_blank" rel="noopener noreferrer" className={button("soft")}>
              Website
            </a>
          )}
          <a
            href={`https://www.openstreetmap.org/directions?to=${stay.lat}%2C${stay.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className={button("primary")}
          >
            Directions
          </a>
        </div>
      </div>

      <div className="mt-10">
        <NearbyExplorer stay={stay} nearby={nearby} />
      </div>
    </div>
  );
}
