export type Organizer = {
  slug: string;
  name: string;
  city: string;
  description: string;
  website?: string;
  initials: string;
  accent: string;
  tags: string[];
  matches: string[];
};

/**
 * A small editorial directory for organisers. Events can later be connected to
 * real accounts through the same slug; for now the matcher keeps existing
 * imported programmes visible on organiser pages without changing old records.
 */
export const ORGANIZERS: Organizer[] = [
  {
    slug: "csiki-jatekszin",
    name: "Csíki Játékszín",
    city: "Csíkszereda",
    description: "A Csíki Játékszín előadásai, vendégjátékai és közönségtalálkozói egy helyen.",
    website: "https://csiki-jatekszin.ro",
    initials: "CJ",
    accent: "#d94f48",
    tags: ["színház", "előadás", "család"],
    matches: ["csíki játékszín", "csiki jatekszin"],
  },
  {
    slug: "figura-studio",
    name: "Figura Stúdió Színház",
    city: "Gyergyószentmiklós",
    description: "Kortárs színház, kísérletező előadások és találkozások Gyergyószentmiklóson.",
    website: "https://figura.ro",
    initials: "FS",
    accent: "#8c5be8",
    tags: ["színház", "kortárs", "kultúra"],
    matches: ["figura stúdió", "figura studio", "figura"],
  },
  {
    slug: "csiki-mozi",
    name: "Csíki Mozi",
    city: "Csíkszereda",
    description: "Premierek, különleges vetítések és filmes programok a csíkszeredai moziban.",
    website: "https://cinemacsikimozi.ro",
    initials: "CM",
    accent: "#1e7b72",
    tags: ["mozi", "film", "premier"],
    matches: ["csíki mozi", "csiki mozi", "cinema csíki", "cinemacsiki"],
  },
  {
    slug: "muveszetek-haza",
    name: "Művészetek Háza",
    city: "Csíkszereda",
    description: "Kiállítások, koncertek és közösségi események a város kulturális központjában.",
    website: "https://muveszetekhaza.ro",
    initials: "MH",
    accent: "#e88b34",
    tags: ["kiállítás", "zene", "közösség"],
    matches: ["művészetek háza", "muveszetek haza"],
  },
  {
    slug: "szakszervezetek-haza",
    name: "Szakszervezetek Művelődési Háza",
    city: "Csíkszereda",
    description: "Nagytermi előadások, koncertek és vendégprodukciók a város szívében.",
    initials: "SZ",
    accent: "#2c64c9",
    tags: ["előadás", "koncert", "rendezvény"],
    matches: ["szakszervezetek", "művelődési háza", "muvelodesi haza"],
  },
  {
    slug: "aktiv-szekelyfold",
    name: "Aktív Székelyföld",
    city: "Székelyföld",
    description: "Mozgás, közösség és aktív életmódhoz kapcsolódó események szervezője.",
    website: "https://aktivszekelyfold.ro",
    initials: "AS",
    accent: "#df5f82",
    tags: ["sport", "közösség", "konferencia"],
    matches: ["aktív székelyföld", "aktiv szekelyfold"],
  },
];

export function getOrganizer(slug: string | undefined) {
  return ORGANIZERS.find((organizer) => organizer.slug === slug);
}

export function organizerForEvent(event: { title?: string; location?: string }) {
  const haystack = `${event.title ?? ""} ${event.location ?? ""}`.toLocaleLowerCase("hu-HU");
  return ORGANIZERS.find((organizer) => organizer.matches.some((match) => haystack.includes(match))) ?? null;
}

