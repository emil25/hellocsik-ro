import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useLocation, useParams, useSearch } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { RegionalEventCard, RegionalPoster } from "./RegionalPortal";
import { FavoriteButton } from "./events/FavoriteButton";
import {
  REGION_AREAS,
  REGION_PLACES,
  cityForEvent,
  usePortalEvents,
  type RegionEvent,
} from "@/lib/regional-events";
import {
  matchesDiscoveryEvent,
  sortDiscoveryEvents,
  DISCOVERY_DATES,
} from "../../../../shared/event-discovery.mjs";
import { getEventPriceLabel } from "@/lib/event-links";
import { formatShortDate, formatTime } from "@/utils/date-format";
import "./regional-landing.css";

const DATES = [
  { value: "all", name: "Bármikor" },
  { value: "today", name: "Ma" },
  { value: "tomorrow", name: "Holnap" },
  { value: "week", name: "Ezen a héten" },
  { value: "weekend", name: "Hétvégén" },
  { value: "next-week", name: "Jövő héten" },
  { value: "month", name: "Ebben a hónapban" },
];
const dayValue = (value: string | null) =>
  value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
const programDate = (event: RegionEvent) =>
  Date.parse(event.startDate) < Date.now() && event.endDate
    ? `${formatShortDate(event.endDate).replace(/\.$/, "")}-ig`
    : formatShortDate(event.startDate);
const isPaid = (event: RegionEvent) =>
  event.promotionStatus === "paid" && event.promotionPlan !== "free";
const goToPrograms = () =>
  document
    .getElementById("programok")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

