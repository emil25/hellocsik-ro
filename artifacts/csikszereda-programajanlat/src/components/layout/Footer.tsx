import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-background">
      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl overflow-hidden" style={{background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a1a 40%, #1a1a2e 100%)"}}>
          <div className="px-8 py-10 md:flex md:items-center md:justify-between gap-10">
            <div className="mb-6 md:mb-0">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-4 h-4 text-secondary">✦</span>
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Heti összefoglaló</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Csík a postaládádban,<br />
                <span className="text-secondary">minden péntek reggel.</span>
              </h3>
            </div>
            <div className="w-full md:max-w-sm space-y-3">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3">
                <span className="text-muted-foreground text-sm">✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="te@email.com"
                  className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <button className="w-full px-5 py-3 rounded-xl bg-secondary text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors">
                Iratkozz fel ingyen
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10L3 13L4.5 8.5L1 5.5H5.5L7 1Z" fill="white"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm">csík.online</span>
              <span className="text-xs text-muted-foreground ml-1">· a város élete</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Csíkszereda Programajánló · Miercurea Ciuc
          </p>
        </div>
      </div>
    </footer>
  );
}
