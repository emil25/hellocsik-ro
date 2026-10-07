import { Link } from "wouter";
import { ArrowRight, CalendarDays, Heart, MapPin } from "lucide-react";
import helloCsikLogo from "@/assets/hellocsik-logo-header.png";
import "./footer.css";

const exploreLinks = [
  { href: "/#kozelgo", label: "Programok" },
  { href: "/naptar", label: "Naptár" },
  { href: "/helyszinek", label: "Helyszínek" },
  { href: "/erdekel", label: "Érdekel" },
  { href: "/szekelyfold", label: "Székelyföldi programok" },
];

const organizerLinks = [
  { href: "/szervezok", label: "Szervezők" },
  { href: "/szervezoi-felulet", label: "Szervezői felület" },
  { href: "/arak", label: "Kiemelés és árak" },
];

export function Footer() {
  return (
    <footer id="lablec" className="hc-footer">
      <div className="hc-footer-wrap">
        <div className="hc-footer-panel">
          <div className="hc-footer-art" aria-hidden="true"><span /><span /><span /></div>
          <div className="hc-footer-content">
            <div className="hc-footer-brand">
              <Link href="/" className="hc-footer-logo" aria-label="HelloCsík főoldal">
                <img src={helloCsikLogo} alt="HelloCsík" loading="lazy" />
              </Link>
              <p>Csíkszereda és Csík környékének<br />programjai.</p>
              <div className="hc-footer-shortcuts" aria-label="Gyors elérés">
                <a href="/#heti-naptar"><CalendarDays size={16} /> Ezen a héten</a>
                <Link href="/erdekel"><Heart size={16} /> Érdekel</Link>
              </div>
              <span className="hc-footer-place"><MapPin size={13} /> Csíkszereda · Csík környéke</span>
            </div>
            <nav className="hc-footer-nav" aria-label="Programok és helyszínek">
              <h2>Felfedezés</h2>
              {exploreLinks.map(link => <a key={link.href} href={link.href}>{link.label}<ArrowRight size={13} /></a>)}
            </nav>
            <nav className="hc-footer-nav hc-footer-organizers" aria-label="Szervezőknek">
              <h2>Szervezőknek</h2>
              {organizerLinks.map(link => <Link key={link.href} href={link.href}>{link.label}<ArrowRight size={13} /></Link>)}
              <Link href="/bekuldese" className="hc-footer-submit">Program beküldése <ArrowRight size={17} /></Link>
            </nav>
          </div>
          <div className="hc-footer-bottom">
            <p>&copy; {new Date().getFullYear()} HelloCsík <span>· Programok · Helyek · Élmények</span></p>
            <Link href="/admin">Szerkesztőség <ArrowRight size={12} /></Link>
          </div>
        </div>
        <p className="hc-footer-credit">
          <a className="underline underline-offset-2" href="https://commons.wikimedia.org/wiki/File:RO_HR_Miercurea_Ciuc_center_1.jpg" target="_blank" rel="noreferrer">Fotó: Andrei Stroe / Wikimedia Commons</a>
          {" · "}<a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>{" · Vágott kép"}
        </p>
      </div>
    </footer>
  );
}
