import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useLocation, useParams, useSearch } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Search,
  SlidersHorizontal,
  Ticket,
  X,
} from "lucide-react";
import { RegionalEventCard, RegionalPoster } from "./RegionalPortal";
import { FavoriteButton } from "./events/FavoriteButton";
import {
  REGION_AREAS,
  REGION_PLACES,
  REGION_CITIES,
  cityForEvent,
  normalizeSearch,
  usePortalEvents,
  type RegionEvent,
} from "@/lib/regional-events";
import {
  matchesDiscoveryEvent,
  sortDiscoveryEvents,
  DISCOVERY_DATES,
} from "../../../../shared/event-discovery.mjs";
import { eventDateKey } from "../../../../shared/event-time.mjs";
import { formatShortDate, formatTime } from "@/utils/date-format";

const DATES = [
  { value: "all", name: "Bármikor" },
  { value: "today", name: "Ma" },
  { value: "tomorrow", name: "Holnap" },
  { value: "week", name: "Ezen a héten" },
  { value: "weekend", name: "Hétvégén" },
  { value: "next-week", name: "Jövő héten" },
  { value: "month", name: "Ebben a hónapban" },
];
const isDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

function LocationOptions() {
  return (
    <>
      {REGION_AREAS.map((area) => (
        <optgroup key={area.slug} label={area.name}>
          {REGION_PLACES.filter((place) => place.area === area.slug).map(
            (place) => (
              <option key={place.slug} value={place.slug}>
                {place.name}
              </option>
            ),
          )}
        </optgroup>
      ))}
      <option value="other">További települések</option>
    </>
  );
}

function PosterShowcase({
  events,
  isLoading,
}: {
  events: RegionEvent[];
  isLoading: boolean;
}) {
  const [page, setPage] = useState(0);
  const choices = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) =>
        Number(b.promotionStatus === "paid") -
          Number(a.promotionStatus === "paid") ||
        Number(b.featured) - Number(a.featured) ||
        Number(Date.parse(a.startDate) < Date.now()) -
          Number(Date.parse(b.startDate) < Date.now()) ||
        (Date.parse(a.startDate) < Date.now()
          ? Date.parse(b.startDate) - Date.parse(a.startDate)
          : Date.parse(a.startDate) - Date.parse(b.startDate)),
    );
    const seen = new Set<string>(),
      opening: RegionEvent[] = [];
    for (const event of sorted) {
      const place = cityForEvent(event)?.slug ?? event.location;
      if (!seen.has(place)) {
        seen.add(place);
        opening.push(event);
      }
      if (opening.length === 4) break;
    }
    return [
      ...opening,
      ...sorted.filter(
        (event) => !opening.some((item) => item.id === event.id),
      ),
    ].slice(0, 16);
  }, [events]);
  useEffect(() => setPage(0), [events]);
  if (!isLoading && !choices.length) return null;
  const start = Math.min(page * 4, Math.max(0, choices.length - 4));
  const visible = choices.slice(start, start + 4);
  return (
    <section className="rd-showcase" aria-labelledby="rd-picks-heading">
      <div className="rd-showcase-head">
        <div>
          <span className="rd-live-dot" />
          <h2 id="rd-picks-heading">Ajánló</h2>
          <span>Programok többfelől.</span>
        </div>
        <div className="rd-gallery-controls">
          <span>
            {choices.length
              ? `${start + 1}–${Math.min(start + 4, choices.length)} / ${choices.length}`
              : ""}
          </span>
          <button
            aria-label="Előző ajánlott események"
            disabled={page === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            <ChevronLeft size={19} />
          </button>
          <button
            aria-label="Következő ajánlott események"
            disabled={start + 4 >= choices.length}
            onClick={() => setPage((value) => value + 1)}
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
      <div className="rd-poster-shelf">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <div className="rd-pick rd-pick-skeleton rp-loading" key={i} />
            ))
          : visible.map((event, index) => (
              <article key={event.id} className={`rd-pick rd-tone-${index}`}>
                <Link href={`/esemeny/${event.id}`}>
                  <div className="rd-pick-image">
                    <RegionalPoster event={event} priority={index < 2} />
                    <span className="rd-pick-category">
                      {event.promotionStatus === "paid"
                        ? "Kiemelt · hirdetés"
                        : (event.category?.name ?? "Program")}
                    </span>
                  </div>
                  <div className="rd-pick-caption">
                    <span>
                      {Date.parse(event.startDate) < Date.now() && event.endDate
                        ? `${formatShortDate(event.endDate).replace(/\.$/, "")}-ig`
                        : formatShortDate(event.startDate)}
                      <i /> {cityForEvent(event)?.name ?? event.location}
                    </span>
                    <h3>{event.title}</h3>
                    <span className="rd-pick-arrow">
                      <ArrowUpRight size={21} />
                    </span>
                  </div>
                </Link>
                <FavoriteButton eventId={event.id} className="rd-pick-save" />
              </article>
            ))}
      </div>
    </section>
  );
}

