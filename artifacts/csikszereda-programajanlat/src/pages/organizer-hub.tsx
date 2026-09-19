import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, FilePlus2, Image, LayoutDashboard, LogIn, LogOut, MapPin, Pencil, Plus, Save, UserRound, X } from "lucide-react";
import { Link } from "wouter";
import "@/components/organizer-portal.css";

type Organizer = { id: number; slug: string; name: string; bio: string; city: string; website?: string | null };
type OrganizerEvent = { id: number; title: string; description: string; startDate: string; endDate?: string | null; location: string; locationAddress?: string | null; status: string; imageUrl?: string; ticketUrl?: string | null; price?: string | null; facebookUrl?: string | null; newsLinks?: string[]; categoryId?: number | null; promotionPlan?: string; promotionStatus?: string };

const TOKEN_KEY = "organizer_token";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function OrganizerHubPage() {
  const query = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const highlightRequested = query.get("kiemeles") === "1";
  const promotionPlan = query.get("csomag") === "fooldal" ? "homepage" : "featured";
  const promotionLabel = promotionPlan === "homepage" ? "Főoldal+ (99 RON / esemény)" : "Kiemelt (49 RON / esemény)";
  const [mode, setMode] = useState<"login" | "register">("register");
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<OrganizerEvent | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", startDate: "", location: "", imageUrl: "", price: "", ticketUrl: "", facebookUrl: "", promotionPlan: "free" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "Csíkszereda", bio: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = useMemo(() => typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null, [organizer]);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;
    fetch("/api/organizers/me", { headers: { Authorization: `Bearer ${savedToken}` } })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("session")))
      .then((data) => setOrganizer(data.organizer))
      .catch(() => window.localStorage.removeItem(TOKEN_KEY));
  }, []);

  useEffect(() => {
    if (!organizer || !token) return;
    fetch("/api/organizers/me/events", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("events")))
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, [organizer, token]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function handleAuth(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "register" ? "/api/organizers/register" : "/api/organizers/login";
      const body = mode === "register" ? form : { email: form.email, password: form.password };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nem sikerült kapcsolódni.");
      window.localStorage.setItem(TOKEN_KEY, data.token);
      setOrganizer(data.organizer);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "A művelet nem sikerült.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setOrganizer(null);
    setEvents([]);
    setEditingEvent(null);
    setForm({ name: "", email: "", password: "", city: "Csíkszereda", bio: "" });
  }

  function startEditing(event: OrganizerEvent) {
    setEditingEvent(event);
    const facebookUrl = (event.newsLinks ?? []).map((raw) => { try { return JSON.parse(raw) as { title?: string; url?: string }; } catch { return null; } }).find((link) => link && /facebook/i.test(link.title ?? ""))?.url ?? "";
    setEditForm({ title: event.title, description: event.description ?? "", startDate: event.startDate.slice(0, 16), location: event.location, imageUrl: event.imageUrl ?? "", price: event.price ?? "", ticketUrl: event.ticketUrl ?? "", facebookUrl, promotionPlan: event.promotionPlan ?? "free" });
    setError("");
  }

  async function saveEditing(event: React.FormEvent) {
    event.preventDefault();
    if (!editingEvent || !token) return;
    setSavingEdit(true);
    setError("");
    try {
      const response = await fetch(`/api/organizers/me/events/${editingEvent.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...editForm, startDate: new Date(editForm.startDate).toISOString() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "A módosítás nem sikerült.");
      const refreshed = await fetch("/api/organizers/me/events", { headers: { Authorization: `Bearer ${token}` } });
      const refreshedData = await refreshed.json();
      setEvents(refreshedData.events ?? []);
      setEditingEvent(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "A módosítás nem sikerült.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="organizer-hub-page">
      <section className="organizer-hub-hero"><span className="organizer-kicker"><LayoutDashboard size={15} /> SZERVEZŐI FELÜLET</span><h1>A programjaid<br /><em>otthona.</em></h1><p>Regisztrálj egy ingyenes szervezői fiókot, és tölts fel több eseményt egy helyről.</p></section>
      <main className="organizer-hub-main">
        {highlightRequested && <div className="organizer-highlight-request"><CheckCircle2 size={18} /><span>A <strong>{promotionLabel}</strong> csomag kiválasztva. Belépés után küldd be az eseményt, és felvesszük veled a kapcsolatot az egyszeri díjról.</span></div>}
        {organizer ? <section className="organizer-dashboard">
          <div className="organizer-dashboard-head"><div className="organizer-dashboard-identity"><div className="organizer-profile-avatar" style={{ background: "#173d2d" }}><UserRound size={22} /></div><div><span className="organizer-kicker">BEJELENTKEZVE</span><h2>{organizer.name}</h2><p><MapPin size={14} /> {organizer.city}</p></div></div><button type="button" onClick={logout} className="organizer-secondary-button organizer-logout-button"><LogOut size={15} /> Kilépés</button></div>
          <div className="organizer-dashboard-actions"><Link href={`/bekuldese?organizer=${encodeURIComponent(organizer.slug)}${highlightRequested ? `&csomag=${promotionPlan === "homepage" ? "fooldal" : "kiemelt"}` : ""}`} className="organizer-primary-button"><Plus size={16} /> Új esemény beküldése</Link><Link href={`/szervezo/${organizer.slug}`} className="organizer-secondary-button"><UserRound size={15} /> Profil megtekintése</Link></div>
          <div className="organizer-dashboard-section"><div className="organizer-section-heading"><div><span>SAJÁT PROGRAMOK</span><h2>{events.length ? `${events.length} eseményed` : "Még nincs eseményed"}</h2></div><p>Egy fiókból bármennyi programot kezelhetsz.</p></div>{editingEvent && <form className="organizer-edit-panel" onSubmit={saveEditing}><div className="organizer-edit-panel-head"><div><span className="organizer-kicker">ESEMÉNY SZERKESZTÉSE</span><h3>{editingEvent.title}</h3></div><button type="button" onClick={() => setEditingEvent(null)} aria-label="Szerkesztés bezárása"><X size={18} /></button></div><div className="organizer-edit-grid"><label>Cím<input required value={editForm.title} onChange={(e) => setEditForm((current) => ({ ...current, title: e.target.value }))} /></label><label>Időpont<input required type="datetime-local" value={editForm.startDate} onChange={(e) => setEditForm((current) => ({ ...current, startDate: e.target.value }))} /></label><label>Helyszín<input required value={editForm.location} onChange={(e) => setEditForm((current) => ({ ...current, location: e.target.value }))} /></label><label>Megjelenés<select value={editForm.promotionPlan} onChange={(e) => setEditForm((current) => ({ ...current, promotionPlan: e.target.value }))}><option value="free">Alap · 0 RON</option><option value="featured">Kiemelt · 49 RON / esemény</option><option value="homepage">Főoldal+ · 99 RON / esemény</option></select></label><label className="organizer-edit-wide">Leírás<textarea required rows={4} value={editForm.description} onChange={(e) => setEditForm((current) => ({ ...current, description: e.target.value }))} /></label><label>Borítókép URL<input value={editForm.imageUrl} onChange={(e) => setEditForm((current) => ({ ...current, imageUrl: e.target.value }))} /></label><label>Jegy / info link<input value={editForm.ticketUrl} onChange={(e) => setEditForm((current) => ({ ...current, ticketUrl: e.target.value }))} /></label><label>Belépő ára<input value={editForm.price} onChange={(e) => setEditForm((current) => ({ ...current, price: e.target.value }))} /></label></div>{error && <div className="organizer-auth-error">{error}</div>}<div className="organizer-edit-actions"><button type="button" onClick={() => setEditingEvent(null)} className="organizer-secondary-button">Mégse</button><button type="submit" disabled={savingEdit} className="organizer-primary-button"><Save size={15} /> {savingEdit ? "Mentés..." : "Mentés"}</button></div></form>}{events.length ? <div className="organizer-dashboard-events">{events.map((event) => <article key={event.id} className="organizer-dashboard-event"><div className="organizer-dashboard-event-date"><CalendarDays size={15} /> {formatDate(event.startDate)}</div><h3>{event.title}</h3><p><MapPin size={14} /> {event.location}</p><div className="organizer-dashboard-event-foot"><span className={`organizer-status organizer-status-${event.status}`}>{event.status === "published" ? "Közzétéve" : "Ellenőrzés alatt"}</span><button type="button" onClick={() => startEditing(event)} className="organizer-event-edit-button"><Pencil size={12} /> Szerkesztés</button></div></article>)}</div> : <div className="organizer-dashboard-empty"><FilePlus2 size={23} /><h3>Indítsd el az első programoddal</h3><p>A beküldés után az eseményed ellenőrzésre kerül, majd megjelenik a portálon.</p><Link href={`/bekuldese?organizer=${encodeURIComponent(organizer.slug)}`} className="organizer-primary-button"><Plus size={15} /> Első esemény beküldése</Link></div>}</div>
        </section> : <div className="organizer-hub-layout"><section className="organizer-hub-form"><div className="organizer-hub-form-head"><div className="organizer-profile-avatar small"><UserRound size={20} /></div><div><span>{mode === "register" ? "ELSŐ LÉPÉS" : "VISSZATÉRŐ SZERVEZŐ"}</span><h2>{mode === "register" ? "Hozd létre a fiókod" : "Üdv újra"}</h2></div></div><div className="organizer-auth-tabs"><button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Regisztráció</button><button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Belépés</button></div><form onSubmit={handleAuth}>{mode === "register" && <><label>Szervező / intézmény neve<input required minLength={2} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="pl. Csíki Játékszín" /></label><label>Város<input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Csíkszereda" /></label><label>Rövid bemutatkozás<textarea rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Milyen programokat szervezel?" /></label></>}<label>E-mail cím<input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="nev@szervezet.ro" /></label><label>Jelszó<input required minLength={8} type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Legalább 8 karakter" /></label>{error && <div className="organizer-auth-error">{error}</div>}<div className="organizer-hub-form-actions"><Link href="/arak" className="organizer-secondary-button">Csomagok</Link><button type="submit" disabled={loading} className="organizer-primary-button">{loading ? "Folyamatban..." : mode === "register" ? "Fiók létrehozása" : "Belépés"} {mode === "login" ? <LogIn size={15} /> : <ArrowRight size={16} />}</button></div></form></section><aside className="organizer-hub-aside"><span className="organizer-kicker">MIT KAPSZ?</span><h2>Minden eseményed együtt.</h2><ul><li><FilePlus2 size={18} /><span><strong>Több program</strong><small>Egy profilból több esemény beküldése és követése.</small></span></li><li><Image size={18} /><span><strong>Saját megjelenés</strong><small>Kép, leírás és kapcsolat egy rendezett oldalon.</small></span></li><li><UserRound size={18} /><span><strong>Megtalálható profil</strong><small>Ha valaki rád kattint, látja a programjaidat.</small></span></li></ul></aside></div>}
      </main>
    </div>
  );
}
