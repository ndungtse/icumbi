import Link from "next/link";
import { AreaSearch } from "@/components/AreaSearch";
import { pill } from "@/components/ui";
import { AREAS, PHOTO_CREDITS } from "@/lib/data";

const featured = AREAS.filter((a) => a.photo);
const others = AREAS.filter((a) => !a.photo);

export default function HomePage() {
  return (
    <>
      <section className="relative isolate flex min-h-[28rem] items-end overflow-hidden bg-primary-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/volcanoes.jpg" alt="The Virunga volcanoes above farmland near Musanze" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-32 text-white">
          <h1 className="max-w-2xl font-bold text-4xl font-semibold leading-tight sm:text-5xl">
            Find a place to stay in Rwanda, and see what&rsquo;s around it
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">
            Hotels and guest houses, with the food, shops, banks and sights within walking distance.
          </p>
          <div className="mt-6">
            <AreaSearch />
          </div>
        </div>
      </section>

      <section id="areas" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14">
        <h2 className="font-bold text-3xl font-semibold">Popular destinations</h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {featured.map((a, i) => (
            <li key={a.id} className={i === 0 ? "col-span-2" : i === 5 || i === 8 ? "md:col-span-2" : ""}>
              <Link href={`/areas/${a.id}`} prefetch={false} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-primary-dark md:aspect-auto md:h-72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/photos/${a.photo}.jpg`} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 font-bold text-xl font-semibold text-white sm:text-2xl">{a.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-bold text-3xl font-semibold">More areas</h2>
        {(["Kigali", "Towns", "Parks and lakes"] as const).map((group) => (
          <div key={group} className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{group}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {others
                .filter((a) => a.group === group)
                .map((a) => (
                  <li key={a.id}>
                    <Link href={`/areas/${a.id}`} prefetch={false} className={`${pill(false)} block`}>
                      {a.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        <p className="mt-14 text-xs text-muted">
          Photos (Wikimedia Commons):{" "}
          {featured.map((a) => `${a.name}: ${PHOTO_CREDITS[a.photo!]}`).join(" · ")}
        </p>
      </section>
    </>
  );
}
