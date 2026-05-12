export function Hirlevel() {
  const events = [
    {
      id: 1,
      category: "Tánc",
      categoryColor: "#c2410c",
      date: "máj. 21. · szerda",
      location: "Csíkszereda, Főtér",
      title: "38. Csürdöngölő – a néptánc ünnepe",
      description: "Erdély legnagyobb néptáncfesztiválja három napon át tölti meg zenével és tánccal a várost.",
      price: "Ingyenes",
      featured: true,
      image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&q=80",
    },
    {
      id: 2,
      category: "Fesztivál",
      categoryColor: "#15803d",
      date: "máj. 29. – jún. 1.",
      location: "Csíki Sör Kertje",
      title: "Csíki Majális – A családok hétvégéje",
      description: "Négy napos szabadtéri fesztivál zenével, kézműves standokkal és gyerekprogramokkal.",
      price: "500 RON",
      featured: false,
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
    },
    {
      id: 3,
      category: "Zene",
      categoryColor: "#7c3aed",
      date: "jún. 7. · szombat",
      location: "Cinema Csíki Mozi",
      title: "TEDxCsíkszereda – Echoes of the Future",
      description: "Inspiráló előadók, merész ötletek és a jövő hangjai egy estén át.",
      price: "180 RON",
      featured: false,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-start justify-center py-10 px-4">
      <div
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", maxWidth: 620, width: "100%" }}
        className="bg-white rounded-2xl overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1a3a2a 0%, #0f2318 100%)" }} className="px-8 pt-10 pb-8">
          <div className="flex items-center gap-2 mb-6">
            <div
              style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <span style={{ color: "white", fontWeight: 900, fontSize: 16 }}>h</span>
            </div>
            <span style={{ color: "white", fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
              hello<span style={{ color: "#f59e0b" }}>csík</span>
            </span>
          </div>
          <div style={{ color: "#a3c4a8", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            🗓 Heti programajánló · 2026. május 12–18.
          </div>
          <h1 style={{ color: "white", fontSize: 28, fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
            Mi vár rád ezen a héten<br />
            <span style={{ color: "#f59e0b" }}>Csíkszeredában?</span>
          </h1>
          <p style={{ color: "#a3c4a8", fontSize: 14, marginTop: 12, marginBottom: 0, lineHeight: 1.6 }}>
            19 program · 6 kihagyhatatlan esemény · minden korosztálynak
          </p>
        </div>

        {/* Featured event */}
        <div style={{ background: "#fffbeb", borderBottom: "2px solid #fde68a" }} className="px-8 py-6">
          <div style={{ color: "#92400e", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            ⭐ Kihagyhatatlan ezen a héten
          </div>
          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
            <img
              src={events[0].image}
              alt={events[0].title}
              style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <span style={{ background: events[0].categoryColor, color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
              {events[0].category}
            </span>
            <span style={{ background: "#f59e0b", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
              Ingyenes
            </span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a3a2a", margin: "0 0 6px 0", lineHeight: 1.2 }}>
            {events[0].title}
          </h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
            📅 {events[0].date} &nbsp;·&nbsp; 📍 {events[0].location}
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 14px 0" }}>
            {events[0].description}
          </p>
          <a
            href="#"
            style={{ display: "inline-block", background: "linear-gradient(135deg, #c2410c, #dc2626)", color: "white", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}
          >
            Részletek →
          </a>
        </div>

        {/* More events */}
        <div className="px-8 py-6">
          <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Közelgő programok
          </div>
          {events.slice(1).map((ev, i) => (
            <div
              key={ev.id}
              style={{ display: "flex", gap: 14, paddingBottom: 16, marginBottom: 16, borderBottom: i < events.length - 2 ? "1px solid #f3f4f6" : "none" }}
            >
              <img
                src={ev.image}
                alt={ev.title}
                style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
                  <span style={{ background: ev.categoryColor, color: "white", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20 }}>
                    {ev.category}
                  </span>
                  {ev.price !== "Ingyenes" && (
                    <span style={{ background: "#f3f4f6", color: "#374151", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20 }}>
                      {ev.price}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: 3 }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  {ev.date} · {ev.location}
                </div>
              </div>
            </div>
          ))}

          <a
            href="#"
            style={{ display: "block", textAlign: "center", background: "#1a3a2a", color: "white", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", marginTop: 4 }}
          >
            Összes program megtekintése →
          </a>
        </div>

        {/* Stats bar */}
        <div style={{ background: "#f9fafb", borderTop: "1px solid #f3f4f6" }} className="px-8 py-5">
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            {[["19", "program"], ["6", "kihagyhatatlan"], ["3", "helyszín"]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#c2410c" }}>{num}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: "#1a3a2a" }} className="px-8 py-6 text-center">
          <div style={{ color: "#a3c4a8", fontSize: 12, marginBottom: 12 }}>
            Leiratkozás · Beállítások módosítása
          </div>
          <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.6 }}>
            hellocsík.ro · Csíkszereda kulturális programajánlója<br />
            © 2026 hellocsík. Minden jog fenntartva.
          </div>
        </div>
      </div>
    </div>
  );
}
