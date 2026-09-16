import { useState } from "react";
import { ArrowRight, CheckCircle2, FilePlus2, Image, LayoutDashboard, Plus, UserRound } from "lucide-react";
import { Link } from "wouter";
import "@/components/organizer-portal.css";

export default function OrganizerHubPage() {
  const [name, setName] = useState("");
  const [created, setCreated] = useState(false);
  return (
    <div className="organizer-hub-page"><section className="organizer-hub-hero"><span className="organizer-kicker"><LayoutDashboard size={15} /> SZERVEZŐI FELÜLET</span><h1>A programjaid<br /><em>otthona.</em></h1><p>Hozd létre a szervezői profilodat, majd tölts fel több eseményt egy helyen.</p></section>
      <main className="organizer-hub-main"><div className="organizer-hub-layout"><section className="organizer-hub-form"><div className="organizer-hub-form-head"><div className="organizer-profile-avatar small"><UserRound size={20} /></div><div><span>PROFIL LÉTREHOZÁSA</span><h2>Induljunk el</h2></div></div>{created ? <div className="organizer-hub-success"><CheckCircle2 size={30} /><h3>A profilvázlat elkészült</h3><p>Most már beküldheted az első programodat. A profilod az események jóváhagyása után jelenik meg.</p><Link href={`/bekuldese?organizer=${encodeURIComponent(name || "szervezo")}`} className="organizer-primary-button"><Plus size={15} /> Első esemény beküldése</Link></div> : <form onSubmit={(event) => { event.preventDefault(); setCreated(true); }}><label>Szervező / intézmény neve<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="pl. Csíki Játékszín" /></label><label>Rövid bemutatkozás<textarea rows={4} placeholder="Milyen programokat szervezel?" /></label><div className="organizer-hub-form-actions"><Link href="/arak" className="organizer-secondary-button">Csomagok megtekintése</Link><button type="submit" className="organizer-primary-button">Profil folytatása <ArrowRight size={16} /></button></div></form>}</section><aside className="organizer-hub-aside"><span className="organizer-kicker">MIT KAPSZ?</span><h2>Minden eseményed együtt.</h2><ul><li><FilePlus2 size={18} /><span><strong>Több program</strong><small>Egy profilból több esemény beküldése.</small></span></li><li><Image size={18} /><span><strong>Saját megjelenés</strong><small>Kép, leírás és kapcsolat egy rendezett oldalon.</small></span></li><li><UserRound size={18} /><span><strong>Megtalálható profil</strong><small>Ha valaki rád kattint, látja a programjaidat.</small></span></li></ul></aside></div></main>
    </div>
  );
}

