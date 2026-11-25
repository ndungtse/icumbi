import { CATEGORIES, type Area, type Nearby, type Photo, type Stay } from "./data";

const GEOAPIFY = "https://api.geoapify.com/v2/places";
const COMMONS = "https://commons.wikimedia.org/w/api.php";

const USER_AGENT = "icumbi-student-project/1.0 (https://github.com)";

const cache = new Map<string, { at: number; value: unknown }>();
async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 3_600_000) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

type Feature = { properties: Record<string, any> };

async function geoapify(params: Record<string, string>): Promise<Feature[]> {
  const key = process.env.GEOAPIFY_KEY;
  if (!key) throw new Error("GEOAPIFY_KEY is not set");
  const url = `${GEOAPIFY}?${new URLSearchParams({ ...params, apiKey: key })}`;
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Geoapify answered ${res.status}`);
  return (await res.json()).features ?? [];
}

export function getStays(area: Area): Promise<Stay[]> {
  return cached(`stays:${area.id}`, async () => {
    const { lat, lng } = area.center;
    const features = await geoapify({
      categories: "accommodation",
      filter: `circle:${lng},${lat},${area.radiusM}`,
      bias: `proximity:${lng},${lat}`,
      limit: "60",
    });
    const stays: Stay[] = [];
    for (const { properties: p } of features) {
      const raw = p.datasource?.raw ?? {};
      const type = (p.categories as string[] | undefined)?.find((c) => c.startsWith("accommodation."))?.split(".")[1];
      if (!p.name || !p.place_id || !type) continue;
      const website = [p.website, p.contact?.website, raw.website].find((w) => typeof w === "string" && /^https?:\/\//.test(w));
      const commons = typeof raw.wikimedia_commons === "string" && raw.wikimedia_commons.startsWith("File:");
      stays.push({
        id: p.place_id,
        name: p.name,
        type,
        lat: p.lat,
        lng: p.lon,
        address: p.address_line2 ?? "",
        website,
        phone: p.contact?.phone ?? raw.phone,
        image: commons
          ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(raw.wikimedia_commons.slice(5))}?width=800`
          : typeof raw.image === "string" && raw.image.startsWith("https://")
            ? raw.image
            : undefined,
      });
    }
    return stays;
  });
}

export function getNearby(stay: Stay): Promise<Nearby[]> {
  return cached(`nearby:${stay.id}`, async () => {
    const lists = await Promise.all(
      CATEGORIES.map(async (c) => {
        const features = await geoapify({
          categories: c.geoapify,
          filter: `circle:${stay.lng},${stay.lat},2000`,
          bias: `proximity:${stay.lng},${stay.lat}`,
          limit: "20",
        });
        return features
          .filter(({ properties: p }) => p.name && p.place_id)
          .map(({ properties: p }): Nearby => ({
            id: p.place_id,
            name: p.name,
            category: c.id,
            lat: p.lat,
            lng: p.lon,
            distanceM: Math.round(p.distance ?? 0),
          }));
      }),
    );
    return lists.flat();
  });
}


export function getPhotos(lat: number, lng: number): Promise<Photo[]> {
  return cached(`photos:${lat.toFixed(3)},${lng.toFixed(3)}`, async () => {
    try {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "geosearch",
        ggscoord: `${lat}|${lng}`,
        ggsradius: "800",
        ggsnamespace: "6",
        ggslimit: "20",
        prop: "imageinfo|categories",
        cllimit: "max",
        iiprop: "url|mime|size|extmetadata",
        iiurlwidth: "900",
        iiextmetadatafilter: "LicenseShortName|Artist",
      });
      const res = await fetch(`${COMMONS}?${params}`, {
        headers: { "User-Agent": USER_AGENT },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const pages: any[] = Object.values((await res.json()).query?.pages ?? {});
      const notAPlace = /bird|aves|animal|insect|plant|flower|butterfl|species|fauna|flora|taxon|map|logo|diagram/i;
      return pages
        .filter((p) => {
          const info = p.imageinfo?.[0];
          const cats = (p.categories ?? []).map((c: { title: string }) => c.title).join(" ");
          return info?.mime === "image/jpeg" && info.width >= 800 && info.width > info.height && !notAPlace.test(`${p.title} ${cats}`);
        })
        .slice(0, 6)
        .map((p): Photo => {
          const info = p.imageinfo[0];
          const meta = info.extmetadata ?? {};
          return {
            url: info.thumburl,
            author: String(meta.Artist?.value ?? "Unknown").replace(/<[^>]+>/g, "").trim(),
            license: meta.LicenseShortName?.value ?? "",
            page: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
          };
        });
    } catch {
      return [];
    }
  });
}