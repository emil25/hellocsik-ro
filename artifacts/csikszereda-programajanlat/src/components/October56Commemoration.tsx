import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { CSIK_1956_FACEBOOK_URL, CSIK_1956_POSTER_URL } from "@/lib/event-presentation";
import "./october-56-commemoration.css";

const officialEventUrl = "https://szereda.ro/esemenyek/unnepi-megemlekezes-az-1956-os-forradalom-es-szabadsagharc-70-evfordulojan/1177";
const expiresAt = Date.parse("2026-10-23T23:59:59+03:00");

export function October56Commemoration() {
  if (Date.now() > expiresAt) return null;

  return <section className="oct56-section" id="oktober-23" aria-labelledby="oct56-title">
    <div className="oct56-wrap">
      <p className="oct56-eyebrow"><span aria-hidden="true">✦</span> Kiemelt városi program</p>
      <div className="oct56-panel">
        <div className="oct56-poster">
          <a href={CSIK_1956_FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook-esemény megnyitása">
            <img src={CSIK_1956_POSTER_URL} alt="Csíkszereda Városháza plakátja az 1956-os forradalom és szabadságharc 70. évfordulójáról, 2026. október 23." loading="lazy" />
          </a>
          <div className="oct56-poster-shade" />
        </div>

        <div className="oct56-content">
          <div className="oct56-topline"><span className="oct56-label">Megemlékezés és ünnepi program</span><span className="oct56-year">’56</span></div>
          <h2 id="oct56-title">Ünnepi megemlékezés az 1956-os forradalom 70. évfordulóján</h2>
          <p className="oct56-intro">Csíkszereda több helyszínen tiszteleg a forradalom és szabadságharc hősei előtt. A városi megemlékezést iskolai és történelmi programok, majd ünnepi hangverseny egészíti ki.</p>
          <div className="oct56-meta"><span><CalendarDays size={17} /> Október 23. · 12:00–19:00</span><span><MapPin size={17} /> Csíkszereda</span></div>

          <div className="oct56-timeline" aria-label="A megemlékezés programja">
            <div className="oct56-stop"><span className="oct56-dot" /><div><small>Délelőtt</small><strong>Megemlékezés a Kalász negyedi kopjafánál</strong></div></div>
            <div className="oct56-stop"><span className="oct56-dot" /><div><small>Kora este</small><strong>Gyertyás felvonulás a Gloria Victis emlékműhöz</strong><p>Ünnepi műsor a Csíki Játékszín művészeivel és a Role zenekarral, beszédek és koszorúzás.</p></div></div>
            <div className="oct56-stop"><span className="oct56-dot" /><div><small>20:00 · Cinema Csíki Mozi</small><a className="oct56-stop-link" href="/esemeny/133">Magyar költők énekelt versei – ünnepi hangverseny</a><p>Hangverseny az 1956-os forradalom emlékére. <a href="https://www.facebook.com/events/1386581736793712/?locale=hu_HU" target="_blank" rel="noopener noreferrer">Facebook-esemény <ArrowUpRight size={13} /></a></p></div></div>
          </div>

          <div className="oct56-education" aria-labelledby="oct56-education-title">
            <div className="oct56-education-heading">
              <div><small>Az emléknapot megelőzően</small><h3 id="oct56-education-title">Iskolai és történelmi programok</h3></div>
              <span aria-hidden="true">1956</span>
            </div>
            <div className="oct56-education-grid">
              <div className="oct56-education-item"><span>01</span><strong>Középiskolások történelmi vetélkedője</strong></div>
              <a className="oct56-education-item oct56-education-event" href="/esemeny/121"><span>Okt. 20. · 14:00</span><strong>Történészkonferencia – történelem, emlékezet, személyes sorsok</strong><small>Sapientia EMTE, Csíkszereda · Részletek <ArrowUpRight size={13} /></small></a>
              <div className="oct56-education-item"><span>03</span><strong>Történelmi séta és kvíz általános iskolásoknak</strong></div>
              <div className="oct56-education-item"><span>04</span><strong>Rendhagyó történelem- és irodalomórák</strong></div>
            </div>
            <p className="oct56-education-note">A részletes időpontokat és helyszíneket a hivatalos program közli.</p>
          </div>

          <div className="oct56-footer"><span>Forrás: Csíkszereda Városháza</span><div className="oct56-footer-actions"><a href={officialEventUrl} target="_blank" rel="noopener noreferrer">Hivatalos program <ArrowUpRight size={17} /></a><a href={CSIK_1956_FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Facebook-esemény <ArrowUpRight size={17} /></a><a href="/esemeny/144">Esemény adatlapja <ArrowUpRight size={17} /></a></div></div>
        </div>
      </div>
    </div>
  </section>;
}
