'use client';

import { AREAS } from "@/lib/data";
import Link from "next/link";
import { useState } from "react";
import { input } from "./ui";

export function AreaSearch() {
  const [query, setQuery] = useState("");
  const matches = query.trim() ? AREAS.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6) : [];

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor="area-search" className="sr-only">
        Search an area
      </label>
      <input
        id="area-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Where are you going? Try Musanze"
        autoComplete="off"
        className={`${input} w-full !bg-white/95 py-3.5 focus:!bg-white`}
      />
      {query.trim() && (
        <ul className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl bg-white py-1 text-ink shadow-xl">
          {matches.length === 0 && <li className="px-5 py-3 text-muted">No area matches that name.</li>}
          {matches.map((a) => (
            <li key={a.id}>
              <Link href={`/areas/${a.id}`} prefetch={false} className="block px-5 py-2.5 hover:bg-primary-soft">
                {a.name} <span className="text-sm text-muted">· {a.group}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
