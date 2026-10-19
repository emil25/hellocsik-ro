import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";
import { OCTOBER_1956_END } from "../../../../shared/october-1956.mjs";

export function RegionalMasthead({
  count,
  isLoading,
  cityLabel,
  areaLabel,
  onDate,
}: {
  count: number;
  isLoading: boolean;
  cityLabel?: string;
  areaLabel?: string;
  onDate: (value: string) => void;
}) {
  return (
    <section className="rs-masthead" aria-labelledby="rs-masthead-title">
      <div className="rs-masthead-sun" aria-hidden="true" />
      <div className="rs-masthead-inner rl-container">
        <div className="rs-masthead-copy">
          <span className="rs-masthead-label">
            <span /> HELLO SZÉKELYFÖLD
          </span>
          <h1 id="rs-masthead-title">
            {cityLabel ?? areaLabel ?? "Programok"} <br />
            <span>
              {cityLabel || areaLabel ? "és események." : "Székelyföldön."}
            </span>
          </h1>
          <p>Koncertek, színház, fesztiválok és közösségi programok.</p>
          <div className="rs-masthead-actions">
            <button onClick={() => onDate("all")}>
              Programot keresek <ArrowDown size={18} />
            </button>
            <Link href="/naptar">
              <CalendarDays size={17} /> Naptár
            </Link>
          </div>
          <div className="rs-masthead-dates">
            <span>Mikor?</span>
            <button onClick={() => onDate("today")}>Ma</button>
            <button onClick={() => onDate("week")}>Ezen a héten</button>
            <button onClick={() => onDate("weekend")}>
              Hétvégén <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <div className="rs-masthead-photo">
          <img
            src="/reference/cloud-hero.jpg"
            alt="Szabadtéri koncert közönsége"
            fetchPriority="high"
          />
          <div className="rs-photo-shade" />
          <span className="rs-photo-note">
            <Sparkles size={17} />
            {isLoading ? "Programok betöltése" : `${count} aktuális program`}
          </span>
          {!isLoading && count > 0 && Date.now() < OCTOBER_1956_END && (
            <a href="#szekelyfold-1956" className="rs-campaign-teaser">
              <span>KIEMELT ESEMÉNYSOROZAT</span>
              <strong>1956 · 70 év</strong>
              <span>
                Októberi emlékprogramok <ArrowUpRight size={18} />
              </span>
            </a>
          )}
        </div>
      </div>
      <div className="rs-masthead-ribbon" aria-hidden="true">
        <span>KONCERT</span>
        <i /> SZÍNHÁZ <i /> FESZTIVÁL <i /> KIÁLLÍTÁS <i /> KÖZÖSSÉG <i />{" "}
        SZÉKELYFÖLD
      </div>
    </section>
  );
}
