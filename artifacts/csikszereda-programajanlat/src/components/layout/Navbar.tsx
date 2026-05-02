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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10L3 13L4.5 8.5L1 5.5H5.5L7 1Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm text-foreground tracking-tight">csík.online</span>
              <span className="text-[10px] text-muted-foreground font-medium">a város élete</span>
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
          <div className="hidden md:flex items-center gap-2">
            <button className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Keresés...</span>
            <button className="ml-2 px-4 py-1.5 rounded-full bg-foreground text-white text-sm font-semibold hover:bg-foreground/90 transition-colors">
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
