import { Calendar, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Csíkszereda</div>
                <div className="text-xs text-primary font-medium">Programajánló</div>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed">
              Csíkszereda kulturális és szórakoztató eseményeinek legteljesebb gyűjteménye. Találd meg a következő programodat!
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">Gyors linkek</h3>
            <ul className="space-y-2">
              {["Főoldal", "Közelgő programok", "Heti naptár", "Kategóriák"].map((item) => (
                <li key={item}>
                  <a href="/" className="text-sm text-background/70 hover:text-background transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-background/50">Kapcsolat</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>Csíkszereda, Románia</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>info@csikszereda-programajanlat.ro</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            &copy; {new Date().getFullYear()} Csíkszereda Programajánló. Minden jog fenntartva.
          </p>
          <p className="text-xs text-background/40">
            Csíkszereda &bull; Miercurea Ciuc &bull; Székelyföld
          </p>
        </div>
      </div>
    </footer>
  );
}
