import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle2, MapPin, Calendar, Tag, Link2, User, Mail, Image, FileText, DollarSign } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { getOrganizer } from "@/data/organizers";

function Field({ label, icon: Icon, children, hint }: { label: string; icon?: any; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SubmitPage() {
  const [location] = useLocation();
  const organizerSlug = new URLSearchParams(location.split("?")[1] ?? "").get("organizer") ?? "";
  const organizer = getOrganizer(organizerSlug);
  const [organizerToken, setOrganizerToken] = useState<string | null>(null);
  useEffect(() => {
    setOrganizerToken(window.localStorage.getItem("organizer_token"));
  }, []);
  const { data: catData } = useListCategories();
  const categories = catData?.categories ?? [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startDate: "",
    startTime: "18:00",
    endDate: "",
    location: "",
    locationAddress: "",
    categoryId: "",
    price: "",
    ticketUrl: "",
    submitterName: organizer?.name ?? "",
    submitterEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.startDate || !form.location) {
      setError("Kérjük töltsd ki a kötelező mezőket (csillaggal jelölve).");
      return;
    }
    setLoading(true);
    try {
      const startDateTime = form.startDate + "T" + form.startTime + ":00";
      const endpoint = organizerToken ? "/api/organizers/me/events" : "/api/events/submit";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (organizerToken) headers.Authorization = `Bearer ${organizerToken}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl: form.imageUrl || undefined,
          startDate: startDateTime,
          endDate: form.endDate ? form.endDate + "T23:59:00" : undefined,
          location: form.location,
          locationAddress: form.locationAddress || undefined,
          categoryId: form.categoryId ? Number(form.categoryId) : undefined,
          price: form.price || undefined,
          ticketUrl: form.ticketUrl || undefined,
          submitterName: form.submitterName || undefined,
          submitterEmail: form.submitterEmail || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Hiba történt a beküldéskor.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Hálózati hiba. Kérjük próbáld újra.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Köszönjük a beküldést!</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            A programod megkaptuk és hamarosan felülvizsgáljuk. Jóváhagyás után megjelenik az oldalon.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
                Vissza a főoldalra
              </button>
            </Link>
            <button
              onClick={() => { setSuccess(false); setForm({ title:"",description:"",imageUrl:"",startDate:"",startTime:"18:00",endDate:"",location:"",locationAddress:"",categoryId:"",price:"",ticketUrl:"",submitterName: organizer?.name ?? "",submitterEmail:"" }); }}
              className="px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors"
            >
              Másik program
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const textareaClass = inputClass + " resize-none";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back */}
      <Link href="/">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Vissza a főoldalra
        </button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Program beküldése</span>
          <h1 className="text-3xl font-bold text-foreground mt-1 mb-2">Van saját programod?</h1>
          <p className="text-muted-foreground">Töltsd ki az alábbi formot és mi felülvizsgáljuk, majd közzétesszük az oldalon.</p>
          {organizer && <div className="mt-4 rounded-xl border border-[#cce5a5] bg-[#eff8dc] px-4 py-3 text-sm text-[#31553a]"><strong>{organizer.name}</strong> profiljához küldöd be ezt a programot. Több eseményt is beküldhetsz egymás után.</div>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Alapadatok</p>

            <Field label="Program neve *" icon={FileText}>
              <input className={inputClass} placeholder="pl. Esztendő kereke – Táncest" value={form.title} onChange={e => set("title", e.target.value)} />
            </Field>

            <Field label="Leírás *" icon={FileText} hint="Pár mondat a programról, mi várja a látogatókat.">
              <textarea className={textareaClass} rows={4} placeholder="Rövid, lelkes leírás a programról..." value={form.description} onChange={e => set("description", e.target.value)} />
            </Field>

            <Field label="Borítókép URL" icon={Image} hint="Opcionális – egy jó minőségű kép URL-je (pl. Dropbox, Google Drive nyilvános link).">
              <input className={inputClass} placeholder="https://..." value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)} />
            </Field>
          </div>

          {/* When & where */}
          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mikor & hol</p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Dátum *" icon={Calendar}>
                <input type="date" className={inputClass} value={form.startDate} onChange={e => set("startDate", e.target.value)} />
              </Field>
              <Field label="Időpont" icon={Calendar}>
                <input type="time" className={inputClass} value={form.startTime} onChange={e => set("startTime", e.target.value)} />
              </Field>
            </div>

            <Field label="Helyszín *" icon={MapPin} hint="A helyszín neve, pl. Csíki Játékszín">
              <input className={inputClass} placeholder="pl. Csíki Játékszín" value={form.location} onChange={e => set("location", e.target.value)} />
            </Field>

            <Field label="Pontos cím" icon={MapPin} hint="Opcionális">
              <input className={inputClass} placeholder="pl. Piața Cetății 2, Miercurea Ciuc" value={form.locationAddress} onChange={e => set("locationAddress", e.target.value)} />
            </Field>
          </div>

          {/* Details */}
          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Részletek</p>

            <Field label="Kategória" icon={Tag}>
              <select className={inputClass} value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
                <option value="">– Válassz kategóriát –</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Belépő ára" icon={DollarSign}>
                <input className={inputClass} placeholder="pl. 50 RON vagy Ingyenes" value={form.price} onChange={e => set("price", e.target.value)} />
              </Field>
              <Field label="Jegyvásárlás / info link" icon={Link2}>
                <input className={inputClass} placeholder="https://..." value={form.ticketUrl} onChange={e => set("ticketUrl", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kapcsolat (opcionális)</p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Neved" icon={User}>
                <input className={inputClass} placeholder="Kovács János" value={form.submitterName} onChange={e => set("submitterName", e.target.value)} />
              </Field>
              <Field label="Email" icon={Mail}>
                <input type="email" className={inputClass} placeholder="pelda@gmail.com" value={form.submitterEmail} onChange={e => set("submitterEmail", e.target.value)} />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">Kapcsolattartáshoz, ha kérdésünk van a programmal kapcsolatban. Nem tesszük közzé.</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {loading ? "Beküldés..." : "Program beküldése felülvizsgálatra"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
