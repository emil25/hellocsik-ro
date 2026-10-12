import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, ExternalLink, Flag, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { Link } from "wouter";

type ReportStatus = "open" | "resolved";
type EventReport = {
  id: number;
  eventId: number | null;
  eventTitle: string;
  reason: string;
  message: string | null;
  status: ReportStatus;
  createdAt: string;
};

const REASONS: Record<string, string> = {
  wrong_time: "Hibás időpont",
  wrong_place: "Hibás helyszín",
  cancelled: "Elmarad vagy megváltozott",
  ticket_link: "Hibás jegy- vagy információs link",
  other: "Egyéb hiba",
};

export function EventReportsManager({ token }: { token: string }) {
  const [status, setStatus] = useState<ReportStatus>("open");
  const [reports, setReports] = useState<EventReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/event-reports?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "A jelzések nem tölthetők be.");
      setReports(data.reports ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "A jelzések nem tölthetők be.");
    } finally {
      setLoading(false);
    }
  }, [status, token]);

  useEffect(() => { void fetchReports(); }, [fetchReports]);

  async function updateReport(report: EventReport) {
    const nextStatus = report.status === "open" ? "resolved" : "open";
    setBusyId(report.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/event-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "A jelzés állapotát nem sikerült menteni.");
      await fetchReports();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "A jelzés állapotát nem sikerült menteni.");
    } finally {
      setBusyId(null);
    }
  }

  return <section aria-labelledby="event-reports-heading">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 id="event-reports-heading" className="text-lg font-bold text-foreground">Látogatói jelzések</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hibás időpontok, helyszínek, jegylinkek és elmaradt programok.</p>
      </div>
      <button type="button" onClick={() => void fetchReports()} disabled={loading} aria-label="Jelzések frissítése" className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>

    <div className="mb-5 flex w-fit gap-1 rounded-xl bg-muted p-1">
      {(["open", "resolved"] as const).map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${status === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
        {value === "open" ? "Új jelzések" : "Lezárt"}
      </button>)}
    </div>

    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {loading ? <div className="py-12 text-center text-sm text-muted-foreground">Jelzések betöltése…</div>
      : reports.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
        {status === "open" ? <Flag className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" /> : <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />}
        <p className="font-semibold text-foreground">{status === "open" ? "Nincs új jelzés" : "Még nincs lezárt jelzés"}</p>
        <p className="mt-1 text-sm text-muted-foreground">Az eseményoldalról érkező visszajelzések itt jelennek meg.</p>
      </div> : <div className="space-y-3">
        {reports.map((report) => <article key={report.id} className="rounded-2xl border border-card-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "open" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{REASONS[report.reason] ?? "Egyéb hiba"}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3 w-3" />{new Intl.DateTimeFormat("hu-HU", { timeZone: "Europe/Bucharest", dateStyle: "medium", timeStyle: "short" }).format(new Date(report.createdAt))}</span>
              </div>
              <h3 className="break-words font-semibold text-foreground">{report.eventTitle}</h3>
              {report.message && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{report.message}</p>}
              {report.eventId && <Link href={`/esemeny/${report.eventId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Esemény megnyitása <ExternalLink className="h-3 w-3" /></Link>}
            </div>
            <button type="button" onClick={() => void updateReport(report)} disabled={busyId === report.id} className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${status === "open" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-border bg-muted text-foreground hover:bg-muted/70"}`}>
              {busyId === report.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === "open" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {status === "open" ? "Lezárás" : "Újranyitás"}
            </button>
          </div>
        </article>)}
      </div>}
  </section>;
}
