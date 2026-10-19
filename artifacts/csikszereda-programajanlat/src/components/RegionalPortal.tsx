import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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
  Heart,
  MapPin,
  Menu,
  Plus,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { FavoriteButton } from "@/components/events/FavoriteButton";
import { useFavorites } from "@/hooks/use-favorites";
import { getEventLinks, getEventPriceLabel } from "@/lib/event-links";
import {
  REGION_CITIES,
  cityForEvent,
  matchesDateFilter,
  normalizeSearch,
  usePortalEvents,
  type RegionDateFilter,
  type RegionEvent,
} from "@/lib/regional-events";
import { formatShortDate, formatTime } from "@/utils/date-format";
import "./regional-portal.css";

export function RegionalBrand() {
  return (
    <Link
      href="/"
      className="rp-brand"
      aria-label="Programtér – Székelyföld főoldal"
    >
      <span className="rp-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path
            d="M10 5h11c8 0 14 6 14 13S29 31 21 31h-3v6H8V5Z"
            fill="currentColor"
          />
          <path d="m18 12 10 6-10 6V12Z" fill="#fffaf3" />
          <circle cx="5" cy="8" r="4" fill="#fac54c" />
        </svg>
      </span>
      <span>
        program<span>tér</span>
        <small>SZÉKELYFÖLD</small>
      </span>
    </Link>
  );
}

function RegionalHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { favoriteIds } = useFavorites();
  useEffect(() => setOpen(false), [location]);
  const links = [
    {
      href: "/",
      label: "Programok",
      active: location === "/" || location.startsWith("/varos/"),
    },
    { href: "/naptar", label: "Naptár", active: location === "/naptar" },
    { href: "/varosok", label: "Városok", active: location === "/varosok" },
    {
      href: "/helyszinek",
      label: "Helyszínek",
      active: location.startsWith("/helysz"),
    },
    {
      href: "/szervezok",
      label: "Szervezőknek",
      active: location.startsWith("/szervez") || location === "/arak",
    },
  ];
  return (
    <header className="rp-header">
      <div className="rp-header-inner">
        <RegionalBrand />
        <nav
          className={"rp-nav" + (open ? " is-open" : "")}
          aria-label="Székelyföldi főmenü"
        >
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              aria-current={link.active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/szervezoi-felulet" className="rp-mobile-login">
            Szervezői belépés
          </Link>
        </nav>
        <div className="rp-header-actions">
          <Link
            href="/erdekel"
            className="rp-heart"
            aria-label={`Mentett programok${favoriteIds.length ? ` (${favoriteIds.length})` : ""}`}
          >
            <Heart size={20} />
            {favoriteIds.length > 0 && <b>{favoriteIds.length}</b>}
          </Link>
          <Link href="/bekuldese" className="rp-button rp-button-coral rp-add">
            <Plus size={17} />
            <span>Esemény beküldése</span>
          </Link>
          <button
            className="rp-menu"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

function RegionalFooter() {
  return (
    <footer className="rp-footer">
      <div className="rp-wrap">
        <div className="rp-footer-top">
          <div>
            <RegionalBrand />
            <p>Székelyföld eseményei, egy helyen.</p>
            <Link href="~/klasszikus" className="rp-classic-link">
              HelloCsík – csíki programok <ArrowUpRight size={15} />
            </Link>
          </div>
          <nav aria-label="Programtér lábléc">
            <h2>Programot keresel?</h2>
            <Link href="/">Összes esemény</Link>
            <Link href="/naptar">Programnaptár</Link>
            <Link href="/varosok">Városok</Link>
            <Link href="/erdekel">Elmentett programjaim</Link>
          </nav>
          <nav aria-label="Szervezői lehetőségek">
            <h2>Eseményt szervezel?</h2>
            <Link href="/bekuldese">Ingyenes eseménybeküldés</Link>
            <Link href="/szervezoi-felulet">Regisztráció és belépés</Link>
            <Link href="/szervezok">Szervezői profilok</Link>
            <Link href="/arak">Fizetős kiemelések és árak</Link>
          </nav>
        </div>
        <div className="rp-footer-bottom">
          <span>© {new Date().getFullYear()} Programtér · Székelyföld</span>
          <span>Az eseménybeküldés ingyenes. Csak a kiemelés fizetős.</span>
          <Link href="~/admin">
            Admin <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function RegionalLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      "/": "Székelyföld programjai",
      "/varosok": "Programok városonként",
      "/naptar": "Programnaptár",
      "/helyszinek": "Helyszínek",
      "/szervezok": "Szervezőknek",
      "/szervezoi-felulet": "Szervezői felület",
      "/arak": "Kiemelések és árak",
      "/erdekel": "Elmentett programok",
      "/bekuldese": "Ingyenes eseménybeküldés",
    };
    document.title = `${titles[location] ?? "Székelyföld programjai"} – Programtér`;
  }, [location]);
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const original = meta?.getAttribute("content");
    meta?.setAttribute(
      "content",
      "Koncertek, színház, fesztiválok és közösségi programok Székelyföldön. Keress város, időpont és kategória szerint. Ingyenes eseménybeküldés szervezőknek.",
    );
    return () => {
      if (original) meta?.setAttribute("content", original);
      document.title = "HelloCsík – Csíkszereda és környékének programjai";
    };
  }, []);
  return (
    <div className="rp-site">
      <RegionalHeader />
      <main className="rp-main">{children}</main>
      <RegionalFooter />
    </div>
  );
}

