"use client";

import { useMemo, useState } from "react";
import { input, pill } from "./ui";
import { PlacesMap } from "@/components/PlacesMap";
import { Stay, Nearby, CategoryId, CATEGORIES, formatDistance } from "@/lib/data";

const RADII = [500, 1000, 2000];

export function NearbyExplorer({ stay, nearby }: { stay: Stay; nearby: Nearby[] }) {
  const [radius, setRadius] = useState(1000);
  const [category, setCategory] = useState<CategoryId>("food");
  const [active, setActive] = useState<string | null>(null);

  const within = nearby.filter((p) => p.distanceM <= radius);
  const listed = within.filter((p) => p.category === category);
  const nearest = nearby.filter((p) => p.category === category)[0];
  const pins = [
    { id: stay.id, lat: stay.lat, lng: stay.lng, label: stay.name, kind: "home" as const },
    ...listed.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.name, kind: "place" as const })),
  ];

  return (
    <section aria-labelledby="nearby-heading">
      <h2 id="nearby-heading" className="text-2xl font-bold">
        What&rsquo;s within walking distance
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {RADII.map((r) => (
          <button key={r} type="button" aria-pressed={radius === r} onClick={() => setRadius(r)} className={pill(radius === r)}>
            {r < 1000 ? `${r} m` : `${r / 1000} km`}
          </button>
        ))}
        <span className="mx-1 hidden w-px bg-surface-2 sm:block" />
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={pill(category === c.id)}>
            {c.label} <b>{within.filter((p) => p.category === c.id).length}</b>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="h-80 overflow-hidden rounded-3xl md:h-[26rem]">
          <PlacesMap pins={pins} activeId={active} onSelect={setActive} />
        </div>
        <div aria-live="polite">
          {listed.length === 0 ? (
            <p className="text-muted">
              {nearest ? `Nothing within ${formatDistance(radius)}. The nearest is ${formatDistance(nearest.distanceM)} away.` : "None found nearby."}
            </p>
          ) : (
            <ul className="max-h-[26rem] space-y-1 overflow-auto rounded-3xl bg-surface p-2">
              {listed.map((p) => (
                <li
                  key={p.id}
                  onMouseEnter={() => setActive(p.id)}
                  onMouseLeave={() => setActive(null)}
                  className={`flex items-baseline justify-between gap-3 rounded-2xl px-4 py-3 ${active === p.id ? "bg-primary-soft" : ""}`}
                >
                  <span>{p.name}</span>
                  <span className="shrink-0 text-sm text-muted">{formatDistance(p.distanceM)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs text-muted">Distances are straight lines, not walking routes.</p>
        </div>
      </div>
    </section>
  );
}
