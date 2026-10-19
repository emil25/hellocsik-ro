import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import { cityForEvent, type RegionEvent } from "@/lib/regional-events";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { getEventPriceLabel } from "@/lib/event-links";
import {
  CSIK_1956_EVENT_ID,
  CSIK_1956_FACEBOOK_URL,
  CSIK_1956_POSTER_URL,
} from "@/lib/event-presentation";
import { october1956Programs } from "../../../../shared/october-1956.mjs";
import "./regional-home-v2.css";

export function Regional56Feature({
  events,
  initialCity = "",
}: {
  events: RegionEvent[];
  initialCity?: string;
}) {
  const [city, setCity] = useState(initialCity);
  const [expanded, setExpanded] = useState(false);
  const programs = useMemo(() => october1956Programs(events), [events]);
  const cities = [
    ...new Map(
      programs.flatMap((event) => {
        const place = cityForEvent(event);
        return place ? [[place.slug, place] as const] : [];
      }),
    ).values(),
  ];
  const selected = cities.some((place) => place.slug === city) ? city : "";
  const highlighted = programs.find((event) => event.id === CSIK_1956_EVENT_ID);
  const highlightedCity = highlighted ? cityForEvent(highlighted)?.slug : "";
  const showHighlight = Boolean(highlighted && (!selected || selected === highlightedCity));
  const filtered = programs.filter(
    (event) => !selected || cityForEvent(event)?.slug === selected,
  );
  const listed = filtered.filter(
    (event) => !showHighlight || event.id !== CSIK_1956_EVENT_ID,
  );

  useEffect(() => {
    setCity(initialCity);
    setExpanded(false);
  }, [initialCity]);

  if (!programs.length) return null;

  return (
    <section
      className="sf56"
      id="szekelyfold-1956"
      aria-labelledby="sf56-heading"
    >
      <div className="sf56-wrap rl-container">
        {showHighlight && highlighted && (
          <article className="sf56-lead">
            <a
              className="sf56-cover"
              href={CSIK_1956_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="A csíkszeredai 1956-os megemlékezés plakátja és Facebook-eseménye"
            >
              <img
                src={CSIK_1956_POSTER_URL}
                alt="Csíkszereda Városháza: az 1956-os forradalom és szabadságharc 70. évfordulója, 2026. október 23."
              />
              <span className="sf56-cover-label">CSÍKSZEREDA · KIEMELT PROGRAM</span>
              <span className="sf56-cover-arrow">
                <ArrowUpRight size={18} />
              </span>
            </a>
            <div className="sf56-lead-copy">
              <span className="sf56-eyebrow">1956 · 70. ÉVFORDULÓ</span>
              <h2 id="sf56-heading">
                Az 1956-os forradalom és szabadságharc emléknapja
              </h2>
              <p>
                A csíkszeredai városi megemlékezés plakátja és eseményadatai.
                További emlékprogramok több székelyföldi településen.
              </p>
              <div className="sf56-lead-meta">
                <CalendarDays size={16} /> 2026. október 23.
                <span>·</span> Csíkszereda
              </div>
              <div className="sf56-lead-actions">
                <Link href={`/esemeny/${highlighted.id}`}>
                  Programrészletek <ArrowUpRight size={16} />
                </Link>
                <a
                  href={CSIK_1956_FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook-esemény <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </article>
        )}

        <div className="sf56-panel">
          <div className="sf56-panel-heading">
            <div>
              <span className="sf56-eyebrow">A TÉRSÉG PROGRAMJAI</span>
              <h3>Emlékprogramok Székelyföldön</h3>
            </div>
            <span>{programs.length} esemény</span>
          </div>
          <div className="sf56-tabs" aria-label="1956-os programok városonként">
            <button
              aria-pressed={!selected}
              onClick={() => {
                setCity("");
                setExpanded(false);
              }}
            >
              Mindenhol <b>{programs.length}</b>
            </button>
            {cities.map((place) => (
              <button
                key={place.slug}
                aria-pressed={selected === place.slug}
                onClick={() => {
                  setCity(place.slug);
                  setExpanded(false);
                }}
              >
                {place.name}
              </button>
            ))}
          </div>
          <div className="sf56-programs">
            {listed.slice(0, expanded ? undefined : 4).map((event) => (
              <Link
                key={event.id}
                href={`/esemeny/${event.id}`}
                className="sf56-program"
              >
                <div className="sf56-poster">
                  <RegionalPoster event={event} />
                </div>
                <div className="sf56-program-copy">
                  <span className="sf56-date">
                    {formatShortDate(event.startDate)} · {formatTime(event.startDate)}
                  </span>
                  <h3>{event.title}</h3>
                  <span className="sf56-place">
                    <MapPin size={12} />
                    {cityForEvent(event)?.name ?? event.location}
                  </span>
                  <span className="sf56-price">
                    {getEventPriceLabel(event)} <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {listed.length > 4 && (
            <button
              className="sf56-more"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Kevesebb program" : `Mind a ${listed.length} program`}
              <ArrowDown size={16} />
            </button>
          )}
          <div className="sf56-sources">
            <span>Források:</span>
            <a
              href="https://szereda.ro/esemenyek/unnepi-megemlekezes-az-1956-os-forradalom-es-szabadsagharc-70-evfordulojan/1177"
              target="_blank"
              rel="noopener noreferrer"
            >
              Csíkszereda hivatalos programja <ArrowUpRight size={12} />
            </a>
            <a
              href="https://sepsiszentgyorgyinfo.ro/hirek/megemlekezes-az-1956-os-forradalom-es-szabadsagharc-70-evforduloja-alkalmabol-sepsiszentgyorgyon"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sepsiszentgyörgy programja <ArrowUpRight size={12} />
            </a>
            <a
              href={CSIK_1956_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook-esemény <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
