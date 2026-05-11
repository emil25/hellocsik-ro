import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Trash2, Crown, EyeOff,
  LogOut, RefreshCw, Clock, CalendarCheck, AlertCircle, Settings, Pencil, X,
  Plus, LayoutDashboard, Star, Upload, ImageIcon, Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useUpload } from "@workspace/object-storage-web";

const API = "/api";

// ─── IMAGE UPLOAD FIELD ───────────────────────────────────────────────────────

function ImageUploadField({
  value, onChange, onBusyChange
}: {
  value: string;
  onChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"url" | "upload">("url");
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: (res) => {
      const serveUrl = `/api/storage${res.objectPath}`;
      onChange(serveUrl);
      setUploadedPreview(serveUrl);
      setUploadError("");
      onBusyChange?.(false);
    },
    onError: (err) => {
      setUploadError(err.message || "Feltöltési hiba");
      onBusyChange?.(false);
    },
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Csak képfájl tölthető fel."); return; }
    setUploadError("");
    onBusyChange?.(true);
    await uploadFile(file);
  }

  const preview = uploadedPreview || value;

  return (
    <div>
      <label className={labelCls}>Kép (fotó / plakát)</label>
      <div className="flex gap-1 mb-2">
        <button type="button" onClick={() => setTab("url")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${tab === "url" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
          URL
        </button>
        <button type="button" onClick={() => setTab("upload")}
          className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors flex items-center gap-1 ${tab === "upload" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
          <Upload className="w-3 h-3" /> Feltöltés
        </button>
      </div>

      {tab === "url" ? (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputCls}
          placeholder="https://..."
        />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading}
            className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-colors bg-muted/30 disabled:opacity-60">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-xs text-muted-foreground">{progress}% feltöltve...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Kattints a feltöltéshez (JPG, PNG, WebP)</span>
              </>
            )}
          </button>
          {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        </div>
      )}

      {preview && (
        <img src={preview} alt="előnézet" className="mt-2 h-28 w-full object-cover rounded-xl border border-border" />
      )}
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

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
  id: number; title: string; description: string; location: string; locationAddress?: string;
  startDate: string; endDate?: string; status: string; featured: boolean; monthHighlight: boolean;
  submitterName?: string; submitterEmail?: string; imageUrl: string; ticketUrl?: string;
  price?: string; createdAt: string; categoryId?: number;
  category?: { id: number; name: string; color: string } | null;
};

type Category = { id: number; name: string; color: string; slug: string };

type Tab = "pending" | "published" | "all";

// ─── SHARED FORM FIELDS ───────────────────────────────────────────────────────

function toDatetimeLocal(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type EventForm = {
  title: string; description: string; location: string; locationAddress: string;
  startDate: string; endDate: string; price: string; ticketUrl: string;
  imageUrl: string; categoryId: string; featured: boolean; monthHighlight: boolean;
};

const emptyForm = (): EventForm => ({
  title: "", description: "", location: "", locationAddress: "",
  startDate: "", endDate: "", price: "", ticketUrl: "",
  imageUrl: "", categoryId: "", featured: false, monthHighlight: false,
});

const inputCls = "w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background";
const labelCls = "block text-xs font-semibold text-muted-foreground mb-1";

function EventFormFields({
  form, set, onImageBusyChange
}: {
  form: EventForm;
  set: (field: keyof EventForm, val: string | boolean) => void;
  onImageBusyChange?: (busy: boolean) => void;
}) {
  return (
    <>
      <div>
        <label className={labelCls}>Cím *</label>
        <input required value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} placeholder="Esemény neve" />
      </div>

      <div>
        <label className={labelCls}>Leírás</label>
        <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
          className={inputCls + " resize-none"} placeholder="Rövid leírás..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Kezdés *</label>
          <input required type="datetime-local" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Befejezés</label>
          <input type="datetime-local" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Helyszín *</label>
        <input required value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} placeholder="pl. Mikó-vár" />
      </div>

      <div>
        <label className={labelCls}>Pontos cím</label>
        <input value={form.locationAddress} onChange={e => set("locationAddress", e.target.value)} className={inputCls} placeholder="pl. Főtér 1." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Ár</label>
          <input value={form.price} onChange={e => set("price", e.target.value)} className={inputCls} placeholder="pl. 500 RON / Ingyenes" />
        </div>
        <div>
          <label className={labelCls}>Kategória</label>
          <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} className={inputCls}>
            <option value="">— nincs —</option>
          </select>
        </div>
      </div>

      <ImageUploadField
        value={form.imageUrl}
        onChange={url => set("imageUrl", url)}
        onBusyChange={onImageBusyChange}
      />

      <div>
        <label className={labelCls}>Jegy / részletek URL</label>
        <input type="url" value={form.ticketUrl} onChange={e => set("ticketUrl", e.target.value)} className={inputCls} placeholder="https://..." />
      </div>

      <div className="flex gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => set("featured", !form.featured)}
            className={`w-10 h-5 rounded-full relative transition-colors ${form.featured ? "bg-amber-500" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <LayoutDashboard className="w-3 h-3" /> Megjelenik a Heróban
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => set("monthHighlight", !form.monthHighlight)}
            className={`w-10 h-5 rounded-full relative transition-colors ${form.monthHighlight ? "bg-green-600" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.monthHighlight ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Crown className="w-3 h-3" /> Hó ajánlata
          </span>
        </label>
      </div>
    </>
  );
}

// ─── CREATE MODAL ──────────────────────────────────────────────────────────────

function CreateModal({
  categories, token, onSaved, onClose
}: {
  categories: Category[]; token: string;
  onSaved: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<EventForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof EventForm, val: string | boolean) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        location: form.location,
        locationAddress: form.locationAddress || null,
        imageUrl: form.imageUrl || null,
        price: form.price || null,
        ticketUrl: form.ticketUrl || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        featured: form.featured,
        monthHighlight: form.monthHighlight,
      };
      const res = await fetch(`${API}/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Hiba történt.");
        return;
      }
      onSaved();
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-bold text-foreground">Új esemény létrehozása</h2>
            <p className="text-xs text-muted-foreground">Az esemény azonnal közzéttételre kerül</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <CategorySelect form={form} set={set} categories={categories} onImageBusyChange={setImageUploading} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              Mégsem
            </button>
            <button type="submit" disabled={saving || imageUploading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {imageUploading ? "Kép feltöltése..." : saving ? "Létrehozás..." : "Létrehozás"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── EDIT MODAL ──────────────────────────────────────────────────────────────

function EditModal({
  ev, categories, token, onSaved, onClose
}: {
  ev: EventRow; categories: Category[]; token: string;
  onSaved: () => void; onClose: () => void;
}) {
  const [form, setForm] = useState<EventForm>({
    title: ev.title,
    description: ev.description,
    location: ev.location,
    locationAddress: ev.locationAddress ?? "",
    startDate: toDatetimeLocal(ev.startDate),
    endDate: ev.endDate ? toDatetimeLocal(ev.endDate) : "",
    price: ev.price ?? "",
    ticketUrl: ev.ticketUrl ?? "",
    imageUrl: ev.imageUrl,
    categoryId: ev.categoryId ? String(ev.categoryId) : "",
    featured: ev.featured,
    monthHighlight: ev.monthHighlight,
  });
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof EventForm, val: string | boolean) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        location: form.location,
        locationAddress: form.locationAddress || null,
        imageUrl: form.imageUrl,
        price: form.price || null,
        ticketUrl: form.ticketUrl || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        featured: form.featured,
        monthHighlight: form.monthHighlight,
      };
      const res = await fetch(`${API}/admin/events/${ev.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Hiba történt.");
        return;
      }
      onSaved();
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-bold text-foreground">Esemény szerkesztése</h2>
            <p className="text-xs text-muted-foreground line-clamp-1">{ev.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <CategorySelect form={form} set={set} categories={categories} onImageBusyChange={setImageUploading} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              Mégsem
            </button>
            <button type="submit" disabled={saving || imageUploading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {imageUploading ? "Kép feltöltése..." : saving ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── KNOWN VENUES LOOKUP ──────────────────────────────────────────────────────

const KNOWN_VENUES: Record<string, string> = {
  "csíki játékszín": "Piața Libertății 16, Csíkszereda",
  "játékszín": "Piața Libertății 16, Csíkszereda",
  "csiki jatekszin": "Piața Libertății 16, Csíkszereda",
  "csíki mozi": "Piața Majláth 1., Csíkszereda",
  "csiki mozi": "Piața Majláth 1., Csíkszereda",
  "mozi": "Piața Majláth 1., Csíkszereda",
  "mikó-vár": "Str. Cetății 2, Csíkszereda",
  "mikó vár": "Str. Cetății 2, Csíkszereda",
  "miko-var": "Str. Cetății 2, Csíkszereda",
  "park hotel": "Str. Olt 2, Csíkszereda",
  "hotel park": "Str. Olt 2, Csíkszereda",
  "hámor park": "Hámor Park, Csíkszereda",
  "hamor park": "Hámor Park, Csíkszereda",
  "sapientia emte": "Piața Libertății 1, Csíkszereda",
  "sapientia": "Piața Libertății 1, Csíkszereda",
  "szabadság tér": "Piața Libertății, Csíkszereda",
  "szabadsag ter": "Piața Libertății, Csíkszereda",
  "főtér": "Piața Cetății, Csíkszereda",
  "foter": "Piața Cetății, Csíkszereda",
  "csíksomlyó": "Șumuleu Ciuc, Csíksomlyó",
  "csíksomlyói kegyhely": "Șumuleu Ciuc, Csíksomlyó",
  "csíki sörgyár": "Str. Harghita 2, Csíkszereda",
  "csiki sorgyar": "Str. Harghita 2, Csíkszereda",
  "városi sportcsarnok": "Str. Stadionului, Csíkszereda",
  "sportcsarnok": "Str. Stadionului, Csíkszereda",
  "kemenes kultúrpark": "Kemenes Kultúrpark, Csíkszereda",
};

function lookupVenueAddress(location: string): string | null {
  const key = location.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_VENUES)) {
    if (key === k || key.includes(k)) return v;
  }
  return null;
}

// Separate component to inject categories into the select
function CategorySelect({
  form, set, categories, onImageBusyChange
}: {
  form: EventForm;
  set: (field: keyof EventForm, val: string | boolean) => void;
  categories: Category[];
  onImageBusyChange?: (busy: boolean) => void;
}) {
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    if (form.location && !form.locationAddress) {
      const found = lookupVenueAddress(form.location);
      if (found) {
        set("locationAddress", found);
        setAutoFilled(true);
      }
    } else {
      setAutoFilled(false);
    }
  }, [form.location]);

  return (
    <>
      <div>
        <label className={labelCls}>Cím *</label>
        <input required value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} placeholder="Esemény neve" />
      </div>

      <div>
        <label className={labelCls}>Leírás</label>
        <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
          className={inputCls + " resize-none"} placeholder="Rövid leírás..." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Kezdés *</label>
          <input required type="datetime-local" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Befejezés</label>
          <input type="datetime-local" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Helyszín *</label>
        <input required value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} placeholder="pl. Mikó-vár" />
      </div>

      <div>
        <label className={labelCls}>
          Pontos cím
          {autoFilled && (
            <span className="ml-2 text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              ✓ auto-kitöltve
            </span>
          )}
        </label>
        <input value={form.locationAddress} onChange={e => { set("locationAddress", e.target.value); setAutoFilled(false); }} className={inputCls} placeholder="pl. Főtér 1." />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Ár</label>
          <input value={form.price} onChange={e => set("price", e.target.value)} className={inputCls} placeholder="pl. 500 RON / Ingyenes" />
        </div>
        <div>
          <label className={labelCls}>Kategória</label>
          <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)} className={inputCls}>
            <option value="">— nincs —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <ImageUploadField
        value={form.imageUrl}
        onChange={url => set("imageUrl", url)}
        onBusyChange={onImageBusyChange}
      />

      <div>
        <label className={labelCls}>Jegy / részletek URL</label>
        <input type="url" value={form.ticketUrl} onChange={e => set("ticketUrl", e.target.value)} className={inputCls} placeholder="https://..." />
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Megjelenési beállítások</p>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set("featured", !form.featured)}
            className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${form.featured ? "bg-amber-500" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
              Megjelenik a Hero szekcióban
            </p>
            <p className="text-xs text-muted-foreground">A főoldal tetején nagy kártyaként jelenik meg</p>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => set("monthHighlight", !form.monthHighlight)}
            className={`w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${form.monthHighlight ? "bg-green-600" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.monthHighlight ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-green-600" />
              Hónap ajánlata
            </p>
            <p className="text-xs text-muted-foreground">Kiemelt megjelenés a havi ajánló szekcióban</p>
          </div>
        </label>
      </div>
    </>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { token, login, logout } = useAdminToken();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [actionId, setActionId] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [creating, setCreating] = useState(false);

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

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []));
  }, [token]);

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
      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <CreateModal
            categories={categories}
            token={token!}
            onSaved={() => { setCreating(false); setTab("published"); fetchEvents("published"); }}
            onClose={() => setCreating(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editingEvent && (
          <EditModal
            ev={editingEvent}
            categories={categories}
            token={token!}
            onSaved={() => { setEditingEvent(null); fetchEvents(tab); }}
            onClose={() => setEditingEvent(null)}
          />
        )}
      </AnimatePresence>

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
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Új esemény
          </button>
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
            { icon: LayoutDashboard, label: "Hero-ban", value: events.filter(e=>e.featured && e.status==="published").length, color: "text-amber-600", bg: "bg-amber-50" },
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-0.5">
                          <LayoutDashboard className="w-2.5 h-2.5" /> Hero
                        </span>
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
                    <button onClick={() => setEditingEvent(ev)}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                      <Pencil className="w-3 h-3" /> Szerkeszt
                    </button>
                    <button onClick={() => patch(ev.id, { featured: !ev.featured })} disabled={actionId === ev.id}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${ev.featured ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      <LayoutDashboard className="w-3 h-3" /> {ev.featured ? "Hero ✓" : "Hero-ba"}
                    </button>
                    <button onClick={() => patch(ev.id, { monthHighlight: !ev.monthHighlight })} disabled={actionId === ev.id}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${ev.monthHighlight ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      <Crown className="w-3 h-3" /> Hó ajánlata
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
