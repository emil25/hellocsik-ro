import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { RegionalPoster } from "./RegionalPortal";
import { cityForEvent, type RegionEvent } from "@/lib/regional-events";
import { formatShortDate, formatTime } from "@/utils/date-format";
import { getEventPriceLabel } from "@/lib/event-links";
import { october1956Programs } from "../../../../shared/october-1956.mjs";

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
  const filtered = programs.filter(
    (event) => !selected || cityForEvent(event)?.slug === selected,
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
        <div className="sf56-identity">
          <span className="sf56-eyebrow">KIEMELT ESEMÉNYSOROZAT</span>
          <div className="sf56-year" aria-label="1956, 70. évforduló">
            <strong>1956</strong>
            <span>70 ÉV</span>
          </div>
          <h2 id="sf56-heading">
            Emlékprogramok
            <br />
            Székelyföldön
          </h2>
          <p>
            Megemlékezések, hangversenyek és történelmi programok több városban.
          </p>
          <span className="sf56-period">
            <CalendarDays size={17} /> 2026. október 20–23.
          </span>
          <div className="sf56-stripe" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="sf56-panel">
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
            {filtered.slice(0, expanded ? undefined : 4).map((event) => (
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
                    {formatShortDate(event.startDate)} ·{" "}
                    {formatTime(event.startDate)}
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
          {filtered.length > 4 && (
            <button
              className="sf56-more"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? "Kevesebb program"
                : `Mind a ${filtered.length} program`}{" "}
              <ArrowDown size={16} />
            </button>
          )}
          <div className="sf56-sources">
            <span>Hivatalos programok:</span>
            <a
              href="https://szereda.ro/esemenyek/unnepi-megemlekezes-az-1956-os-forradalom-es-szabadsagharc-70-evfordulojan/1177"
              target="_blank"
              rel="noopener noreferrer"
            >
              Csíkszereda <ArrowUpRight size={12} />
            </a>
            <a
              href="https://sepsiszentgyorgyinfo.ro/hirek/megemlekezes-az-1956-os-forradalom-es-szabadsagharc-70-evforduloja-alkalmabol-sepsiszentgyorgyon"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sepsiszentgyörgy <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
