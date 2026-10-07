import { Link } from "wouter";
import helloCsikLogo from "@/assets/hellocsik-logo-header.png";

const footerLinks = [
  { href: "/#kozelgo", label: "Programok" },
  { href: "/naptar", label: "Naptár" },
  { href: "/helyszinek", label: "Helyszínek" },
  { href: "/szervezok", label: "Szervezők" },
  { href: "/arak", label: "Árak" },
  { href: "/erdekel", label: "Érdekel" },
  { href: "/bekuldese", label: "Program beküldése" },
  { href: "/szekelyfold", label: "Székelyföldi programok" },
  { href: "/admin", label: "Szerkesztőség" },
];

export function Footer() {
  return (
    <footer id="lablec" className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="border-t border-border pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <Link href="/" className="self-start shrink-0" aria-label="HelloCsík főoldal">
            <img src={helloCsikLogo} alt="HelloCsík" className="h-8 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity" loading="lazy" />
          </Link>
          <div className="min-w-0 md:max-w-3xl md:text-right">
            <nav aria-label="Lábléc" className="grid grid-cols-3 gap-x-4 gap-y-1 md:flex md:flex-wrap md:justify-end md:gap-x-4 text-xs text-muted-foreground">
              {footerLinks.map(link => (
                <a key={link.href} href={link.href} className="py-2 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">{link.label}</a>
              ))}
            </nav>
            <p className="mt-3 md:mt-2 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} HelloCsík · Programok · Helyek · Élmények · Csíkszereda
            </p>
          </div>
        </div>
        <p className="mt-5 text-[10px] leading-relaxed text-muted-foreground md:text-right">
          <a className="underline underline-offset-2" href="https://commons.wikimedia.org/wiki/File:RO_HR_Miercurea_Ciuc_center_1.jpg" target="_blank" rel="noreferrer">Fotó: Andrei Stroe / Wikimedia Commons</a>
          {" · "}<a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>{" · Vágott kép"}
        </p>
      </div>
    </footer>
  );
}
