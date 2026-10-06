import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef } from "react";
import { FESTIVAL_PROGRAMS, SZEKELYFOLD_DAYS, festivalAsset } from "@/data/szekelyfold-napok";
import "./szekelyfold-days.css";

export function SzekelyfoldDays() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.location.hash !== "#szekelyfold-napok") return;
    // Keep a direct link aligned while the event list above finishes loading.
    // Stop immediately when the visitor starts interacting with the page.
    const align = () => section.current?.scrollIntoView({ block: "start", behavior: "instant" });
    const observer = new ResizeObserver(align);
    const stop = () => {
      observer.disconnect();
      window.clearTimeout(timeout);
      for (const event of ["wheel", "touchstart", "keydown", "pointerdown"]) window.removeEventListener(event, stop);
    };
    const timeout = window.setTimeout(stop, 10000);
    observer.observe(document.body);
    for (const event of ["wheel", "touchstart", "keydown", "pointerdown"]) window.addEventListener(event, stop, { passive: true });
    align();
    return stop;
  }, []);
  const now = Date.now();
  if (now > Date.parse(SZEKELYFOLD_DAYS.end)) return null;
  const preferred = ["passiojatek", "felhold", "tekergok", "kaposztavasar", "borospatak"];
  const previews = preferred.map(id => FESTIVAL_PROGRAMS.find(program => program.id === id)!)
    .filter(program => Date.parse(program.end) >= now).slice(0, 3);

  return <section ref={section} className="szfn-section" id="szekelyfold-napok" aria-labelledby="szfn-heading">
    <div className="szfn-wrap">
      <p className="szfn-eyebrow"><span /> Kiemelt programsorozat</p>
      <div className="szfn-feature">
        <div className="szfn-intro">
          <img className="szfn-logo" src={festivalAsset("szekelyfold-napok-logo.png")} alt="Székelyföld Napok" width="230" height="193" loading="lazy" />
          <div className="szfn-intro-copy">
            <p className="szfn-edition">XVII. kiadás · 2026</p>
            <h2 id="szfn-heading">Székelyföld<br /> <em>Napok</em></h2>
            <p className="szfn-motto">Örökségből jövő.</p>
          </div>
          <div className="szfn-intro-bottom">
            <p><CalendarDays size={18} /> Október 9–18.</p>
            <span>Csíkszereda · Csíksomlyó · Csík környéke</span>
          </div>
        </div>
        <div className="szfn-selection">
          <div className="szfn-selection-heading"><div><span>Helyben ajánljuk</span><h3>A csíki programokból</h3></div><span className="szfn-number" aria-hidden="true">17.</span></div>
          <div className="szfn-previews">
            {previews.map(program => <Link key={program.id} href={`/szekelyfold-napok#${program.id}`} className="szfn-preview">
              <div className="szfn-preview-image"><img src={festivalAsset(program.image)} alt={program.title} loading="lazy" /><span>{program.category}</span></div>
              <div className="szfn-preview-copy"><span className="szfn-preview-date">{program.dates}</span><h4>{program.title}</h4><p><MapPin size={13} />{program.area === "Csík környéke" ? program.location.split(" · ").at(-1) : program.area}</p><ArrowUpRight className="szfn-preview-arrow" size={18} /></div>
            </Link>)}
          </div>
          <div className="szfn-actions"><Link href="/szekelyfold-napok" className="szfn-button">Csíki programok <ArrowRight size={18} /></Link><a href={SZEKELYFOLD_DAYS.source} target="_blank" rel="noopener noreferrer">Teljes fesztiválprogram <ArrowUpRight size={16} /></a></div>
        </div>
      </div>
    </div>
  </section>;
}
