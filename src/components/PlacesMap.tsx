"use client";

import type { Map, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

export type Pin = { id: string; lat: number; lng: number; label: string; kind: "stay" | "place" | "home" };

/** An OpenStreetMap-based map (OpenFreeMap tiles, no key) with clickable pins. */
export function PlacesMap({ pins, activeId, onSelect }: { pins: Pin[]; activeId?: string | null; onSelect?: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const markers = useRef<Record<string, { marker: Marker; el: HTMLElement }>>({});
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    let created: Map | undefined;
    let cancelled = false;
    import("maplibre-gl").then(({ Map, NavigationControl, setWorkerUrl }) => {
      // Next.js needs to be told where the map's web worker file is.
      setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
      if (cancelled || !box.current) return;
      created = new Map({ container: box.current, style: "https://tiles.openfreemap.org/styles/liberty", center: [29.9, -1.95], zoom: 7 });
      created.addControl(new NavigationControl({ showCompass: false }), "top-right");
      setMap(created);
    });
    return () => {
      cancelled = true;
      created?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    import("maplibre-gl").then(({ Marker, LngLatBounds }) => {
      Object.values(markers.current).forEach(({ marker }) => marker.remove());
      markers.current = {};
      const bounds = new LngLatBounds();
      for (const pin of pins) {
        const el = document.createElement("button");
        el.className = `pin pin-${pin.kind}`;
        el.title = pin.label;
        el.setAttribute("aria-label", pin.label);
        el.onclick = () => onSelectRef.current?.(pin.id);
        const marker = new Marker({ element: el }).setLngLat([pin.lng, pin.lat]).addTo(map);
        markers.current[pin.id] = { marker, el };
        bounds.extend([pin.lng, pin.lat]);
      }
      if (pins.length > 1) map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 0 });
      else if (pins.length === 1) map.jumpTo({ center: [pins[0].lng, pins[0].lat], zoom: 15 });
    });
  }, [map, pins]);

  useEffect(() => {
    for (const [id, { el }] of Object.entries(markers.current)) el.classList.toggle("pin-active", id === activeId);
  }, [activeId, pins, map]);

  return <div ref={box} className="h-full w-full" />;
}
