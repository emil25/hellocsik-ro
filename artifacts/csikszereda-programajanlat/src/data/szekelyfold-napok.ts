export const SZEKELYFOLD_DAYS = {
  title: "XVII. Székelyföld Napok",
  dates: "2026. október 9–18.",
  end: "2026-10-18T23:59:59+03:00",
  source: "https://www.szekelyfoldnapok.ro/?menu=1",
  checked: "2026. október 6.",
};

export const festivalAsset = (file: string) => `${import.meta.env.BASE_URL}events/${file}`;

export type FestivalProgram = {
  id: string;
  title: string;
  category: string;
  area: "Csíkszereda" | "Csíksomlyó" | "Csík környéke";
  location: string;
  dates: string;
  time: string;
  end: string;
  image: string;
  description: string;
  note?: string;
  sourceId: number;
  eventPath?: string;
};

// Editorial selection from the official 2026 programme, checked on October 6.
// Separate dates are deliberately kept explicit rather than shown as daily events.
export const FESTIVAL_PROGRAMS: FestivalProgram[] = [
  {
    id: "szakralis-seta", title: "Szakrális séta a Kis-Somlyón", category: "Séta",
    area: "Csíksomlyó", location: "Kis-Somlyó · Csíksomlyó", dates: "Október 9.", time: "14:00–16:00",
    end: "2026-10-09T16:00:00+03:00", image: "szfn-passio-seta-2026.jpg", sourceId: 6,
    description: "Gergely István (Tiszti) vezetésével a Jézus hágójától a Salvator-kápolnáig és a Hármashalom-oltárig. Az I. Kárpát-medencei Passiótalálkozó programja.",
  },
  {
    id: "passio30", title: "Passió30 – könyvbemutató", category: "Irodalom",
    area: "Csíksomlyó", location: "Fodor-ház udvara · Csíksomlyó", dates: "Október 10.", time: "13:00–14:00",
    end: "2026-10-10T14:00:00+03:00", image: "szfn-passio-konyv-2026.jpg", sourceId: 9, eventPath: "/esemeny/85",
    description: "Emlékek és állomások a Csíksomlyói Passió történetéből. A könyvbemutatón közreműködik a Subito Quartett. Eső esetén a rendezvénysátorban tartják.",
  },
  {
    id: "passiojatek", title: "Passiójáték", category: "Előadás",
    area: "Csíksomlyó", location: "Kegytemplom udvara · Csíksomlyó", dates: "Október 10.", time: "17:00–18:00",
    end: "2026-10-10T18:00:00+03:00", image: "szfn-passiojatek-2026.jpg", sourceId: 10,
    description: "Krisztus szenvedéstörténete hatvan szereplővel, zenével és tánccal a csíksomlyói kegytemplom udvarán. Az I. Kárpát-medencei Passiótalálkozó része.",
  },
  {
    id: "felhold", title: "A félhold árnyéka – tárlatvezetés", category: "Kiállítás",
    area: "Csíkszereda", location: "Csíki Székely Múzeum · Mikó-vár", dates: "Október 10., 11., 17., 18.", time: "15:00–16:00",
    end: "2026-10-18T16:00:00+03:00", image: "szfn-felhold-2026.jpg", sourceId: 13,
    description: "Vezetett látogatás az Erdély és az Oszmán Birodalom kapcsolatát bemutató kiállításon. Jelentkezés az adott hét csütörtökén délig: 0753 073 531 vagy info@csikimuzeum.ro.",
    note: "Múzeumi belépő szükséges. A tárlatvezetés díjtalan, előzetes bejelentkezéssel.",
  },
  {
    id: "szekely-himnusz", title: "A Székely himnusz története", category: "Kiállítás",
    area: "Csíkszereda", location: "Mikó-vár udvara · Csíkszereda", dates: "Október 10., 11., 13.", time: "09:00",
    end: "2026-10-13T23:59:59+03:00", image: "szekely-himnusz-tortenete-2026.jpg", sourceId: 17, eventPath: "/esemeny/79",
    description: "Tablókiállítás a dal keletkezéséről, alkotóiról és közösségi jelentőségéről. A felsorolt időpontok a fesztiválprogramban szereplő alkalmak; maga a kiállítás december 31-ig látogatható.",
  },
  {
    id: "tekergok", title: "Tekergők együttes – Égen-földön", category: "Gyerekprogram",
    area: "Csík környéke", location: "Művelődési Ház · Csíkmadaras", dates: "Október 15.", time: "11:00–12:00",
    end: "2026-10-15T12:00:00+03:00", image: "szfn-tekergok-2026.jpg", sourceId: 59,
    description: "Interaktív gyerekkoncert állatokról szóló dalokkal, közös énekléssel, tánccal és dobolással a csíkmadarasi Művelődési Házban.",
  },
  {
    id: "erdovidek", title: "Erdővidék nagyjai", category: "Kirándulás",
    area: "Csíkszereda", location: "Indulás Csíkszeredából · autóbuszos túra", dates: "Október 17.", time: "07:45–21:00",
    end: "2026-10-17T21:00:00+03:00", image: "szfn-erdovidek-2026.jpg", sourceId: 19,
    description: "A Csíkszéki EKE honismereti kirándulása többek között Kisbacon, Barót, Nagyajta, Apáca és Vargyas érintésével.",
    note: "A helyek beteltek, a szervező csak pótlistára fogad jelentkezést.",
  },
  {
    id: "kaposztavasar", title: "Szépvízi Káposztavágás- és Vásár", category: "Vásár",
    area: "Csík környéke", location: "Nád-dűlő · Szépvíz", dates: "Október 17.", time: "07:00–17:00",
    end: "2026-10-17T17:00:00+03:00", image: "szfn-kaposzta-2026.jpg", sourceId: 62, eventPath: "/esemeny/14",
    description: "Közös káposztaszüret, helyi termelők vására, főzőcsapatok és szekeres felvonulás. A napot közös körtánc zárja a Nád-dűlőben.",
  },
  {
    id: "borospatak", title: "Táncház Borospatakon", category: "Táncház",
    area: "Csík környéke", location: "Skanzen · Borospatak, Gyimesközéplok", dates: "Október 17.", time: "20:00–23:00",
    end: "2026-10-17T23:00:00+03:00", image: "szfn-tanchaz-2026.jpg", sourceId: 60,
    description: "Csángó táncház a borospataki skanzenben, kosteleki gyerekekkel és fiatalokkal, valamint a gyimesbükki Csalóka tánccsoporttal.",
  },
];
