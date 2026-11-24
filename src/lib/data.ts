export type LatLng = { lat: number; lng: number };

export type Area = {
  id: string;
  name: string;
  group: "Kigali" | "Towns" | "Parks and lakes";
  center: LatLng;
  radiusM: number;
  /** File in public/photos (without .jpg); only the main destinations have one. */
  photo?: string;
};

const RADIUS = { Kigali: 1500, Towns: 3000, "Parks and lakes": 5000 } as const;
const area = (id: string, name: string, group: Area["group"], lat: number, lng: number, photo?: string): Area => ({
  id,
  name,
  group,
  center: { lat, lng },
  radiusM: RADIUS[group],
  photo,
});

// Centres come from OpenStreetMap (Nominatim); a few use a landmark inside the area.
export const AREAS: Area[] = [
  area("city-centre", "Kigali City Centre", "Kigali", -1.9438, 30.0593, "kigali"),
  area("kiyovu", "Kiyovu", "Kigali", -1.9497, 30.0659),
  area("kimihurura", "Kimihurura", "Kigali", -1.9528, 30.0818),
  area("kacyiru", "Kacyiru", "Kigali", -1.9369, 30.0788),
  area("remera", "Remera", "Kigali", -1.955, 30.1144),
  area("nyamirambo", "Nyamirambo", "Kigali", -1.9639, 30.0599),
  area("kicukiro", "Kicukiro", "Kigali", -1.9854, 30.1036),
  area("gisozi", "Gisozi", "Kigali", -1.9164, 30.088),
  area("nyarutarama", "Nyarutarama", "Kigali", -1.9383, 30.0965),
  area("kanombe", "Kanombe", "Kigali", -1.9617, 30.1465),

  area("musanze", "Musanze", "Towns", -1.5041, 29.6363, "volcanoes"),
  area("rubavu", "Rubavu (Gisenyi)", "Towns", -1.6935, 29.2599, "gisenyi"),
  area("karongi", "Karongi (Kibuye)", "Towns", -2.0604, 29.3486, "karongi"),
  area("rusizi", "Rusizi (Kamembe)", "Towns", -2.4868, 28.9086, "rusizi"),
  area("huye", "Huye (Butare)", "Towns", -2.6053, 29.7402, "huye"),
  area("muhanga", "Muhanga", "Towns", -2.0845, 29.7529),
  area("nyanza", "Nyanza", "Towns", -2.3525, 29.7505, "nyanza"),
  area("rwamagana", "Rwamagana", "Towns", -1.9512, 30.4349),
  area("kayonza", "Kayonza", "Towns", -1.905, 30.5102),
  area("nyagatare", "Nyagatare", "Towns", -1.2986, 30.3295),

  area("kinigi", "Kinigi (Volcanoes National Park)", "Parks and lakes", -1.4331, 29.5552),
  area("gisakura", "Gisakura (Nyungwe)", "Parks and lakes", -2.4361, 29.0911, "nyungwe"),
  area("rwinkwavu", "Rwinkwavu (Akagera)", "Parks and lakes", -1.9593, 30.6152, "akagera"),
];

export const getArea = (id: string) => AREAS.find((a) => a.id === id);

// Photos are from Wikimedia Commons; the licence requires crediting the author.
export const PHOTO_CREDITS: Record<string, string> = {
  kigali: "Honeybarger, CC BY-SA 4.0",
  volcanoes: "Nina R, CC BY 2.0",
  gisenyi: "Davyimage, CC BY-SA 4.0",
  karongi: "Adam Jones, CC BY-SA 3.0",
  nyungwe: "Alex Niragira, CC BY-SA 4.0",
  akagera: "Emery045, CC BY-SA 4.0",
  huye: "Diego Tirira, CC BY-SA 2.0",
  nyanza: "Guswen, CC BY 3.0",
  rusizi: "Fanny Schertzer, CC BY 3.0",
};

export type Stay = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  address: string;
  website?: string;
  phone?: string;
  image?: string;
};

export const STAY_TYPES: Record<string, string> = {
  hotel: "Hotel",
  guest_house: "Guest house",
  hostel: "Hostel",
  motel: "Motel",
  apartment: "Apartment",
  chalet: "Chalet",
  hut: "Hut",
};

export type CategoryId = "food" | "shops" | "money" | "health" | "transport" | "sights";

/** Geoapify place categories behind each "what's nearby" tab. */
export const CATEGORIES: { id: CategoryId; label: string; geoapify: string }[] = [
  { id: "food", label: "Food", geoapify: "catering" },
  { id: "shops", label: "Shops", geoapify: "commercial" },
  { id: "money", label: "Money", geoapify: "service.financial" },
  { id: "health", label: "Health", geoapify: "healthcare" },
  { id: "transport", label: "Transport", geoapify: "public_transport" },
  { id: "sights", label: "Sights", geoapify: "tourism,entertainment.museum,leisure.park" },
];

export type Nearby = { id: string; name: string; category: CategoryId; lat: number; lng: number; distanceM: number };

export type Photo = { url: string; author: string; license: string; page: string };

export function formatDistance(m: number): string {
  const rounded = Math.round(m / 10) * 10;
  return rounded < 1000 ? `${rounded} m` : `${(m / 1000).toFixed(1)} km`;
}

export function distanceM(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}
