import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";
import {
  REGION_AREAS,
  REGION_PLACES,
  cityForEvent,
  normalizeSearch,
  usePortalEvents,
} from "@/lib/regional-events";
export { RegionalHome } from "./RegionalLanding";

export function RegionalCitiesPage() {
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const [query, setQuery] = useState(""),
    [area, setArea] = useState("");
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      const place = cityForEvent(event);
      if (place) map.set(place.slug, (map.get(place.slug) ?? 0) + 1);
    }
    return map;
  }, [events]);
  const matches = REGION_PLACES.filter(
    (place) =>
      (!area || place.area === area) &&
      normalizeSearch(place.keys.join(" ")).includes(normalizeSearch(query)),
  );
  const cities = matches.filter((place) => place.city),
    villages = matches.filter((place) => !place.city);
  const tiles = (places: typeof matches) => (
    <div className="rd-place-directory">
      {places.map((place) => (
        <Link href={`/varos/${place.slug}`} key={place.slug}>
          <span
            className="rd-place-directory-icon"
            style={{
              color: REGION_AREAS.find((item) => item.slug === place.area)
                ?.color,
            }}
          >
            <MapPin size={23} />
          </span>
          <div>
            <h2>{place.name}</h2>
            <span>
              {isLoading
                ? "Betöltés…"
                : `${counts.get(place.slug) ?? 0} aktuális program`}
            </span>
          </div>
          <ArrowUpRight size={19} />
        </Link>
      ))}
    </div>
  );
  return (
    <section className="rd-container rd-directory-page">
      <span className="rd-page-eyebrow">SZÉKELYFÖLD · TELEPÜLÉSEK</span>
      <h1>Városok és környékük</h1>
      <p>Választhatsz várost, kisebb települést vagy egész térséget is.</p>
      <div className="rd-directory-search">
        <Search size={20} />
        <input
          aria-label="Település keresése"
          type="search"
          placeholder="Település magyar vagy román neve…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="rd-area-directory">
        <button aria-pressed={!area} onClick={() => setArea("")}>
          Minden térség
        </button>
        {REGION_AREAS.map((item) => (
          <button
            key={item.slug}
            aria-pressed={area === item.slug}
            onClick={() => setArea(area === item.slug ? "" : item.slug)}
          >
            <i style={{ background: item.color }} />
            {item.shortName}
          </button>
        ))}
      </div>
      {area && (
        <Link className="rd-open-area" href={`/terseg/${area}`}>
          A térség összes programja együtt <ArrowUpRight size={17} />
        </Link>
      )}
      {isError && (
        <p role="alert">
          A programszámokat nem sikerült betölteni.{" "}
          <button onClick={() => refetch()}>Újrapróbálom</button>
        </p>
      )}
      {cities.length > 0 && (
        <>
          <h2 className="rd-directory-label">Városok</h2>
          {tiles(cities)}
        </>
      )}
      {villages.length > 0 && (
        <>
          <h2 className="rd-directory-label">
            Települések és környékbeli helyek
          </h2>
          {tiles(villages)}
        </>
      )}
      {!matches.length && (
        <div className="rp-empty">
          <h2>Nincs ilyen település a névjegyzékben.</h2>
          <p>
            A nem besorolt eseményeket a további települések között találod.
          </p>
          <Link href="/varos/other">
            További települések <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <p className="rd-directory-note">
        A névjegyzék nem teljes településjegyzék. Más székelyföldi településről
        is beküldhetsz eseményt; a még nem besorolt programok az összes esemény
        között jelennek meg.
      </p>
    </section>
  );
}

export function RegionalSourcesPage() {
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const sources = [
    {
      name: "Visit Harghita",
      url: "https://visitharghita.com/hu/events",
      host: "visitharghita.com",
      area: "Hargita programjai",
    },
    {
      name: "Visit Covasna",
      url: "https://visitcovasna.com/esemenyek?locale=hu",
      host: "visitcovasna.com",
      area: "Háromszéki programok",
    },
    {
      name: "Visit Mureș",
      url: "https://visitmures.com/hu/esemenyek",
      host: "visitmures.com",
      area: "Maros térségének programjai",
    },
  ];
  return (
    <section className="rd-container rd-directory-page">
      <span className="rd-page-eyebrow">PROGRAMADATOK</span>
      <h1>Források és frissítés</h1>
      <p>
        Az események szervezői beküldésekből és nyilvános programnaptárakból
        érkeznek. Minden eseménynél külön megnyitható az eredeti forrás.
      </p>
      {isError && (
        <div className="rp-empty" role="alert">
          A forrásadatok nem töltődtek be.{" "}
          <button onClick={() => refetch()}>Újrapróbálom</button>
        </div>
      )}
      <div className="rd-source-grid">
        {sources.map((source) => {
          const items = events.filter((event) =>
            (event.newsLinks ?? []).some((link) => link.includes(source.host)),
          );
          const updated = items.reduce(
            (latest, event) =>
              Math.max(latest, Date.parse(event.updatedAt ?? event.createdAt)),
            0,
          );
          return (
            <article key={source.host}>
              <span>
                <ExternalLink size={20} />
                {source.area}
              </span>
              <h2>{source.name}</h2>
              <strong>
                {isError
                  ? "Nem elérhető"
                  : isLoading
                    ? "…"
                    : `${items.length} aktuális esemény`}
              </strong>
              <p>
                {isError
                  ? "Az adatkapcsolat jelenleg nem elérhető."
                  : updated
                    ? `Legutóbbi programfrissítés: ${new Date(updated).toLocaleDateString("hu-HU")}`
                    : "Még nincs innen közelgő esemény az adatbázisban."}
              </p>
              <a href={source.url} target="_blank" rel="noreferrer">
                Eredeti naptár <ArrowUpRight size={17} />
              </a>
            </article>
          );
        })}
      </div>
      <div className="rd-source-note">
        <CalendarDays size={25} />
        <div>
          <h2>A programok változhatnak.</h2>
          <p>
            A jegyet, a pontos kezdést és az esetleges változásokat indulás
            előtt az esemény eredeti forrásánál is ellenőrizd. A naptár nem
            jelent teljes körű lefedettséget: más szervezők is ingyen
            beküldhetik programjaikat.
          </p>
        </div>
        <Link href="/bekuldese">
          Program beküldése <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