export function RegionalPoster({
  event,
  priority = false,
}: {
  event: RegionEvent;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [alternate, setAlternate] = useState(false);
  const image = event.imageUrl?.trim();
  const facebook = getEventLinks(event).facebookUrl?.match(
    /facebook\.com\/events\/(\d+)/,
  )?.[1];
  const fallback = facebook ? `/api/facebook-events/${facebook}/image` : "";
  const generic = !image || /hellocsik-logo|photo-149268/.test(image);
  const src = alternate || generic ? fallback : image;
  useEffect(() => {
    setFailed(false);
    setAlternate(false);
  }, [event.imageUrl, event.id]);
  if (!src || failed)
    return (
      <div
        className="rp-poster-fallback"
        style={
          {
            "--poster-color": event.category?.color ?? "#e66750",
          } as CSSProperties
        }
      >
        <CalendarDays size={42} strokeWidth={1.4} />
        <span>{event.category?.name ?? "Program"}</span>
        <strong>{event.title}</strong>
      </div>
    );
  return (
    <>
      <div
        className="rp-poster-backdrop"
        aria-hidden="true"
        style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
      />
      <img
        src={src}
        alt={event.title}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => {
          if (!alternate && !generic && fallback) setAlternate(true);
          else setFailed(true);
        }}
      />
    </>
  );
}

export function RegionalEventCard({ event }: { event: RegionEvent }) {
  const date = new Date(event.startDate);
  const city = cityForEvent(event);
  const paid =
    event.promotionStatus === "paid" && event.promotionPlan !== "free";
  return (
    <article
      className="rp-event"
      style={
        { "--event-color": event.category?.color ?? "#e05b42" } as CSSProperties
      }
    >
      <Link href={`/esemeny/${event.id}`} className="rp-event-link">
        <div className="rp-event-image">
          <RegionalPoster event={event} />
          {paid && <span className="rp-ad-label">Kiemelt · hirdetés</span>}
        </div>
        <div className="rp-event-body">
          <div className="rp-event-kicker">
            <span>
              <i />
              {event.category?.name ?? "Program"}
            </span>
            <span>{formatTime(event.startDate)}</span>
          </div>
          <div className="rp-event-title-row">
            <div className="rp-event-date">
              <b>
                {date.toLocaleDateString("hu-HU", {
                  day: "numeric",
                  timeZone: "Europe/Bucharest",
                })}
              </b>
              <span>
                {date.toLocaleDateString("hu-HU", {
                  month: "short",
                  timeZone: "Europe/Bucharest",
                })}
              </span>
            </div>
            <h3>{event.title}</h3>
          </div>
          <p className="rp-event-place">
            <MapPin size={14} />
            <span>
              {city ? `${city.name} · ${event.location}` : event.location}
            </span>
          </p>
          <div className="rp-event-foot">
            <span>{getEventPriceLabel(event)}</span>
            <ArrowUpRight size={19} />
          </div>
        </div>
      </Link>
      <FavoriteButton eventId={event.id} className="rp-event-save" />
    </article>
  );
}