function PlaceOptions() {
  return (
    <>
      {REGION_AREAS.map((area) => (
        <optgroup key={area.slug} label={area.name}>
          {REGION_PLACES.filter((place) => place.area === area.slug).map(
            (place) => (
              <option value={place.slug} key={place.slug}>
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

function StoryCard({
  event,
  kind = "side",
  index = 0,
}: {
  event: RegionEvent;
  kind?: "main" | "side" | "weekend";
  index?: number;
}) {
  return (
    <article className={`rl-story rl-story-${kind} rl-story-${index}`}>
      <Link href={`/esemeny/${event.id}`} className="rl-story-link">
        <div className="rl-story-image">
          <RegionalPoster event={event} priority={kind !== "weekend"} />
          <span className="rl-story-tag">
            {isPaid(event)
              ? "Kiemelt · hirdetés"
              : (event.category?.name ?? "Program")}
          </span>
        </div>
        <div className="rl-story-copy">
          <p>
            <span>{programDate(event)}</span>
            <i />
            {cityForEvent(event)?.name ?? event.location}
          </p>
          <h3>{event.title}</h3>
          {kind === "main" && (
            <span className="rl-story-details">
              Részletek <ArrowUpRight size={17} />
            </span>
          )}
          {kind === "weekend" && (
            <span className="rl-story-price">
              {getEventPriceLabel(event)} <ArrowUpRight size={18} />
            </span>
          )}
        </div>
      </Link>
      <FavoriteButton eventId={event.id} className="rl-story-save" />
    </article>
  );
}

function RegionalHero({
  events,
  isLoading,
  cityLabel,
  areaLabel,
  onDate,
}: {
  events: RegionEvent[];
  isLoading: boolean;
  cityLabel?: string;
  areaLabel?: string;
  onDate: (value: string) => void;
}) {
  const [active, setActive] = useState(0);
  const picks = useMemo(() => {
    const sorted = sortDiscoveryEvents(events).sort(
      (a, b) =>
        Number(isPaid(b)) - Number(isPaid(a)) ||
        Number(b.featured) - Number(a.featured) ||
        Number(Date.parse(a.startDate) < Date.now()) -
          Number(Date.parse(b.startDate) < Date.now()),
    );
    const opening: RegionEvent[] = [],
      towns = new Set<string>();
    for (const event of sorted) {
      const town = cityForEvent(event)?.slug ?? event.location;
      if (!towns.has(town)) {
        opening.push(event);
        towns.add(town);
      }
      if (opening.length === 6) break;
    }
    return [
      ...opening,
      ...sorted.filter(
        (event) => !opening.some((item) => item.id === event.id),
      ),
    ].slice(0, 9);
  }, [events]);
  useEffect(() => setActive(0), [events]);
  const current = active % Math.max(1, picks.length),
    main = picks[current],
    left = picks.length > 1 ? picks[(current + 1) % picks.length] : undefined,
    right = picks.length > 2 ? picks[(current + 2) % picks.length] : undefined;
  return (
    <section className="rl-hero" aria-labelledby="rl-hero-heading">
      <span className="rl-hero-orbit rl-orbit-one" aria-hidden="true" />
      <span className="rl-hero-orbit rl-orbit-two" aria-hidden="true" />
      <div className="rl-hero-top rl-container">
        <span className="rl-eyebrow">
          <i /> SZÉKELYFÖLD · PROGRAMTÉR
        </span>
        <Link href="/naptar">
          Programnaptár <CalendarDays size={16} />
        </Link>
      </div>
      <div
        className={`rl-hero-heading${(cityLabel ?? areaLabel ?? "").length > 15 ? " rl-long-heading" : ""}`}
      >
        <h1 id="rl-hero-heading">
          {cityLabel ?? areaLabel ?? "Székelyföld"}
          <span>
            programjai<span className="rl-heading-dot">.</span>
          </span>
        </h1>
        <div className="rl-hero-shortcuts">
          <button
            onClick={() => {
              onDate("today");
            }}
          >
            Ma <ArrowUpRight size={15} />
          </button>
          <button
            onClick={() => {
              onDate("weekend");
            }}
          >
            Hétvégén <ArrowUpRight size={15} />
          </button>
          <button onClick={goToPrograms}>
            Minden program <ArrowDown size={15} />
          </button>
        </div>
      </div>
      <div
        className={`rl-stage rl-container${!right ? " rl-stage-small" : ""}`}
      >
        {isLoading ? (
          <div className="rl-hero-loading" aria-label="Képes ajánló betöltése">
            <span />
            <span />
            <span />
          </div>
        ) : main ? (
          <>
            {left && (
              <div className="rl-stage-left">
                <StoryCard event={left} index={1} />
                <span className="rl-floating-note">
                  <MapPin size={15} />
                  {cityForEvent(left)?.name ?? "Székelyföld"}
                </span>
              </div>
            )}
            <div className="rl-stage-main" key={main.id}>
              <StoryCard event={main} kind="main" />
            </div>
            {right && (
              <div className="rl-stage-right">
                <div className="rl-stage-stamp" aria-hidden="true">
                  <Sparkles size={24} />
                  <span>
                    PROGRAM
                    <br />
                    AJÁNLÓ
                  </span>
                </div>
                <StoryCard event={right} index={2} />
              </div>
            )}
          </>
        ) : (
          <div className="rl-hero-empty">
            <CalendarDays size={45} />
            <p>Erre a helyre most nincs közelgő program.</p>
            <Link href="/">
              Egész Székelyföld programjai <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
      {picks.length > 1 && (
        <div className="rl-hero-controls">
          <button
            onClick={() =>
              setActive((value) => (value - 1 + picks.length) % picks.length)
            }
            aria-label="Előző kiemelt program"
          >
            <ChevronLeft size={19} />
          </button>
          <span>
            {String(current + 1).padStart(2, "0")}
            <i /> {String(picks.length).padStart(2, "0")}
          </span>
          <button
            onClick={() => setActive((value) => (value + 1) % picks.length)}
            aria-label="Következő kiemelt program"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      )}
    </section>
  );
}

function WeeklySelection({
  events,
  onDate,
}: {
  events: RegionEvent[];
  onDate: (value: string) => void;
}) {
  const week = sortDiscoveryEvents(
    events.filter((event) => matchesDiscoveryEvent(event, { date: "week" })),
  )
    .filter((event) => Date.parse(event.startDate) >= Date.now())
    .slice(0, 4);
  const weekendChoices = sortDiscoveryEvents(
    events.filter((event) => matchesDiscoveryEvent(event, { date: "weekend" })),
  ).sort(
    (a, b) =>
      Number(Date.parse(a.startDate) < Date.now()) -
      Number(Date.parse(b.startDate) < Date.now()),
  );
  const first = weekendChoices[0],
    second =
      weekendChoices.find(
        (event) =>
          event.id !== first?.id &&
          cityForEvent(event)?.slug !==
            (first ? cityForEvent(first)?.slug : undefined),
      ) ?? weekendChoices[1];
  const weekend = [first, second].filter((event): event is RegionEvent =>
    Boolean(event),
  );

  if (week.length < 3 && weekend.length < 2) return null;
  return (
    <>
      {week.length >= 3 && (
        <section
          className="rl-container rl-week-section"
          aria-labelledby="rl-week-heading"
        >
          <div className="rl-section-title">
            <div>
              <span className="rl-eyebrow">KÖZELGŐ PROGRAMOK</span>
              <h2 id="rl-week-heading">Ezen a héten</h2>
            </div>
            <button
              onClick={() => {
                onDate("week");
              }}
            >
              A hét összes programja <ArrowUpRight size={19} />
            </button>
          </div>
          <div className="rl-week-mosaic">
            {week.map((event, index) => (
              <article
                key={event.id}
                className={`rl-week-card rl-week-card-${index}`}
              >
                <Link href={`/esemeny/${event.id}`}>
                  <div className="rl-week-image">
                    <RegionalPoster event={event} />
                    <span className="rl-week-date">{programDate(event)}</span>
                  </div>
                  <div className="rl-week-copy">
                    <span>{cityForEvent(event)?.name ?? event.location}</span>
                    <h3>{event.title}</h3>
                    <span className="rl-week-time">
                      {formatTime(event.startDate)}
                      <ArrowUpRight size={19} />
                    </span>
                  </div>
                </Link>
                <FavoriteButton eventId={event.id} className="rl-story-save" />
              </article>
            ))}
          </div>
        </section>
      )}
      {weekend.length >= 2 && (
        <section className="rl-weekend" aria-labelledby="rl-weekend-heading">
          <div className="rl-container rl-weekend-layout">
            <div className="rl-weekend-intro">
              <span className="rl-eyebrow">PÉNTEK · SZOMBAT · VASÁRNAP</span>
              <h2 id="rl-weekend-heading">
                A hétvége
                <br />
                <em>programjai.</em>
              </h2>
              <p>
                Koncert, kirándulás, színház vagy közös program — nézd meg,
                miből választhatsz.
              </p>
              <button
                onClick={() => {
                  onDate("weekend");
                }}
              >
                Mutasd a hétvégét <ArrowUpRight size={20} />
              </button>
              <span className="rl-weekend-doodle" aria-hidden="true">
                ↗
              </span>
            </div>
            <div className="rl-weekend-cards">
              {weekend.map((event, index) => (
                <StoryCard
                  key={event.id}
                  event={event}
                  kind="weekend"
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
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
    query = params.get("q") ?? "",
    category = params.get("kategoria") ?? "";
  const date = DISCOVERY_DATES.includes(params.get("mikor") ?? "")
      ? params.get("mikor")!
      : "all",
    free = params.get("ingyenes") === "1",
    nearby = params.get("kornyeke") === "1";
  const day = dayValue(params.get("nap")),
    from = dayValue(params.get("tol")),
    to = dayValue(params.get("ig")),
    order = params.get("rendezes") === "newest" ? "newest" : "date";
  const [moreFilters, setMoreFilters] = useState(false),
    [visible, setVisible] = useState(8);
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const selectedPlace = REGION_PLACES.find((place) => place.slug === city),
    selectedArea = REGION_AREAS.find((item) => item.slug === area);
  const cityLabel =
    city === "other"
      ? "További települések"
      : city === "csik-kornyeke"
        ? "Csík környéke"
        : selectedPlace?.name;
  const basePath = slug
    ? `/varos/${slug}`
    : routeArea
      ? `/terseg/${routeArea}`
      : "/";
  function update(changes: Record<string, string>, browse = false) {
    const next = new URLSearchParams(search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    navigate(
      `${basePath}${next.size ? `?${next}` : ""}${browse ? "#programok" : ""}`,
      { replace: true },
    );
  }
  function selectPlace(value: string) {
    const next = new URLSearchParams(search);
    ["varos", "terseg", "kornyeke"].forEach((key) => next.delete(key));
    navigate(
      `${value ? `/varos/${value}` : "/"}${next.size ? `?${next}` : ""}`,
    );
  }
  function selectArea(value: string, browse = false) {
    const next = new URLSearchParams(search);
    ["varos", "terseg", "kornyeke"].forEach((key) => next.delete(key));
    navigate(
      `${value ? `/terseg/${value}` : "/"}${next.size ? `?${next}` : ""}${browse ? "#programok" : ""}`,
    );
  }
  const setDate = (value: string, browse = false) =>
    update(
      { mikor: value === "all" ? "" : value, nap: "", tol: "", ig: "" },
      browse,
    );
  const reset = () => navigate(basePath + "#programok", { replace: true });
  const scoped = useMemo(
    () =>
      events.filter((event) =>
        matchesDiscoveryEvent(event, { city, area, nearby }),
      ),
    [events, city, area, nearby],
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
            date,
            day,
            from,
            to,
            free,
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
      date,
      day,
      from,
      to,
      free,
      order,
    ],
  );
  const categories = useMemo(
    () => [
      ...new Map(
        scoped.map((event) => [
          event.category?.slug ?? "program",
          event.category ?? {
            slug: "program",
            name: "Program",
            color: "#777b8c",
          },
        ]),
      ).values(),
    ],
    [scoped],
  );
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
  const filtersActive = Boolean(
    query || category || date !== "all" || free || nearby || day || from || to,
  );
  useEffect(() => setVisible(8), [search, slug, routeArea]);
  useEffect(() => {
    if (window.location.hash === "#programok") {
      const frame = requestAnimationFrame(goToPrograms);
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [search, city, area, isLoading]);
  useEffect(() => {
    document.title = `${cityLabel ? `${cityLabel} programjai` : (selectedArea?.name ?? "Székelyföld programjai")} – Programtér`;
  }, [cityLabel, selectedArea]);
  if ((slug && !cityLabel) || (routeArea && !selectedArea))
    return (
      <div className="rp-empty">
        <h1>A település vagy térség nem található.</h1>
        <Link href="/varosok">Települések megnyitása</Link>
      </div>
    );
  return (
    <div className="rl-home">
      <RegionalHero
        events={scoped}
        isLoading={isLoading}
        cityLabel={cityLabel}
        areaLabel={selectedArea?.name}
        onDate={(value) => setDate(value, true)}
      />
      <div className="rl-container rl-search-dock">
        <form
          className="rl-searchbar"
          onSubmit={(event) => {
            event.preventDefault();
            goToPrograms();
          }}
        >
          <label className="rl-query">
            <Search size={22} />
            <input
              type="search"
              aria-label="Esemény keresése"
              placeholder="Milyen programot keresel?"
              value={query}
              onChange={(event) => update({ q: event.target.value })}
            />
          </label>
          <label>
            <MapPin size={19} />
            <select
              aria-label="Város vagy település kiválasztása"
              value={city}
              onChange={(event) => selectPlace(event.target.value)}
            >
              <option value="">Egész Székelyföld</option>
              {city === "csik-kornyeke" && (
                <option value="csik-kornyeke">Csík környéke</option>
              )}
              <PlaceOptions />
            </select>
            <ChevronDown size={14} />
          </label>
          <label>
            <CalendarDays size={19} />
            <select
              aria-label="Időpont kiválasztása"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            >
              {DATES.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
          <button className="rl-search-submit" type="submit">
            Keresés <ArrowRight size={19} />
          </button>
        </form>
        <div className="rl-search-under">
          <span>
            {isLoading
              ? "Programok betöltése…"
              : `${scoped.length} aktuális program${cityLabel ? ` · ${cityLabel}` : ""}`}
          </span>
          <button
            aria-expanded={moreFilters}
            aria-controls="rl-more-filters"
            onClick={() => setMoreFilters((value) => !value)}
          >
            <SlidersHorizontal size={16} /> További szűrők{" "}
            <ChevronDown size={14} />
          </button>
        </div>
        {moreFilters && (
          <div className="rl-more-filters" id="rl-more-filters">
            <label>
              Térség
              <select
                aria-label="Térség kiválasztása"
                value={area}
                onChange={(event) => selectArea(event.target.value)}
              >
                <option value="">Egész Székelyföld</option>
                {REGION_AREAS.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kategória
              <select
                aria-label="Kategória kiválasztása"
                value={category}
                onChange={(event) => update({ kategoria: event.target.value })}
              >
                <option value="">Minden kategória</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Konkrét nap
              <input
                type="date"
                aria-label="Programok egy adott napon"
                value={day}
                onChange={(event) =>
                  update({
                    nap: event.target.value,
                    mikor: "",
                    tol: "",
                    ig: "",
                  })
                }
              />
            </label>
            <label>
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
            <label>
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
            <label className="rl-check">
              <input
                type="checkbox"
                checked={free}
                onChange={(event) =>
                  update({ ingyenes: event.target.checked ? "1" : "" })
                }
              />{" "}
              Csak ingyenes programok
            </label>
            {selectedPlace && (
              <label className="rl-check">
                <input
                  type="checkbox"
                  checked={nearby}
                  onChange={(event) =>
                    update({ kornyeke: event.target.checked ? "1" : "" })
                  }
                />{" "}
                A térség többi települése is
              </label>
            )}
            <button className="rl-apply-filters" onClick={goToPrograms}>
              Találatok megnyitása <ArrowDown size={16} />
            </button>
          </div>
        )}
      </div>
      {!filtersActive && !isError && (
        <WeeklySelection
          events={scoped}
          onDate={(value) => setDate(value, true)}
        />
      )}
      {!filtersActive && !city && (
        <section
          className="rl-container rl-areas"
          aria-labelledby="rl-areas-heading"
        >
          <div>
            <span className="rl-eyebrow">VÁROSON TÚL IS</span>
            <h2 id="rl-areas-heading">Programok térségenként</h2>
            <Link href="/varosok">
              Települések böngészése <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="rl-area-tiles">
            {REGION_AREAS.map((item, index) => (
              <button
                key={item.slug}
                aria-pressed={area === item.slug}
                onClick={() => {
                  selectArea(area === item.slug ? "" : item.slug, true);
                }}
                className={`rl-area-tile rl-area-tile-${index}`}
                style={{ "--area-color": item.color } as CSSProperties}
              >
                <span className="rl-area-number">0{index + 1}</span>
                <strong>{item.shortName}</strong>
                <span>
                  {isLoading ? "…" : (areaCounts.get(item.slug) ?? 0)} program{" "}
                  <ArrowUpRight size={19} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      <section
        className="rl-container rl-browse"
        id="programok"
        aria-labelledby="rl-browse-heading"
      >
        <div className="rl-section-title">
          <div>
            <span className="rl-eyebrow">PROGRAMKERESŐ</span>
            <h2 id="rl-browse-heading">
              {filtersActive
                ? "Ezeket találtuk"
                : cityLabel
                  ? `${cityLabel} összes programja`
                  : "Az összes program"}
            </h2>
            <p aria-live="polite">
              {isLoading ? "Betöltés…" : `${filtered.length} aktuális esemény`}
              {selectedArea ? ` · ${selectedArea.name}` : ""}
            </p>
          </div>
          <label className="rl-sort">
            Rendezés
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
        <div className="rl-browse-tools">
          <div className="rl-time-pills">
            {DATES.slice(0, 5).map((item) => (
              <button
                key={item.value}
                aria-pressed={!day && !from && !to && date === item.value}
                onClick={() => setDate(item.value, true)}
              >
                {item.name}
              </button>
            ))}
          </div>
          <button
            className="rl-filter-trigger"
            aria-expanded={moreFilters}
            onClick={() => {
              setMoreFilters((value) => !value);
              document
                .querySelector(".rl-search-dock")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <SlidersHorizontal size={16} /> Szűrők
          </button>
        </div>
        <div className="rl-category-pills" aria-label="Eseménykategóriák">
          <button
            aria-pressed={!category}
            onClick={() => update({ kategoria: "" }, true)}
          >
            Mind
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              aria-pressed={category === item.slug}
              onClick={() =>
                update(
                  { kategoria: category === item.slug ? "" : item.slug },
                  true,
                )
              }
            >
              <i style={{ background: item.color }} />
              {item.name}
            </button>
          ))}
        </div>
        {filtersActive && (
          <div className="rl-active-filters">
            <span>Szűrt találatok</span>
            {query && <span>„{query}”</span>}
            {free && <span>Ingyenes</span>}
            {day && <span>{day}</span>}
            {from && (
              <span>
                {from} – {to || "…"}
              </span>
            )}
            {nearby && <span>Környék is</span>}
            <button onClick={reset}>
              Szűrők törlése <X size={14} />
            </button>
          </div>
        )}
        {from && to && to < from ? (
          <div role="alert" className="rp-empty">
            <h3>A zárónap korábbi a kezdőnapnál.</h3>
            <button onClick={() => update({ ig: "" })}>Zárónap törlése</button>
          </div>
        ) : isError ? (
          <div role="alert" className="rp-empty">
            <h3>Az események nem töltődtek be.</h3>
            <button onClick={() => refetch()}>Újrapróbálom</button>
          </div>
        ) : isLoading ? (
          <div className="rl-program-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="rp-card-skeleton rp-loading" key={index} />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="rl-program-grid">
            {filtered.slice(0, visible).map((event) => (
              <RegionalEventCard event={event} key={event.id} />
            ))}
          </div>
        ) : (
          <div className="rp-empty">
            <Search size={35} />
            <h3>Erre most nincs találat.</h3>
            <p>Válassz másik napot vagy települést.</p>
            <button onClick={reset}>Szűrők törlése</button>
            <Link href="/">
              Egész Székelyföld programjai <ArrowRight size={17} />
            </Link>
          </div>
        )}
        {filtered.length > visible && (
          <div className="rl-more">
            <button onClick={() => setVisible((value) => value + 8)}>
              További programok <ArrowDown size={18} />
            </button>
            <span>
              {Math.min(visible, filtered.length)} / {filtered.length} esemény
            </span>
          </div>
        )}
      </section>
      <section className="rl-submit-section rl-container">
        <div className="rl-submit-icon">
          <Ticket size={42} />
        </div>
        <div>
          <span className="rl-eyebrow">SZERVEZŐKNEK</span>
          <h2>A te programod is itt lehet.</h2>
          <p>
            Az eseménybeküldés és az alapmegjelenés ingyenes. Csak a külön kért
            kiemelés fizetős.
          </p>
        </div>
        <Link href="/bekuldese">
          Ingyenes beküldés <ArrowUpRight size={20} />
        </Link>
      </section>
    </div>
  );
}
