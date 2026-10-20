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
import { withEventPresentation } from "@/lib/event-presentation";
import "./regional-portal.css";

export function RegionalBrand() {
  return (
    <Link
      href="/"
      className="rp-brand"
      aria-label="Hello Székelyföld – főoldal"
    >
      <span className="rp-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <path
            d="M32 7a19 19 0 1 0 9 16"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="8" fill="#f19b2c" />
          <circle cx="39" cy="10" r="5" fill="#f19b2c" />
        </svg>
      </span>
      <span>
        hello<span>székelyföld</span>
        <small>PROGRAMOK · HELYEK · ESEMÉNYEK</small>
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
      active:
        location === "/" ||
        location.startsWith("/varos/") ||
        location.startsWith("/terseg/") ||
        location.startsWith("/esemeny/"),
    },
    { href: "/naptar", label: "Naptár", active: location === "/naptar" },
    { href: "/varosok", label: "Települések", active: location === "/varosok" },
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
          <Link
            href="/bekuldese"
            className="rp-button rp-button-coral rp-add"
            aria-label="Ingyenes eseménybeküldés"
          >
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
          <nav aria-label="Hello Székelyföld lábléc">
            <h2>Programot keresel?</h2>
            <Link href="/">Összes esemény</Link>
            <Link href="/naptar">Programnaptár</Link>
            <Link href="/varosok">Városok és települések</Link>
            <Link href="/forrasok">Források és frissítés</Link>
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
          <span>© {new Date().getFullYear()} Hello Székelyföld</span>
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
      "/forrasok": "Források és frissítés",
    };
    if (!/^\/(?:esemeny|varos|terseg)\//.test(location))
      document.title = `${titles[location] ?? "Székelyföld programjai"} – Hello Székelyföld`;
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
  backdrop = true,
}: {
  event: RegionEvent;
  priority?: boolean;
  backdrop?: boolean;
}) {
  const displayEvent = withEventPresentation(event);
  const [failed, setFailed] = useState(false);
  const [alternate, setAlternate] = useState(false);
  const image = displayEvent.imageUrl?.trim();
  const facebook = getEventLinks(displayEvent).facebookUrl?.match(
    /facebook\.com\/events\/(\d+)/,
  )?.[1];
  const fallback = facebook ? `/api/facebook-events/${facebook}/image` : "";
  const generic = !image || /hellocsik-logo|photo-149268/.test(image);
  const src = alternate || generic ? fallback : image;
  useEffect(() => {
    setFailed(false);
    setAlternate(false);
  }, [displayEvent.imageUrl, event.id]);
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
      {backdrop && <div
        className="rp-poster-backdrop"
        aria-hidden="true"
        style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
      />}
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
  const place = cityForEvent(event);
  const active =
    Date.parse(event.startDate) < Date.now() && Boolean(event.endDate);
  const paid =
    event.promotionStatus === "paid" && event.promotionPlan !== "free";
  const venueLines = event.location
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^Keresd térképen$/i.test(line));
  const venueLabel = /^\d+(?:\/\d+)?(?:\s*RON)?$/i.test(venueLines[0] ?? "")
    ? (venueLines[1] ?? event.location)
    : (venueLines[0] ?? event.location);
  return (
    <article
      className="rp-event"
      style={
        { "--event-color": event.category?.color ?? "#5a58b8" } as CSSProperties
      }
    >
      <Link href={`/esemeny/${event.id}`} className="rp-event-link">
        <div className="rp-event-image">
          <RegionalPoster event={event} />
          <span className="rp-event-category">
            {event.category?.name ?? "Program"}
          </span>
          <span className="rp-event-date-label">
            {active
              ? `${formatShortDate(event.endDate!).replace(/\.$/, "")}-ig`
              : formatShortDate(event.startDate)}
          </span>
          {paid ? (
            <span className="rp-ad-label">Fizetett kiemelés</span>
          ) : event.featured ? (
            <span className="rp-ad-label rp-editor-pick-label">Kiemelt ajánló</span>
          ) : null}
        </div>
        <div className="rp-event-body">
          <div className="rp-event-kicker">
            <span>
              <MapPin size={13} />
              {place?.name ?? "Székelyföld"}
            </span>
            <span>{active ? "Folyamatban" : formatTime(event.startDate)}</span>
          </div>
          <h3>{event.title}</h3>
          <p className="rp-event-place">{venueLabel}</p>
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
