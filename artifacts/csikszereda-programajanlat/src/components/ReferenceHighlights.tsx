import { ArrowRight, CalendarDays, ExternalLink, Ticket } from "lucide-react";
import { Link } from "wouter";
import { useListUpcomingEvents } from "@workspace/api-client-react";
import { useEffect, useState } from "react";

const asset = (file: string) => `${import.meta.env.BASE_URL}reference/${file}`;
const artists = [
  ["Mehringer", "mehringer.jpg"], ["Metzker Viktória", "metzker.png"],
  ["Csinszka", "csinszka.png"], ["Doncs.", "doncs.png"],
  ["Czika", "czika.png"], ["Bozont és a Vakvarjak", "bozont.jpg"],
  ["BONZON", "bonzon.webp"], ["BE_TORO", "be-toro.webp"],
];

export function CloudFestival() {
  const { data } = useListUpcomingEvents({ limit: 100 });
  const event = data?.events.find(item => item.title === "Cloud Youth Festival 2026");
  if (!event) return null;
  return <section id="cloud-festival" className="cloud-section">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="cloud-eyebrow"><span>✦</span> KIEMELT ESEMÉNY · CLOUD YOUTH FESTIVAL</p>
      <div className="cloud-panel">
        <div className="cloud-cover">
          <img className="cloud-cover-photo" src={asset("cloud-hero.jpg")} alt="Cloud Youth Festival koncert a színpadon" loading="lazy" />
          <div className="cloud-cover-copy"><p className="cloud-location">CSÍKSZEREDA · 5. JUBILEUM</p>
            <img className="cloud-logo" src={asset("cloud-logo.png")} alt="Cloud Youth Festival" loading="lazy" />
            <p className="cloud-date"><strong>4–6.</strong> <em>szeptember</em></p>
            <p className="cloud-description">Három nap zene, találkozások és felhőtlen nyárzáró hangulat Csíkszeredában. Ismerd meg a Cloud idei fellépőit!</p>
            <div className="flex flex-wrap gap-3 mt-6"><a className="cloud-ticket" href={event.ticketUrl || "https://in-time.hu/e/cloud-youth-fesztival-2026"} target="_blank" rel="noopener noreferrer">MEGVESZEM A BÉRLETET <ArrowRight size={16} /></a><Link className="cloud-details" href={`/esemeny/${event.id}`}>Részletek a portálon <ArrowRight size={16} /></Link></div>
          </div>
        </div>
        <div className="cloud-lineup"><div className="flex items-end justify-between gap-4 mb-6"><div><p className="text-[#f88b48] text-xs tracking-[.2em] font-bold mb-2">A CLOUD 2026 LINEUP</p><h2 className="text-3xl font-extrabold tracking-tight">Fellépők</h2></div><p className="text-xs text-slate-400 tracking-wider">A LINEUP MÉG BŐVÜL</p></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{artists.map(([name, file]) => <figure key={name} className="cloud-artist"><img src={asset(file)} alt={name} loading="lazy" /><figcaption>{name}</figcaption></figure>)}</div>
        </div>
        <div className="cloud-bottom"><span><CalendarDays size={15} /> 2026. szeptember 4–6. · Csíkszereda</span><a href="https://cloudfestival.ro/index.html" target="_blank" rel="noopener noreferrer">cloudfestival.ro <ExternalLink size={14} /></a></div>
      </div>
    </div>
  </section>;
}

type CinemaMovie = { title: string; date: string; imageUrl: string; url: string; status: string };

const fallbackFilms: CinemaMovie[] = [
  { title: "Spider Man: Brand New Day", imageUrl: asset("cinema-spider-man.webp"), date: "szept. 13. és szept. 15.", status: "MŰSORON", url: "https://cinemacsikimozi.ro/hu/film/spider-man-brand-new-day" },
  { title: "The Odyssey", imageUrl: "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2F3f97f680-2edb-4837-bc67-ba5b11ed2dd7%2Fimages%2Fodusszeia_11cfd682-1a00-4088-abb7-4f70939e8eb1.jpg&width=375&height=562&format=webp", date: "szept. 13. és szept. 16.", status: "MŰSORON", url: "https://cinemacsikimozi.ro/hu/film/the-odyssey" },
  { title: "Fall 2: Deadpoint", imageUrl: "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2Fc78dd653-d133-4fea-b524-1e9faec29a77%2Fimages%2FFall2_b2f25711-2ac5-459c-a030-0aca0998110e.jpg&width=375&height=562&format=webp", date: "szept. 17.", status: "KÖVETKEZIK", url: "https://cinemacsikimozi.ro/hu/film/fall-2-deadpoint" },
  { title: "Cars", imageUrl: "https://api.cinemacsikimozi.ro/api/image/format?image=uploads%2Fmovies%2F2af1df8b-6c32-4dbd-b93f-3e5738bb4322%2Fimages%2Fcars_f76a13cb-7c8a-4620-a679-7bc1ebdec984.jpg&width=375&height=562&format=webp", date: "szept. 18.", status: "KÖVETKEZIK", url: "https://cinemacsikimozi.ro/hu/film/cars" },
];
export function CinemaPicks() {
  const [films, setFilms] = useState<CinemaMovie[]>(fallbackFilms);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/cinema", { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => { if (Array.isArray(data.movies) && data.movies.length) setFilms(data.movies.slice(0, 4)); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  return <section className="cinema-section"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7"><div><p className="text-sm font-bold tracking-wider text-rose-500 mb-2">MOZI-AJÁNLÓ · CSÍKI MOZI</p><h2 className="text-3xl font-bold tracking-tight">Most a vásznon</h2><p className="text-sm text-muted-foreground mt-2">Aktuális vetítések és a következő premierek a belvárosban.</p></div><a href="https://cinemacsikimozi.ro/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Teljes műsor a cinemacsikimozi.ro-n <ArrowRight size={16} /></a></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{films.map(film => <a key={film.title} href={film.url} target="_blank" rel="noopener noreferrer" className="group min-w-0"><div className="cinema-poster"><img src={film.imageUrl} alt={film.title} loading="lazy" /><span className="cinema-badge">{film.status}</span><div className="cinema-caption"><h3>{film.title}</h3><p>Aktuális vetítés a Csíki Moziban</p></div></div><div className="flex justify-between gap-2 text-sm mt-3"><span>{film.date}</span><span className="text-primary font-semibold">Filmoldal ↗</span></div><p className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><Ticket size={13} /> Jegyek a mozi pénztárában</p></a>)}</div>
  </div></section>;
}
