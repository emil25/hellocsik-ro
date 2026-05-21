import { useState } from "react";

const DAYS = [
  {
    id: "pentek", label: "Péntek", date: "máj. 29.", badge: "Nyitónap",
    lead: "Megnyitjuk a kapukat! Jó hangulat, zene és közösségi élmények a parkban.",
    schedule: [
      { time: "15:00", label: "Kapunyitás" },
      { time: "15:00–19:00", label: "Helyi és kézműves termékek vására" },
      { time: "17:00", label: "Oláh Ferenc és zenekara · Biró Éva és Szilágyi Sándor nótaénekesek" },
      { time: "19:00", label: "Kedves zenekar koncert" },
    ],
  },
  {
    id: "szombat", label: "Szombat", date: "máj. 30.", badge: "Családi nap",
    lead: "Egész napos program a parkban gyerekeknek és felnőtteknek egyaránt.",
    schedule: [
      { time: "10:00–19:00", label: "Helyi és kézműves termékek vására" },
      { time: "10:00–18:00", label: "Gyermekfoglalkozások" },
      { time: "🎵", label: "Zenei program – hamarosan" },
    ],
  },
  {
    id: "vasarnap", label: "Vasárnap", date: "máj. 31.", badge: "Hétvége",
    lead: "Utolsó teljes nap a kézművesekkel, gyerekprogramokkal és zenével.",
    schedule: [
      { time: "10:00–19:00", label: "Helyi és kézműves termékek vására" },
      { time: "10:00–18:00", label: "Gyermekfoglalkozások" },
      { time: "🎵", label: "Zenei program – hamarosan" },
    ],
  },
  {
    id: "hetfo", label: "Hétfő", date: "jún. 1.", badge: "Zárósnap",
    lead: "A hétvége utolsó napján is várjuk a gyerekeket alkotni és játszani!",
    schedule: [
      { time: "10:00–18:00", label: "Gyermekfoglalkozások" },
      { time: "🎵", label: "Zenei program – hamarosan" },
    ],
  },
];

