import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, Search, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchModal } from "@/components/SearchModal";
import { useFavorites } from "@/hooks/use-favorites";
import headerLogo from "@/assets/hellocsik-logo-header.png";

const navLinks = [
  { href: "/#hetvege", label: "Hétvége" },
  { href: "/naptar", label: "Naptár" },
  { href: "/#kozelgo", label: "Programok" },
  { href: "/#helyszinek", label: "Helyszínek" },
  { href: "/erdekel", label: "Érdekel" },
  { href: "/#hozzaadas", label: "Hozzáadás" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { favoriteIds } = useFavorites();

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-lg border-b border-gray-100/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0" aria-label="HelloCsík főoldal">
              <img
                src={headerLogo}
                alt="HelloCsík"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>

            {/* Nav pills */}
            <nav className="hidden lg:flex items-center gap-1">
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
                  {link.href === "/erdekel" && <Heart className="inline-block w-3.5 h-3.5 mr-1" fill={favoriteIds.length ? "currentColor" : "none"} />}
                  {link.label}{link.href === "/erdekel" && favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Keresés...</span>
              </button>
              <a href="/#hozzaadas" className="ml-1 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                Csatlakozz
              </a>
            </div>

            {/* Mobile: search + burger */}
            <div className="lg:hidden flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Programok keresése"
                className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
                aria-expanded={open}
                className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b border-gray-50 last:border-0"
                    onClick={() => setOpen(false)}
                  >
                    {link.href === "/erdekel" && <Heart className="inline-block w-4 h-4 mr-2" fill={favoriteIds.length ? "currentColor" : "none"} />}
                    {link.label}{link.href === "/erdekel" && favoriteIds.length > 0 ? ` (${favoriteIds.length})` : ""}
                  </a>
                ))}
                <div className="pt-2">
                  <a href="/#hozzaadas" onClick={() => setOpen(false)}
                    className="block w-full text-center py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors">
                    Csatlakozz
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
