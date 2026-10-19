import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import "./october-56-commemoration.css";

const officialEventUrl = "https://szereda.ro/esemenyek/unnepi-megemlekezes-az-1956-os-forradalom-es-szabadsagharc-70-evfordulojan/1177";
const officialPosterUrl = "https://szereda.ro/app/szereda/assets/images/esemenyek_2026_oktober23_megemlekezes.jpg";
const expiresAt = Date.parse("2026-10-23T23:59:59+03:00");

export function October56Commemoration() {
  if (Date.now() > expiresAt) return null;

  return <section className="oct56-section" id="oktober-23" aria-labelledby="oct56-title">
    <div className="oct56-wrap">
      <p className="oct56-eyebrow"><span aria-hidden="true">✦</span> Kiemelt városi program</p>
      <div className="oct56-panel">
        <div className="oct56-poster">
          <img src={officialPosterUrl} alt="Az 1956-os forradalom és szabadságharc 70. évfordulójának csíkszeredai plakátja" loading="lazy" onError={event => { event.currentTarget.style.display = "none"; }} />
          <div className="oct56-poster-shade" />
          <div className="oct56-poster-copy">
            <span>CSÍKSZEREDA · 2026</span>
            <strong>1956</strong>
            <em>70 éve a szabadságért</em>
            <span className="oct56-poster-date">OKTÓBER 23. · PÉNTEK</span>
          </div>
        </div>

        <div className="oct56-content">
          <div className="oct56-topline"><span className="oct56-label">Megemlékezés és ünnepi program</span><span className="oct56-year">’56</span></div>
          <h2 id="oct56-title">Ünnepi megemlékezés az 1956-os forradalom 70. évfordulóján</h2>
          <p className="oct56-intro">Csíkszereda több helyszínen tiszteleg a forradalom és szabadságharc hősei előtt. A nap része a közös felvonulás, ünnepi műsor, koszorúzás és hangverseny.</p>
          <div className="oct56-meta"><span><CalendarDays size={17} /> Október 23. · 12:00–19:00</span><span><MapPin size={17} /> Csíkszereda</span></div>

          <div className="oct56-timeline" aria-label="A megemlékezés programja">
            <div className="oct56-stop"><span className="oct56-dot" /><div><small>Délelőtt</small><strong>Megemlékezés a Kalász negyedi kopjafánál</strong></div></div>
            <div className="oct56-stop"><span className="oct56-dot" /><div><small>Kora este</small><strong>Gyertyás felvonulás a Gloria Victis emlékműhöz</strong><p>Ünnepi műsor a Csíki Játékszín művészeivel és a Role zenekarral, beszédek és koszorúzás.</p></div></div>
            <div className="oct56-stop"><span className="oct56-dot" /><div><small>A nap zárásaként</small><strong>Ünnepi hangverseny</strong></div></div>
          </div>

          <div className="oct56-footer"><span>Forrás: Csíkszereda Városháza</span><a href={officialEventUrl} target="_blank" rel="noopener noreferrer">Program és részletek <ArrowUpRight size={17} /></a></div>
        </div>
      </div>
    </div>
  </section>;
}
