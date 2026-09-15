import { Link } from "wouter";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function subscribe(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error("A feliratkozás nem sikerült. Próbáld újra!");
      setMessage("Köszönjük! Feliratkozásodat rögzítettük az induló hírlevélre."); setEmail("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kapcsolódási hiba."); }
    finally { setBusy(false); }
  }
  return <footer className="bg-background">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8"><div className="rounded-2xl p-7 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-7 bg-gradient-to-r from-[#1a321c] via-[#293f16] to-[#1c2730] text-white">
      <div><p className="text-sm font-bold tracking-wider text-white/60 mb-3">✦ HETI ÖSSZEFOGLALÓ · HAMAROSAN</p><h2 className="text-2xl md:text-3xl font-extrabold">Csík a postaládádban,<br /><span className="text-amber-400">a hét legjobb programjai.</span></h2></div>
      <form onSubmit={subscribe} className="w-full md:max-w-sm space-y-3"><label className="sr-only" htmlFor="newsletter-email">E-mail-címed</label><input id="newsletter-email" type="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="te@email.com" className="w-full rounded-xl bg-white text-foreground px-4 py-3 text-base" /><button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-[#172619] disabled:opacity-60">{busy ? "Feliratkozás…" : "Iratkozz fel ingyen"} <ArrowRight size={16} /></button><p className="text-sm text-white/80" role="status">{message || "A hírlevél indulásához gyűjtjük a feliratkozásokat."}</p></form>
    </div></div>
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-wrap items-center justify-between gap-6">
      <div><Link href="/" className="text-2xl font-extrabold tracking-tight">hellocsík<span className="text-primary">.ro</span></Link><p className="text-sm text-muted-foreground mt-2">Helyi programok. Közös élmények.</p></div>
      <nav aria-label="Lábléc" className="flex flex-wrap gap-6 text-sm font-semibold"><a href="/#kozelgo">Programok</a><Link href="/naptar">Naptár</Link><Link href="/erdekel">Érdekel</Link><Link href="/bekuldese" className="flex items-center gap-2 text-primary">Program beküldése <ArrowRight size={16} /></Link><Link href="/admin">Szerkesztőség</Link></nav>
    </div>
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 border-t border-border text-sm text-muted-foreground">© {new Date().getFullYear()} HelloCsík · Csíkszereda és a Csíki-medence <p className="mt-2 text-xs"><a className="underline" href="https://commons.wikimedia.org/wiki/File:RO_HR_Miercurea_Ciuc_center_1.jpg" target="_blank" rel="noreferrer">Belvárosi fotó: Andrei Stroe / Wikimedia Commons</a> · <a className="underline" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a> · Vágott kép</p></div>
  </footer>;
}
