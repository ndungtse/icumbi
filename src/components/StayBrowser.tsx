"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { input } from "./ui";
import { PlacesMap } from "./PlacesMap";
import { StayArt } from "./StayArt";
import { type Area, distanceM, formatDistance, type Stay, STAY_TYPES } from "@/lib/data";


type Sort = "near" | "name";
const field = `${input} py-2.5`


function Thumb({ stay }: { stay: Stay }) {
  if (stay.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={stay.image} alt="" loading="lazy" className="h-full w-full object-cover" />;
  }
  return <StayArt type={stay.type} />;
}

export function StayBrowser({ stays, area }: { stays: Stay[]; area: Area }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<Sort>("near");
  const [active, setActive] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = stays.filter((s) => (!q || s.name.toLowerCase().includes(q)) && (type === "all" || s.type === type));
    const far = (s: Stay) => distanceM(s, area.center);
    return list.sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : far(a) - far(b)));
  }, [stays, query, type, sort, area]);

  const types = [...new Set(stays.map((s) => s.type))];
  const pins = shown.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.name, kind: "stay" as const }));

  const select = (id: string) => {
    setActive(id);
    document.getElementById(`stay-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input type="search" aria-label="Search by name" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} className={`${field} w-full sm:w-56`} />
        <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} className={field}>
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {STAY_TYPES[t] ?? t}
            </option>
          ))}
        </select>
        <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field}>
          <option value="near">Nearest to centre</option>
          <option value="name">Name A–Z</option>
        </select>
        <span className="ml-auto text-sm text-muted" aria-live="polite">
          {shown.length} of {stays.length} places
        </span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <ul className={`space-y-3 ${showMap ? "hidden lg:block" : ""}`}>
          {shown.length === 0 && <li className="rounded-2xl bg-surface px-5 py-4 text-muted">No places match these filters.</li>}
          {shown.map((s) => (
            <li key={s.id} id={`stay-${s.id}`} onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)}>
              <Link
                href={`/areas/${area.id}/${s.id}`}
                prefetch={false}
                className={`flex gap-4 rounded-3xl p-3 transition ${active === s.id ? "bg-primary-soft" : "bg-surface hover:bg-surface-2"}`}
              >
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-40">
                  <Thumb stay={s} />
                </div>
                <div className="min-w-0 py-1">
                  <h3 className="truncate text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted">{STAY_TYPES[s.type] ?? s.type}</p>
                  <p className="mt-1 text-sm text-muted">{formatDistance(distanceM(s, area.center))} from the centre</p>
                  {s.address && <p className="mt-1 truncate text-sm text-muted">{s.address}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className={`${showMap ? "" : "hidden lg:block"} h-[70vh] overflow-hidden rounded-3xl lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]`}>
          <PlacesMap pins={pins} activeId={active} onSelect={select} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowMap((v) => !v)}
        className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white shadow-lg lg:hidden"
      >
        {showMap ? "Show list" : "Show map"}
      </button>
    </div>
  );
}

