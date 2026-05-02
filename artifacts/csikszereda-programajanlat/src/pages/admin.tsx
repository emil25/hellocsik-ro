import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Trash2, Star, Crown, Eye, EyeOff,
  LogOut, RefreshCw, Clock, Users, CalendarCheck, AlertCircle, Settings, List
} from "lucide-react";
import { Link } from "wouter";

const API = "/api";

function useAdminToken() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("admin_token"));
  function login(t: string) { localStorage.setItem("admin_token", t); setToken(t); }
  function logout() { localStorage.removeItem("admin_token"); setToken(null); }
  return { token, login, logout };
}

function LoginScreen({ onLogin }: { onLogin: (t: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        const d = await res.json();
        onLogin(d.token);
      } else {
        setError("Helytelen jelszó.");
      }
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-card-border rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground text-center mb-1">Admin bejelentkezés</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">csík.online kezelőfelület</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder="Jelszó"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(""); }}
            className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60">
            {loading ? "Belépés..." : "Belépés"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/"><span className="text-xs text-muted-foreground hover:underline cursor-pointer">Vissza a főoldalra</span></Link>
        </div>
      </motion.div>
    </div>
  );
}

type EventRow = {
  id: number; title: string; location: string; startDate: string; status: string;
  featured: boolean; monthHighlight: boolean; submitterName?: string; submitterEmail?: string;
  imageUrl: string; createdAt: string; category?: { name: string; color: string } | null;
};

type Tab = "pending" | "published" | "all";

export default function AdminPage() {
  const { token, login, logout } = useAdminToken();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchEvents = useCallback(async (status: Tab) => {
    if (!token) return;
    setLoading(true);
    try {
      const q = status === "all" ? "all" : status;
      const res = await fetch(`${API}/admin/events?status=${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); return; }
      const d = await res.json();
      setEvents(d.events ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchEvents(tab); }, [tab, fetchEvents]);

  async function patch(id: number, body: object) {
    setActionId(id);
    await fetch(`${API}/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    await fetchEvents(tab);
    setActionId(null);
  }

  async function del(id: number) {
    if (!confirm("Biztosan törölni szeretnéd ezt az eseményt?")) return;
    setActionId(id);
    await fetch(`${API}/admin/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchEvents(tab);
    setActionId(null);
  }

  if (!token) return <LoginScreen onLogin={login} />;

  const pending = events.filter(e => e.status === "pending");
  const published = events.filter(e => e.status === "published");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pending", label: "Jóváhagyásra vár", count: pending.length },
    { key: "published", label: "Közzétett", count: published.length },
    { key: "all", label: "Mind" },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">csík.online Admin</p>
            <p className="text-xs text-muted-foreground">Kezelőfelület</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <button className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">Főoldal</button>
          </Link>
          <button onClick={() => fetchEvents(tab)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Kilépés
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Clock, label: "Várakozó", value: events.filter(e=>e.status==="pending").length, color: "text-amber-600", bg: "bg-amber-50" },
            { icon: CalendarCheck, label: "Közzétett", value: events.filter(e=>e.status==="published").length, color: "text-green-700", bg: "bg-green-50" },
            { icon: Star, label: "Kiemelt", value: events.filter(e=>e.featured && e.status==="published").length, color: "text-purple-600", bg: "bg-purple-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? "bg-primary/10 text-primary" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Events list */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Betöltés...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Nincs megjeleníthető esemény ebben a nézetben.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {events.map(ev => (
                <motion.div key={ev.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className={`bg-card border rounded-2xl p-4 flex gap-4 items-start ${ev.status === "pending" ? "border-amber-200 bg-amber-50/30" : "border-card-border"}`}>
                  {/* Thumb */}
                  <img src={ev.imageUrl} alt={ev.title} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-muted" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm text-foreground leading-snug">{ev.title}</p>
                      {ev.status === "pending" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Várakozó</span>
                      )}
                      {ev.featured && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Kiemelt</span>
                      )}
                      {ev.monthHighlight && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Hó ajánlata</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(ev.startDate).toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })} · {ev.location}
                    </p>
                    {ev.submitterName && (
                      <p className="text-xs text-muted-foreground">
                        Beküldte: {ev.submitterName}{ev.submitterEmail ? ` (${ev.submitterEmail})` : ""}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {ev.status === "pending" && (
                      <button onClick={() => patch(ev.id, { status: "published" })} disabled={actionId === ev.id}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                        <CheckCircle2 className="w-3 h-3" /> Jóváhagy
                      </button>
                    )}
                    {ev.status === "pending" && (
                      <button onClick={() => patch(ev.id, { status: "rejected" })} disabled={actionId === ev.id}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                        <XCircle className="w-3 h-3" /> Elutasít
                      </button>
                    )}
                    {ev.status === "published" && (
                      <button onClick={() => patch(ev.id, { status: "pending" })} disabled={actionId === ev.id}
                        className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                        <EyeOff className="w-3 h-3" /> Elrejt
                      </button>
                    )}
                    <button onClick={() => patch(ev.id, { featured: !ev.featured })} disabled={actionId === ev.id}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${ev.featured ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      <Star className="w-3 h-3" /> {ev.featured ? "Kiemelt" : "Kiemel"}
                    </button>
                    <button onClick={() => patch(ev.id, { monthHighlight: !ev.monthHighlight })} disabled={actionId === ev.id}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${ev.monthHighlight ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      <Crown className="w-3 h-3" /> {ev.monthHighlight ? "Hó ajánlata" : "Hó ajánlata"}
                    </button>
                    <button onClick={() => del(ev.id)} disabled={actionId === ev.id}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3 h-3" /> Töröl
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
