import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Notice, PROBLEM } from "@/components/ui";
import { StayBrowser } from "@/components/StayBrowser";
import { getArea, PHOTO_CREDITS } from "@/lib/data";
import { getStays } from "@/lib/places";

export default async function AreaPage({ params }: PageProps<"/areas/[areaId]">) {
  const area = getArea((await params).areaId);
  if (!area) notFound();

  await connection();
  const stays = await getStays(area).catch((err) => {
    console.error("could not load stays", err);
    return null;
  });

  return (
    <>
      <div className="relative isolate overflow-hidden bg-primary-dark">
        {area.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/photos/${area.photo}.jpg`} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" />
        )}
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 text-white">
          <Link href="/" className="text-sm text-white/80 hover:text-white">
            &larr; All areas
          </Link>
          <h1 className="mt-2 text-4xl font-bold">Places to stay in {area.name}</h1>
          {area.photo && <p className="mt-3 text-xs text-white/60">Photo: {PHOTO_CREDITS[area.photo]}</p>}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {stays === null ? (
          <Notice>
            {PROBLEM}{" "}
            <a href={`/areas/${area.id}`} className="font-medium text-primary underline">
              Try again
            </a>
          </Notice>
        ) : stays.length === 0 ? (
          <Notice>No places to stay were found in this area yet.</Notice>
        ) : (
          <StayBrowser stays={stays} area={area} />
        )}
      </div>
    </>
  );
}
