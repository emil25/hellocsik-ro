import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { FESTIVAL_PROGRAMS, SZEKELYFOLD_DAYS, festivalAsset, type FestivalProgram } from "@/data/szekelyfold-napok";
import "@/components/szekelyfold-days.css";

const areas = ["Mind", "Csíkszereda", "Csíksomlyó", "Csík környéke"] as const;

function ProgramCard({ program }: { program: FestivalProgram }) {
  return <article className="szfn-program" id={program.id}>
    <div className="szfn-program-image"><img src={festivalAsset(program.image)} alt={program.title} loading="lazy" /><span>{program.category}</span></div>
    <div className="szfn-program-copy">
      <p className="szfn-program-date"><CalendarDays size={16} /> {program.dates} <span><Clock3 size={14} /> {program.time}</span></p>
      <h2>{program.title}</h2>
      <p className="szfn-program-place"><MapPin size={16} />{program.location}</p>
      <p className="szfn-program-description">{program.description}</p>
      {program.note && <p className="szfn-program-note">{program.note}</p>}
      <div className="szfn-program-links">
        {program.eventPath && <Link href={program.eventPath}>Eseményoldal <ArrowRight size={15} /></Link>}
        <a href={SZEKELYFOLD_DAYS.source} target="_blank" rel="noopener noreferrer">Hivatalos program <ArrowUpRight size={15} /></a>
      </div>
    </div>
  </article>;
}

export default function SzekelyfoldDaysPage() {
  const [area, setArea] = useState<(typeof areas)[number]>("Mind");
  const expired = Date.now() > Date.parse(SZEKELYFOLD_DAYS.end);
  const programs = FESTIVAL_PROGRAMS.filter(program => area === "Mind" || program.area === area);
  useEffect(() => {
    document.title = "Székelyföld Napok 2026 – Csíki programok | HelloCsík";
    if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "instant" });
    else window.scrollTo(0, 0);
  }, []);

  return <div className="szfn-page">
    <div className="szfn-page-hero"><div className="szfn-wrap">
      <Link href="/#szekelyfold-napok" className="szfn-back"><ArrowLeft size={16} /> Vissza a főoldalra</Link>
      <div className="szfn-page-title"><div><p className="szfn-edition">XVII. kiadás · {SZEKELYFOLD_DAYS.dates}</p><h1>Székelyföld Napok</h1><p>Csíkszereda, Csíksomlyó és a környék programjaiból.</p></div><img src={festivalAsset("szekelyfold-napok-logo.png")} alt="Székelyföld Napok" width="230" height="193" /></div>
      <img className="szfn-official-banner" src={festivalAsset("szekelyfold-napok-2026.jpg")} width="2688" height="1142" alt="XVII. Székelyföld Napok – Örökségből jövő. 2026. október 9–18." />
    </div></div>
    <div className="szfn-wrap szfn-page-programs">
      <div className="szfn-page-programs-heading"><div><p className="szfn-eyebrow">{expired ? "Archív programválogatás" : "Csíki programválogatás"}</p><h2>Merre induljunk?</h2></div><a href={SZEKELYFOLD_DAYS.source} target="_blank" rel="noopener noreferrer">Teljes fesztiválprogram <ArrowUpRight size={16} /></a></div>
      <div className="szfn-filters" role="group" aria-label="Programok helyszíne">{areas.map(item => <button key={item} aria-pressed={area === item} onClick={() => setArea(item)}>{item}<span>{item === "Mind" ? FESTIVAL_PROGRAMS.length : FESTIVAL_PROGRAMS.filter(program => program.area === item).length}</span></button>)}</div>
      <p className="sr-only" aria-live="polite">{programs.length} program</p>
      <div className="szfn-program-grid">{programs.map(program => <ProgramCard key={program.id} program={program} />)}</div>
      <p className="szfn-source">Forrás: <a href={SZEKELYFOLD_DAYS.source} target="_blank" rel="noopener noreferrer">szekelyfoldnapok.ro</a> · Ellenőrizve: {SZEKELYFOLD_DAYS.checked} A programok változhatnak; részvétel előtt ellenőrizd a szervező friss tájékoztatását.</p>
    </div>
  </div>;
}