function RegionalSpotlight({ events }: { events: RegionEvent[] }) {
  const [active, setActive] = useState(0);
  const pool = useMemo(
    () =>
      [
        ...events.filter(
          (event) => event.featured || event.promotionStatus === "paid",
        ),
        ...events.filter(
          (event) => !event.featured && event.promotionStatus !== "paid",
        ),
      ].slice(0, 8),
    [events],
  );
  useEffect(() => setActive(0), [events]);
  const event = pool[active % pool.length];
  if (!event)
    return (
      <div className="rp-hero-empty">
        <CalendarDays size={44} />
        <p>Az új programok hamarosan itt jelennek meg.</p>
        <Link href="/bekuldese">
          Esemény beküldése <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="rp-spotlight">
      <div className="rp-spotlight-decoration" aria-hidden="true" />
      <article className="rp-main-feature">
        <Link href={`/esemeny/${event.id}`}>
          <div className="rp-feature-image">
            <RegionalPoster event={event} priority />
            <span className="rp-feature-badge">
              <span />
              {event.promotionStatus === "paid"
                ? "Kiemelt · hirdetés"
                : "Ajánljuk"}
            </span>
          </div>
          <div className="rp-feature-copy">
            <div>
              <span>
                {formatShortDate(event.startDate)} ·{" "}
                {cityForEvent(event)?.name ?? event.location}
              </span>
              <h2>{event.title}</h2>
            </div>
            <span className="rp-feature-arrow">
              <ArrowUpRight size={23} />
            </span>
          </div>
        </Link>
        <FavoriteButton eventId={event.id} className="rp-feature-save" />
      </article>
      {pool.length > 1 && (
        <div className="rp-feature-controls">
          <div className="rp-feature-dots">
            {pool.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActive(index)}
                aria-label={`${index + 1}. ajánlott esemény`}
                aria-pressed={index === active}
              />
            ))}
          </div>
          <span>
            {String(active + 1).padStart(2, "0")}
            <small> / {String(pool.length).padStart(2, "0")}</small>
          </span>
          <button
            onClick={() =>
              setActive((value) => (value - 1 + pool.length) % pool.length)
            }
            aria-label="Előző ajánló"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            onClick={() => setActive((value) => (value + 1) % pool.length)}
            aria-label="Következő ajánló"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

const DATE_OPTIONS: { value: RegionDateFilter; label: string }[] = [
  { value: "all", label: "Bármikor" },
  { value: "today", label: "Ma" },
  { value: "week", label: "Ezen a héten" },
  { value: "weekend", label: "Hétvégén" },
];

export function RegionalHome() {
  const { slug } = useParams<{ slug?: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = new URLSearchParams(search);
  const citySlug = slug ?? params.get("varos") ?? "";
  const query = params.get("q") ?? "";
  const category = params.get("kategoria") ?? "";
  const date = DATE_OPTIONS.some((item) => item.value === params.get("mikor"))
    ? (params.get("mikor") as RegionDateFilter)
    : "all";
  const free = params.get("ingyenes") === "1";
  const [visible, setVisible] = useState(12);
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const selectedCity = REGION_CITIES.find((city) => city.slug === citySlug);
  const scoped = useMemo(
    () =>
      events.filter(
        (event) => !citySlug || cityForEvent(event)?.slug === citySlug,
      ),
    [events, citySlug],
  );
  const categories = useMemo(
    () => [
      ...new Map(
        scoped.flatMap((event) =>
          event.category
            ? [[event.category.slug, event.category] as const]
            : [],
        ),
      ).values(),
    ],
    [scoped],
  );
  const results = useMemo(
    () =>
      scoped.filter(
        (event) =>
          (!category || event.category?.slug === category) &&
          (!free ||
            /^(ingyenes|gratuit|free|0(?:[.,]0+)?(?:\s*ron)?)$/i.test(
              event.price?.trim() ?? "",
            )) &&
          matchesDateFilter(event, date) &&
          normalizeSearch(
            `${event.title} ${event.location} ${event.locationAddress ?? ""} ${event.description ?? ""}`,
          ).includes(normalizeSearch(query.trim())),
      ),
    [scoped, category, free, date, query],
  );
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(search);
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(`${slug ? `/varos/${slug}` : "/"}${next.size ? `?${next}` : ""}`, {
      replace: true,
    });
  };
  useEffect(() => {
    setVisible(12);
  }, [search, slug]);
  useEffect(() => {
    if (selectedCity)
      document.title = `${selectedCity.name} programjai – Programtér`;
  }, [selectedCity]);
  const cityCounts = useMemo(
    () =>
      new Map(
        REGION_CITIES.map((city) => [
          city.slug,
          events.filter((event) => cityForEvent(event)?.slug === city.slug)
            .length,
        ]),
      ),
    [events],
  );
  const activeCities = REGION_CITIES.filter((city) =>
    cityCounts.get(city.slug),
  ).sort(
    (a, b) => (cityCounts.get(b.slug) ?? 0) - (cityCounts.get(a.slug) ?? 0),
  );
  const reset = () =>
    navigate(slug ? `/varos/${slug}` : "/", { replace: true });
  if (slug && !selectedCity)
    return (
      <div className="rp-empty rp-wrap">
        <h1>Ez a városoldal nem található.</h1>
        <Link href="/varosok">
          Városok megnyitása <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <>
      <section className="rp-opening">
        <div className="rp-wrap rp-hero">
          <div className="rp-hero-copy">
            {selectedCity ? (
              <Link href="/" className="rp-eyebrow rp-back">
                <ArrowLeft size={14} /> Székelyföld összes programja
              </Link>
            ) : (
              <span className="rp-eyebrow">
                <span className="rp-small-sun" /> SZÉKELYFÖLDI ESEMÉNYAJÁNLÓ
              </span>
            )}
            <h1>
              {selectedCity ? (
                <>
                  {selectedCity.name}
                  <span>
                    programjai<span className="rp-coral-dot">.</span>
                  </span>
                </>
              ) : (
                <>
                  Programok
                  <span>
                    Székelyföldön<span className="rp-coral-dot">.</span>
                  </span>
                </>
              )}
            </h1>
            <p>
              Koncertek, színház, fesztiválok és közösségi események. Válassz
              programot város és időpont szerint.
            </p>
            <form
              className="rp-hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                document
                  .getElementById("programok")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <label>
                <Search size={20} />
                <input
                  type="search"
                  placeholder="Esemény, előadó, helyszín…"
                  aria-label="Esemény keresése"
                  value={query}
                  onChange={(event) => updateFilter("q", event.target.value)}
                />
              </label>
              <div>
                <label>
                  <MapPin size={17} />
                  <select
                    aria-label="Város kiválasztása"
                    value={citySlug}
                    onChange={(event) => {
                      if (slug)
                        navigate(
                          event.target.value
                            ? `/varos/${event.target.value}`
                            : "/",
                        );
                      else updateFilter("varos", event.target.value);
                    }}
                  >
                    <option value="">Egész Székelyföld</option>
                    {REGION_CITIES.map((city) => (
                      <option key={city.slug} value={city.slug}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </label>
                <button type="submit" aria-label="Programok mutatása">
                  <ArrowRight size={22} />
                </button>
              </div>
            </form>
            <div className="rp-hero-note">
              <span className="rp-note-avatars" aria-hidden="true">
                <MusicNote />
                <CalendarDays size={15} />
                <Heart size={15} />
              </span>
              <span>
                {isLoading ? (
                  "Az aktuális programokat töltjük…"
                ) : (
                  <>
                    <b>{events.length}</b> közelgő esemény ·{" "}
                    <b>{activeCities.length}</b> város és környéke
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="rp-hero-visual">
            {isLoading ? (
              <div className="rp-hero-skeleton rp-loading" />
            ) : isError ? (
              <div className="rp-hero-empty">
                <p>Az ajánlók most nem töltődtek be.</p>
                <button onClick={() => refetch()}>Újrapróbálom</button>
              </div>
            ) : (
              <RegionalSpotlight events={scoped} />
            )}
          </div>
        </div>
      </section>
      <div className="rp-city-shortcuts">
        <div className="rp-wrap">
          <span>
            <MapPin size={15} /> HOL?
          </span>
          <Link href="/" aria-current={!citySlug ? "page" : undefined}>
            Mindenhol
          </Link>
          {activeCities.slice(0, 6).map((city) => (
            <Link
              href={`/varos/${city.slug}`}
              key={city.slug}
              aria-current={citySlug === city.slug ? "page" : undefined}
            >
              {city.name}
              <small>{cityCounts.get(city.slug)}</small>
            </Link>
          ))}
          <Link href="/varosok" className="rp-all-cities">
            Összes város <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <section className="rp-wrap rp-programs" id="programok">
        <div className="rp-section-heading">
          <div>
            <span className="rp-eyebrow">AZ ÖSSZES AKTUÁLIS ESEMÉNY</span>
            <h2>
              {selectedCity ? "Helyi programok" : "Találd meg a programod"}
              <span className="rp-coral-dot">.</span>
            </h2>
          </div>
          <Link href="/naptar" className="rp-calendar-link">
            <CalendarDays size={17} /> Naptár nézet <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="rp-filter-toolbar">
          <div className="rp-date-tabs" aria-label="Időpont szűrése">
            {DATE_OPTIONS.map((item) => (
              <button
                key={item.value}
                aria-pressed={date === item.value}
                onClick={() =>
                  updateFilter("mikor", item.value === "all" ? "" : item.value)
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="rp-free-filter">
            <input
              type="checkbox"
              checked={free}
              onChange={(event) =>
                updateFilter("ingyenes", event.target.checked ? "1" : "")
              }
            />
            <span>
              <Check size={12} />
            </span>
            Csak ingyenes
          </label>
        </div>
        <div className="rp-categories" aria-label="Eseménykategóriák">
          <button
            aria-pressed={!category}
            onClick={() => updateFilter("kategoria", "")}
          >
            Minden program
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              aria-pressed={category === item.slug}
              onClick={() => updateFilter("kategoria", item.slug)}
            >
              <i style={{ background: item.color }} />
              {item.name}
            </button>
          ))}
        </div>
        <div className="rp-results" aria-live="polite">
          <p>
            {isLoading ? "Programok betöltése…" : `${results.length} esemény`}
            {selectedCity ? ` · ${selectedCity.name}` : " · Székelyföld"}
            {query.trim() && <> · „{query.trim()}”</>}
          </p>
          {(query ||
            category ||
            date !== "all" ||
            free ||
            (!slug && citySlug)) && (
            <button onClick={reset}>
              <X size={13} /> Szűrők törlése
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="rp-event-grid">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="rp-card-skeleton rp-loading" key={index} />
            ))}
          </div>
        ) : isError ? (
          <div className="rp-empty" role="alert">
            <CalendarDays size={32} />
            <h3>Az események betöltése nem sikerült.</h3>
            <button onClick={() => refetch()}>Újrapróbálom</button>
          </div>
        ) : results.length ? (
          <div className="rp-event-grid">
            {results.slice(0, visible).map((event) => (
              <RegionalEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rp-empty">
            <Search size={32} />
            <h3>Nincs találat a kiválasztott szűrőkkel.</h3>
            <p>Válassz másik várost vagy időpontot.</p>
            <button onClick={reset}>Szűrők törlése</button>
          </div>
        )}
        {results.length > visible && (
          <div className="rp-load-more">
            <button
              className="rp-button rp-button-outline"
              onClick={() => setVisible((value) => value + 12)}
            >
              Még több program <Plus size={17} />
            </button>
            <span>
              {Math.min(visible, results.length)} / {results.length} esemény
            </span>
          </div>
        )}
      </section>
      <section className="rp-organizer-band">
        <div className="rp-wrap">
          <span className="rp-band-art" aria-hidden="true">
            <Ticket size={48} strokeWidth={1.4} />
          </span>
          <div>
            <span className="rp-eyebrow">SZERVEZŐKNEK</span>
            <h2>A te programodnak is itt a helye.</h2>
            <p>
              Ingyenes eseménybeküldés és saját szervezői profil. Csak a
              kiemelés fizetős.
            </p>
          </div>
          <Link href="/szervezoi-felulet" className="rp-button rp-button-navy">
            Szervezői felület <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
    </>
  );
}

function MusicNote() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18V5l12-2v13M9 9l12-2" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function RegionalCitiesPage() {
  const { data: events = [], isLoading, isError, refetch } = usePortalEvents();
  const [query, setQuery] = useState("");
  const cities = REGION_CITIES.filter((city) =>
    normalizeSearch(city.name).includes(normalizeSearch(query)),
  );
  return (
    <section className="rp-wrap rp-city-page">
      <span className="rp-eyebrow">PROGRAMOK VÁROSONKÉNT</span>
      <h1>
        Merre indulnál<span className="rp-coral-dot">?</span>
      </h1>
      <p>Válassz várost az ottani és környékbeli eseményekhez.</p>
      <label className="rp-city-search">
        <Search size={18} />
        <input
          type="search"
          aria-label="Város keresése"
          placeholder="Keress várost…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {isError && (
        <div className="rp-empty" role="alert">
          <p>A programszámokat nem sikerült betölteni.</p>
          <button onClick={() => refetch()}>Újrapróbálom</button>
        </div>
      )}
      <div className="rp-city-grid">
        {cities.map((city, index) => {
          const count = events.filter(
            (event) => cityForEvent(event)?.slug === city.slug,
          ).length;
          return (
            <Link
              key={city.slug}
              href={`/varos/${city.slug}`}
              className={`rp-city-tile rp-city-tone-${index % 4}`}
            >
              <span className="rp-city-pin">
                <MapPin size={27} strokeWidth={1.6} />
              </span>
              <div>
                <h2>{city.name}</h2>
                <span>
                  {isLoading
                    ? "Programok betöltése…"
                    : `${count} közelgő esemény`}
                </span>
              </div>
              <ArrowUpRight size={23} />
            </Link>
          );
        })}
      </div>
      {!cities.length && (
        <p className="rp-empty">Nincs ilyen város a listában.</p>
      )}
      <Link href="/" className="rp-button rp-button-navy">
        Összes esemény együtt <ArrowRight size={18} />
      </Link>
    </section>
  );
}
