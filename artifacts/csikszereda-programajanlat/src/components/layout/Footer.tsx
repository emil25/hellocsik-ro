import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return <footer className="bg-background border-t border-border">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-wrap items-center justify-between gap-6">
      <div><Link href="/" className="text-2xl font-extrabold tracking-tight">hellocsík<span className="text-primary">.ro</span></Link><p className="text-sm text-muted-foreground mt-2">Csíkszereda és Csík környékének programjai.</p></div>
      <nav aria-label="Lábléc" className="flex flex-wrap gap-5 text-sm font-semibold"><a href="/#kozelgo">Programok</a><Link href="/naptar">Naptár</Link><Link href="/helyszinek">Helyszínek</Link><Link href="/szervezok">Szervezők</Link><Link href="/arak">Árak</Link><Link href="/erdekel">Érdekel</Link><Link href="/bekuldese" className="flex items-center gap-2 text-primary">Program beküldése <ArrowRight size={16} /></Link><Link href="/szekelyfold">Székelyföldi programok</Link><Link href="/admin">Szerkesztőség</Link></nav>
    </div>
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 border-t border-border text-sm text-muted-foreground">© {new Date().getFullYear()} HelloCsík · Csíkszereda és környéke <p className="mt-2 text-xs"><a className="underline" href="https://commons.wikimedia.org/wiki/File:RO_HR_Miercurea_Ciuc_center_1.jpg" target="_blank" rel="noreferrer">Fotó: Andrei Stroe / Wikimedia Commons</a> · <a className="underline" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a> · Vágott kép</p></div>
  </footer>;
}