export function RegionalHome() {
  const { slug, area: routeArea } = useParams<{
    slug?: string;
    area?: string;
  }>();
  const search = useSearch(),
    [, navigate] = useLocation(),
    params = new URLSearchParams(search);
  const city = slug ?? params.get("varos") ?? "",
    area = routeArea ?? params.get("terseg") ?? "",
    query = params.get("q") ?? "";
  const date = DISCOVERY_DATES.includes(params.get("mikor") ?? "")
    ? params.get("mikor")!
    : "all";
  const category = params.get("kategoria") ?? "",
    free = params.get("ingyenes") === "1",
    nearby = params.get("kornyeke") === "1";
  const day = isDay(params.get("nap") ?? "") ? params.get("nap")! : "",
    from = isDay(params.get("tol") ?? "") ? params.get("tol")! : "",
    to = isDay(params.get("ig") ?? "") ? params.get("ig")! : "";
  const order = params.get("rendezes") === "newest" ? "newest" : "date";
  const [visible, setVisible] = useState(12),
    [filtersOpen, setFiltersOpen] = useState(false),
    [placeSearch, setPlaceSearch] = useState(""),
    [weekOffset, setWeekOffset] = useState(0);
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const selectedPlace = REGION_PLACES.find((place) => place.slug === city),
    selectedArea = REGION_AREAS.find((item) => item.slug === area);
  const cityLabel =
    city === "csik-kornyeke"
      ? "Csík környéke"
      : city === "other"
        ? "További települések"
        : selectedPlace?.name;
  const basePath = slug
    ? `/varos/${slug}`
    : routeArea
      ? `/terseg/${routeArea}`
      : "/";
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    navigate(`${basePath}${next.size ? `?${next}` : ""}`, { replace: true });
  }
  function selectPlace(value: string) {
    const next = new URLSearchParams(search);
    ["varos", "terseg", "kornyeke"].forEach((key) => next.delete(key));
    navigate(
      `${value ? `/varos/${value}` : "/"}${next.size ? `?${next}` : ""}`,
    );
  }
  function selectArea(value: string) {
    const next = new URLSearchParams(search);
    ["varos", "terseg", "kornyeke"].forEach((key) => next.delete(key));
    navigate(
      `${value ? `/terseg/${value}` : "/"}${next.size ? `?${next}` : ""}`,
    );
  }
  const reset = () => {
    navigate(basePath, { replace: true });
    setPlaceSearch("");
  };
  const placeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      const place = cityForEvent(event);
      if (place) counts.set(place.slug, (counts.get(place.slug) ?? 0) + 1);
    }
    return counts;
  }, [events]);
  const areaCounts = useMemo(
    () =>
      new Map(
        REGION_AREAS.map((item) => [
          item.slug,
          events.filter((event) => cityForEvent(event)?.area === item.slug)
            .length,
        ]),
      ),
    [events],
  );
  const scoped = useMemo(
    () =>
      events.filter((event) =>
        matchesDiscoveryEvent(event, { city, area, nearby }),
      ),
    [events, city, area, nearby],
  );
  const categories = useMemo(
    () =>
      [
        { slug: "program", name: "Program", color: "#5f66a5" },
        ...new Map(
          scoped.flatMap((event) =>
            event.category
              ? [[event.category.slug, event.category] as const]
              : [],
          ),
        ).values(),
      ].filter(
        (item, index, array) =>
          array.findIndex((other) => other.slug === item.slug) === index &&
          scoped.some(
            (event) => (event.category?.slug ?? "program") === item.slug,
          ),
      ),
    [scoped],
  );
  const filtered = useMemo(
    () =>
      sortDiscoveryEvents(
        events.filter((event) =>
          matchesDiscoveryEvent(event, {
            city,
            area,
            nearby,
            query,
            category,
            free,
            date,
            day,
            from,
            to,
          }),
        ),
        order,
      ),
    [
      events,
      city,
      area,
      nearby,
      query,
      category,
      free,
      date,
      day,
      from,
      to,
      order,
    ],
  );
  const browsePlaces = REGION_PLACES.filter(
    (place) =>
      (!area || place.area === area) &&
      (!placeSearch ||
        normalizeSearch(place.keys.join(" ")).includes(
          normalizeSearch(placeSearch),
        )),
  )
    .sort(
      (a, b) =>
        Number(b.city) - Number(a.city) ||
        (placeCounts.get(b.slug) ?? 0) - (placeCounts.get(a.slug) ?? 0) ||
        a.name.localeCompare(b.name, "hu"),
    )
    .slice(0, placeSearch ? 20 : 9);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const d = new Date(eventDateKey(new Date()) + "T12:00:00");
        d.setDate(d.getDate() + weekOffset * 7 + index);
        const key = eventDateKey(d);
        return {
          key,
          label: d.toLocaleDateString("hu-HU", { weekday: "short" }),
          number: d.getDate(),
          month: d.toLocaleDateString("hu-HU", { month: "short" }),
          count: scoped.filter((event) =>
            matchesDiscoveryEvent(event, { day: key }),
          ).length,
        };
      }),
    [scoped, weekOffset],
  );
  const filtersActive = Boolean(
    query ||
    category ||
    free ||
    nearby ||
    date !== "all" ||
    day ||
    from ||
    to ||
    (!slug && city) ||
    (!routeArea && area),
  );
  useEffect(() => setVisible(12), [search, slug, routeArea]);
  useEffect(() => {
    document.title = `${cityLabel ? `${cityLabel} programjai` : selectedArea ? selectedArea.name : "Székelyföld eseményei"} – Programtér`;
  }, [cityLabel, selectedArea]);
  if ((slug && !cityLabel) || (routeArea && !selectedArea))
    return (
      <div className="rp-empty">
        <h1>A település vagy térség nem található.</h1>
        <Link href="/varosok">Települések megnyitása</Link>
      </div>
    );
  return (
    <div className="rd-discovery">
      <section className="rd-top">
        <div className="rd-container">
          <div className="rd-title-row">
            <div>
              <p>
                <span /> SZÉKELYFÖLD · ESEMÉNYEK
              </p>
              <h1>
                {cityLabel ? (
                  <>
                    {cityLabel}
                    <span> programjai</span>
                  </>
                ) : selectedArea ? (
                  selectedArea.name
                ) : (
                  <>
                    Székelyföld<span> programjai</span>
                  </>
                )}
              </h1>
            </div>
            <Link href="/naptar" className="rd-calendar-pill">
              <CalendarDays size={18} />
              <span>Programnaptár</span>
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <form
            className="rd-finder"
            onSubmit={(event) => {
              event.preventDefault();
              document
                .getElementById("programok")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <label className="rd-finder-query">
              <Search size={21} />
              <span>
                <small>MIT KERESEL?</small>
                <input
                  aria-label="Esemény keresése"
                  type="search"
                  placeholder="Program, előadó, szervező…"
                  value={query}
                  onChange={(event) => update({ q: event.target.value })}
                />
              </span>
            </label>
            <label>
              <MapPin size={20} />
              <span>
                <small>HOL?</small>
                <select
                  aria-label="Város vagy település kiválasztása"
                  value={city}
                  onChange={(event) => selectPlace(event.target.value)}
                >
                  <option value="">Egész Székelyföld</option>
                  {city === "csik-kornyeke" && (
                    <option value="csik-kornyeke">Csík környéke</option>
                  )}
                  <LocationOptions />
                </select>
              </span>
              <ChevronDown size={14} />
            </label>
            <label>
              <CalendarDays size={20} />
              <span>
                <small>MIKOR?</small>
                <select
                  aria-label="Időpont kiválasztása"
                  value={date}
                  onChange={(event) =>
                    update({
                      mikor:
                        event.target.value === "all" ? "" : event.target.value,
                      nap: "",
                      tol: "",
                      ig: "",
                    })
                  }
                >
                  {DATES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </span>
              <ChevronDown size={14} />
            </label>
            <button type="submit" className="rd-find-button">
              Mutasd <ArrowRight size={19} />
            </button>
          </form>
          <PosterShowcase events={scoped} isLoading={isLoading} />
        </div>
      </section>
      <section className="rd-container rd-browser" id="programok">
        <div className="rd-browser-title">
          <div>
            <h2>
              {day
                ? new Date(day + "T12:00:00").toLocaleDateString("hu-HU", {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })
                : "Böngéssz a programok között"}
            </h2>
            <p aria-live="polite">
              {isLoading
                ? "Események betöltése…"
                : `${filtered.length} aktuális esemény`}
              {cityLabel
                ? ` · ${cityLabel}`
                : selectedArea
                  ? ` · ${selectedArea.name}`
                  : " · egész Székelyföld"}
            </p>
          </div>
          <button
            className="rd-mobile-filter"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={17} /> Szűrők
          </button>
          <label className="rd-sort">
            <span>Rendezés:</span>
            <select
              aria-label="Események rendezése"
              value={order}
              onChange={(event) =>
                update({
                  rendezes:
                    event.target.value === "date" ? "" : event.target.value,
                })
              }
            >
              <option value="date">Időpont szerint</option>
              <option value="newest">Újonnan felkerült</option>
            </select>
          </label>
        </div>
        <div className="rd-browse-layout">
          <aside
            className={`rd-sidebar${filtersOpen ? " is-open" : ""}`}
            aria-label="Regionális eseményszűrők"
          >
            <div className="rd-side-head">
              <SlidersHorizontal size={17} />
              <h3>Szűkítsd a keresést</h3>
              <button onClick={reset} aria-label="Összes szűrő törlése">
                <X size={15} />
              </button>
            </div>
            <fieldset>
              <legend>Térség</legend>
              <button
                className="rd-area-all"
                aria-pressed={!area}
                onClick={() => selectArea("")}
              >
                Egész Székelyföld<span>{events.length}</span>
              </button>
              {REGION_AREAS.map((item) => (
                <button
                  className="rd-area"
                  key={item.slug}
                  aria-pressed={area === item.slug}
                  onClick={() =>
                    selectArea(area === item.slug ? "" : item.slug)
                  }
                >
                  <i style={{ background: item.color }} />
                  {item.shortName}
                  <span>{areaCounts.get(item.slug) ?? 0}</span>
                </button>
              ))}
            </fieldset>
            <fieldset>
              <legend>Település</legend>
              <label className="rd-place-search">
                <Search size={15} />
                <input
                  type="search"
                  aria-label="Település keresése"
                  placeholder="Város vagy falu neve…"
                  value={placeSearch}
                  onChange={(event) => setPlaceSearch(event.target.value)}
                />
              </label>
              <div className="rd-place-list">
                {browsePlaces.map((place) => (
                  <button
                    key={place.slug}
                    aria-pressed={city === place.slug}
                    onClick={() =>
                      selectPlace(city === place.slug ? "" : place.slug)
                    }
                  >
                    {place.name}
                    <span>{placeCounts.get(place.slug) ?? 0}</span>
                  </button>
                ))}
                {!browsePlaces.length && (
                  <p>Nincs ilyen település a listában.</p>
                )}
              </div>
              <Link href="/varosok" className="rd-all-places">
                Minden település <ArrowUpRight size={14} />
              </Link>
              {selectedPlace && (
                <label className="rd-check">
                  <input
                    type="checkbox"
                    checked={nearby}
                    onChange={(event) =>
                      update({ kornyeke: event.target.checked ? "1" : "" })
                    }
                  />
                  <span>A térség többi települése is</span>
                </label>
              )}
            </fieldset>
            <fieldset>
              <legend>Belépés</legend>
              <label className="rd-check">
                <input
                  type="checkbox"
                  checked={free}
                  onChange={(event) =>
                    update({ ingyenes: event.target.checked ? "1" : "" })
                  }
                />
                <span>Csak ingyenes programok</span>
              </label>
            </fieldset>
            <fieldset>
              <legend>Pontos időszak</legend>
              <label className="rd-date-field">
                Ettől
                <input
                  type="date"
                  aria-label="Időszak kezdete"
                  value={from}
                  onChange={(event) =>
                    update({ tol: event.target.value, nap: "", mikor: "" })
                  }
                />
              </label>
              <label className="rd-date-field">
                Eddig
                <input
                  type="date"
                  aria-label="Időszak vége"
                  min={from || undefined}
                  value={to}
                  onChange={(event) =>
                    update({ ig: event.target.value, nap: "", mikor: "" })
                  }
                />
              </label>
            </fieldset>
            <Link href="/bekuldese" className="rd-sidebar-submit">
              <Ticket size={23} />
              <strong>Saját eseményed van?</strong>
              <span>Ingyen beküldheted.</span>
              <ArrowUpRight size={18} />
            </Link>
          </aside>
          <div className="rd-main-results">
            <div className="rd-time-row">
              <div className="rd-date-presets">
                {DATES.slice(0, 5).map((item) => (
                  <button
                    key={item.value}
                    aria-pressed={!day && !from && !to && date === item.value}
                    onClick={() =>
                      update({
                        mikor: item.value === "all" ? "" : item.value,
                        nap: "",
                        tol: "",
                        ig: "",
                      })
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="rd-week-control">
                <button
                  aria-label="Előző hét napjai"
                  disabled={weekOffset === 0}
                  onClick={() =>
                    setWeekOffset((value) => Math.max(0, value - 1))
                  }
                >
                  <ChevronLeft size={16} />
                </button>
                <span>
                  {days[0].month} {days[0].number}–{days[6].number}.
                </span>
                <button
                  aria-label="Következő hét napjai"
                  onClick={() => setWeekOffset((value) => value + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="rd-day-row" aria-label="Programok nap szerint">
              {days.map((item) => (
                <button
                  key={item.key}
                  aria-label={`${item.key}, ${item.count} esemény`}
                  aria-pressed={day === item.key}
                  onClick={() =>
                    update({
                      nap: day === item.key ? "" : item.key,
                      mikor: "",
                      tol: "",
                      ig: "",
                    })
                  }
                >
                  <span>{item.label}</span>
                  <strong>{item.number}</strong>
                  <small>{item.count} program</small>
                </button>
              ))}
            </div>
            <div className="rd-category-tabs" aria-label="Eseménykategóriák">
              <button
                aria-pressed={!category}
                onClick={() => update({ kategoria: "" })}
              >
                Minden kategória
              </button>
              {categories.map((item) => (
                <button
                  key={item.slug}
                  aria-pressed={category === item.slug}
                  onClick={() =>
                    update({
                      kategoria: category === item.slug ? "" : item.slug,
                    })
                  }
                >
                  <i style={{ background: item.color }} />
                  {item.name}
                </button>
              ))}
            </div>
            {filtersActive && (
              <div className="rd-active-filters">
                <span>
                  <Check size={13} /> Szűrt találatok
                </span>
                {query && <span>„{query}”</span>}
                {free && <span>Ingyenes</span>}
                {nearby && <span>Környék is</span>}
                {from && (
                  <span>
                    {from}–{to || "…"}
                  </span>
                )}
                <button onClick={reset}>
                  Szűrők törlése <X size={13} />
                </button>
              </div>
            )}
            {from && to && to < from ? (
              <div role="alert" className="rp-empty">
                <h3>A zárónap korábbi a kezdőnapnál.</h3>
                <p>Módosítsd a keresett időszakot.</p>
                <button onClick={() => update({ ig: "" })}>
                  Zárónap törlése
                </button>
              </div>
            ) : isLoading ? (
              <div className="rd-event-grid">
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="rp-card-skeleton rp-loading" key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="rp-empty" role="alert">
                <h3>Az események nem töltődtek be.</h3>
                <button onClick={() => refetch()}>Újrapróbálom</button>
              </div>
            ) : filtered.length ? (
              <div className="rd-event-grid">
                {filtered.slice(0, visible).map((event) => (
                  <RegionalEventCard event={event} key={event.id} />
                ))}
              </div>
            ) : (
              <div className="rp-empty">
                <Search size={33} />
                <h3>Erre most nincs találat.</h3>
                <p>
                  Válassz másik napot vagy térséget. A még nem besorolt
                  programokat az összes esemény között is eléred.
                </p>
                <button onClick={reset}>Szűrők törlése</button>
                <Link href="/">
                  Egész Székelyföld programjai <ArrowRight size={15} />
                </Link>
              </div>
            )}
            {filtered.length > visible && (
              <div className="rd-more">
                <button onClick={() => setVisible((value) => value + 12)}>
                  További programok <ArrowRight size={17} />
                </button>
                <span>
                  {Math.min(visible, filtered.length)} / {filtered.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="rd-organizer">
        <div className="rd-container">
          <div className="rd-organizer-art">
            <Ticket size={48} />
          </div>
          <div>
            <span>SZERVEZŐKNEK</span>
            <h2>Kerüljön fel a te eseményed is.</h2>
            <p>
              Ingyenes beküldés, saját profil, több esemény kezelése. A
              kiemelést külön kérheted, eseményenként.
            </p>
          </div>
          <Link href="/szervezoi-felulet">
            Szervezői belépés <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}

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
