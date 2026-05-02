import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/#hetvege", label: "Hétvége" },
  { href: "/#naptar", label: "Naptár" },
  { href: "/#kozelgo", label: "Programok" },
  { href: "/#helyszinek", label: "Helyszínek" },
  { href: "/#hozzaadas", label: "Hozzáadás" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-lg border-b border-gray-100/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3.5" fill="white" fillOpacity="0.95"/>
                <path d="M9 1.5C9 1.5 14.5 7.2 14.5 10.5C14.5 13.5 12 16 9 16C6 16 3.5 13.5 3.5 10.5C3.5 7.2 9 1.5 9 1.5Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <div className="flex items-baseline gap-0">
                <span className="font-extrabold text-[15px] tracking-tight" style={{ color: "hsl(148 45% 22%)" }}>csík</span>
                <span className="font-bold text-[15px] text-foreground tracking-tight">.online</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide">a város élete</span>
            </div>
          </Link>

          {/* Nav pills */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Search className="w-3.5 h-3.5" />
              <span>Keresés...</span>
            </button>
            <button className="ml-1 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
              Csatlakozz
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-md text-muted-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