export function SotetSmaragd() {
  const [activeDay, setActiveDay] = useState("pentek");
  const day = DAYS.find(d => d.id === activeDay)!;

  return (
    <div style={{ background: "#064e3b", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 48px" }}>

        {/* Badge */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ background: "linear-gradient(135deg,#065f46,#047857)", color: "#d1fae5", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 99 }}>
            ✦ Csíkszereda legnagyobb tavaszi ünnepe
          </span>
        </div>

        {/* Main card */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", marginBottom: 32 }}>
          {/* Left */}
          <div style={{ background: "linear-gradient(145deg,#065f46,#064e3b)", padding: "36px 32px", display: "flex", flexDirection: "column", gap: 20, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p style={{ color: "#6ee7b7", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Csíki</p>
              <h2 style={{ color: "white", fontSize: 44, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>Majális</h2>
              <p style={{ color: "#a7f3d0", fontSize: 15, fontWeight: 600 }}>A családok hétvégéje</p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.62)", fontSize: 13, lineHeight: 1.6 }}>
              Négy napos tavaszi ünnep a Központi Parkban — zene, kézművesek, gyerekprogramok és jó hangulat május 29-től június 1-ig.
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              <span>📅 máj. 29. – jún. 1.</span>
              <span>📍 Központi Park</span>
              <span>🎟️ Ingyenes</span>
            </div>
            {/* Countdown */}
            <div>
              <p style={{ color: "#6ee7b7", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Visszaszámláló</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[["08","NAP"],["14","ÓRA"],["32","PERC"],["07","MP"]].map(([v,l]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 0", textAlign: "center" }}>
                    <div style={{ color: "white", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{v}</div>
                    <div style={{ color: "#6ee7b7", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <button style={{ background: "linear-gradient(135deg,#059669,#047857)", color: "white", fontWeight: 700, fontSize: 13, padding: "11px 22px", borderRadius: 12, border: "none", cursor: "pointer", alignSelf: "flex-start" }}>
              Teljes program →
            </button>
          </div>
          {/* Right: poster */}
          <div style={{ background: "#0d9488", position: "relative", minHeight: 320, overflow: "hidden" }}>
            <img src="/majalis-plakat.jpg" alt="Csíki Majális plakát" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(6,78,59,0.5) 0%,transparent 60%)" }} />
            <div style={{ position: "absolute", bottom: 16, left: 20 }}>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600 }}>📅 máj. 29. – jún. 1. &nbsp;·&nbsp; 📍 Központi Park</p>
            </div>
          </div>
        </div>

        {/* Day tabs */}
        <p style={{ color: "#6ee7b7", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>✦ Program napok szerint</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {DAYS.map(d => (
            <button key={d.id} onClick={() => setActiveDay(d.id)}
              style={{ padding: "6px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none",
                background: d.id === activeDay ? "linear-gradient(135deg,#059669,#047857)" : "rgba(255,255,255,0.18)",
                color: "white",
                boxShadow: d.id === activeDay ? "0 4px 14px rgba(5,150,105,0.4)" : "none"
              }}>
              <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: d.id === activeDay ? "#a7f3d0" : "#86efac", letterSpacing: "0.1em" }}>{d.date}</span>
              {d.label}
            </button>
          ))}
        </div>

        {/* Day content */}
        <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, overflow: "hidden", marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ background: "#065f46", minHeight: 180, position: "relative", display: "flex", alignItems: "flex-end" }}>
            <img src="/majalis-pentek.jpg" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(4,47,46,0.75) 0%,transparent 60%)" }} />
            <div style={{ position: "relative", padding: 20 }}>
              <span style={{ background: "rgba(5,150,105,0.85)", color: "white", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.1em" }}>{day.badge}</span>
              <p style={{ color: "white", fontWeight: 900, fontSize: 17, marginTop: 6 }}>{day.label}</p>
              <p style={{ color: "#6ee7b7", fontSize: 12 }}>{day.date}</p>
            </div>
          </div>
          <div style={{ padding: 22 }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{day.lead}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {day.schedule.map(s => (
                <div key={s.time+s.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "7px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: s.time.startsWith("🎵") ? "rgba(255,255,255,0.3)" : "#6ee7b7", fontSize: 11, fontWeight: 800, minWidth: 64, flexShrink: 0 }}>{s.time}</span>
                  <span style={{ color: s.time.startsWith("🎵") ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.82)", fontSize: 12 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special programs */}
        <p style={{ color: "#6ee7b7", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>✦ Különleges programok</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { img: "/majalis-gyerek.jpg", icon: "🛍️", title: "Kézműves vásár", desc: "Helyi mesteremberek portékái — minden nap a Parkban.", days: [["Péntek","15:00–19:00"],["Szombat","10:00–19:00"],["Vasárnap","10:00–19:00"]] },
            { img: "/majalis-gyerek-foglalkozas.jpg", icon: "🎨", title: "Gyermekfoglalkozások", desc: "Bútorfestés, rongybaba, Székely Gőzös, barkácsolás.", days: [["Szombat","10:00–18:00"],["Vasárnap","10:00–18:00"],["Hétfő","10:00–18:00"]] },
          ].map(c => (
            <div key={c.title} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ position: "relative", height: 130 }}>
                <img src={c.img} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(4,47,46,0.85) 0%,transparent 55%)" }} />
                <span style={{ position: "absolute", bottom: 12, left: 16, color: "white", fontWeight: 900, fontSize: 15 }}>{c.icon} {c.title}</span>
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginBottom: 10 }}>{c.desc}</p>
                {c.days.map(([day, time]) => (
                  <div key={day} style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,0.07)", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.75)" }}>{day}</span>
                    <span style={{ color: "#6ee7b7", fontWeight: 800 }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
