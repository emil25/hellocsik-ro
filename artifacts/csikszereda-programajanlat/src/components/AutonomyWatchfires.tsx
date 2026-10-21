import { ArrowUpRight, CalendarDays, Flame, MapPin } from "lucide-react";
import "./autonomy-watchfires.css";

const facebookUrl = "https://www.facebook.com/photo/?fbid=1526922029473595&set=a.247213040777840";
const expiresAt = Date.parse("2026-10-25T23:59:59+03:00");

const localities = [
  ["Csíkszereda", "Mikó-vár melletti parkoló"],
  ["Csíkszenttamás", "Csonkatorony"],
  ["Csíkszentimre", "Pálszegi erdőalján Demeterén"],
  ["Csíkszentdomokos", "Garados-tető"],
  ["Balánbánya", "Olt utca"],
  ["Csíkkarcfalva", "Külső kőkereszt"],
  ["Csíkdánfalva", "Templomkert"],
  ["Csíkcsicsó", "Kultúrház előtti szobor"],
  ["Csíkszentmihály", "Akasztó hegy"],
  ["Csíkszentsimon", "Csatószeg-Aszói pihenőhely"],
  ["Csíkszentmárton", "Rugát-tető"],
  ["Csíkkozmás", "Paphegye"],
  ["Kászon", "Bogos-tető"],
  ["Tusnádfürdő", "Régi Önkormányzat melletti park"],
  ["Újtusnád", "Gátié-tető"],
  ["Nagy-Tusnád", "Önkormányzat előtti tér"],
  ["Csíkpálfalva", "Szellő-tető"],
  ["Csíkszentgyörgy", "Szegremenő"],
  ["Gyimesközéplok", "Csillag panzióval szembeni tér"],
  ["Gyimesfelsőlok", "Nyárfabirtok"],
  ["Csíkszentkirály", "Turulmadár emlékmű"],
] as const;

export function AutonomyWatchfires() {
  if (Date.now() > expiresAt) return null;

  return (
    <section className="watchfires-section" id="oktober-25-ortuzek" aria-labelledby="watchfires-title">
      <div className="watchfires-wrap">
        <div className="watchfires-heading">
          <span><Flame size={15} fill="currentColor" /> Kiemelt közösségi esemény</span>
          <span className="watchfires-heading-note">CSÍKSZÉK · 21 TELEPÜLÉS</span>
        </div>

        <div className="watchfires-feature">
          <a className="watchfires-poster" href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="A Székelyföld Autonómiájának Napja plakátjának megnyitása">
            <img src="/events/szekelyfold-autonomia-csikszek-2026.png" alt="Székelyföld Autonómiájának Napja Csíkszék településein, őrtüzek 2026. október 25-én, 17:30-kor" />
            <span className="watchfires-poster-link">Eredeti bejegyzés <ArrowUpRight size={14} /></span>
          </a>

          <div className="watchfires-copy">
            <div className="watchfires-kicker"><span /> Egy este · közös lángok</div>
            <h2 id="watchfires-title">Székelyföld<br /><em>őrtüzei</em></h2>
            <p className="watchfires-description">Október utolsó vasárnapján Csíkszék településein egyszerre gyúlnak meg az őrtüzek, a közösség összetartozásának jelképeként.</p>
            <div className="watchfires-date">
              <div className="watchfires-date-icon"><CalendarDays size={22} /></div>
              <div><span>VASÁRNAP</span><strong>2026. október 25.</strong></div>
              <b>17:30</b>
            </div>
            <div className="watchfires-count"><span className="watchfires-flames" aria-hidden="true">✳ ✳ ✳</span><strong>21 őrtűz</strong><span>egy időben, 21 településen</span></div>
          </div>
        </div>

        <div className="watchfires-locations">
          <div className="watchfires-locations-heading">
            <div><span>HOL GYÚLNAK FEL?</span><h3>Őrtűzhelyszínek Csíkszéken</h3></div>
            <span className="watchfires-total"><MapPin size={16} /> 21 helyszín</span>
          </div>
          <ol className="watchfires-grid">
            {localities.map(([name, place], index) => (
              <li key={name}>
                <span className="watchfires-index">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{name}</strong><span>{place}</span></div>
              </li>
            ))}
          </ol>
          <a className="watchfires-source" href={facebookUrl} target="_blank" rel="noopener noreferrer">Forrás: Csíki Területi Szervezet · Facebook <ArrowUpRight size={14} /></a>
        </div>
      </div>
    </section>
  );
}
