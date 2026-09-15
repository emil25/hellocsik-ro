export type VenueInfo = {
  slug: string;
  name: string;
  aliases: string[];
  address?: string;
  latitude?: number;
  longitude?: number;
};

const clean = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

export const VENUE_DIRECTORY: VenueInfo[] = [
  {
    slug: "muveszetek-haza",
    name: "Művészetek Háza",
    aliases: ["Művészetek Háza", "Művészetek Háza Csíkszereda"],
    address: "Temesvári sugárút 4., Csíkszereda",
    latitude: 46.3582,
    longitude: 25.8032,
  },
  {
    slug: "csiki-mozi",
    name: "Csíki Mozi",
    aliases: ["Csíki Mozi", "Cinema Csíki Mozi", "Cinema Csiki Mozi"],
    address: "Temesvári sugárút 4., Csíkszereda",
    latitude: 46.358,
    longitude: 25.805,
  },
  {
    slug: "szakszervezetek-muvelodesi-haza",
    name: "Szakszervezetek Művelődési Háza",
    aliases: [
      "Szakszervezetek Művelődési Háza",
      "Szakszervezetek Mūvelõdèsi Hàza",
      "Szakszervezetek Háza",
    ],
    address: "Szabadság tér 16., Csíkszereda",
    latitude: 46.361417,
    longitude: 25.803561,
  },
  {
    slug: "csiki-szekely-muzeum",
    name: "Csíki Székely Múzeum",
    aliases: ["Csíki Székely Múzeum", "Mikó-vár", "Mikó vár"],
    address: "Vár tér 2., Csíkszereda",
    latitude: 46.355825,
    longitude: 25.802086,
  },
  {
    slug: "hargita-megye-tanacsa",
    name: "Hargita Megye Tanácsa",
    aliases: ["Hargita Megye Tanácsa", "Megyeháza"],
    address: "Szabadság tér 5., Csíkszereda",
    latitude: 46.36123,
    longitude: 25.801176,
  },
  {
    slug: "zengo-ter",
    name: "Zengő Tér",
    aliases: ["Zengő Tér", "Zengő tér"],
    address: "Petőfi Sándor utca 35., Csíkszereda",
    latitude: 46.3537,
    longitude: 25.8016,
  },
  {
    slug: "csiksomlyo-kegytemplom",
    name: "Csíksomlyói Kegytemplom",
    aliases: ["Csíksomlyó, a Kegytemplom előtti tér", "Csíksomlyói Kegytemplom", "Csíksomlyó"],
    address: "Csíksomlyó, Csíkszereda",
    latitude: 46.3794,
    longitude: 25.8257,
  },
];

export function slugifyVenue(value: string) {
  return clean(value).replace(/\s+/g, "-") || "helyszin";
}

export function getVenueInfo(location: string): VenueInfo {
  const normalized = clean(location);
  const known = VENUE_DIRECTORY.find((venue) =>
    venue.aliases.some((alias) => {
      const normalizedAlias = clean(alias);
      return normalized === normalizedAlias || normalized.includes(normalizedAlias);
    }),
  );

  if (known) return known;

  const name = location.split("–")[0].trim() || location.trim();
  return { slug: slugifyVenue(name), name, aliases: [name] };
}

export function eventMatchesVenue(location: string, slug: string) {
  return getVenueInfo(location).slug === slug;
}

export function venueMapPosition(venue: VenueInfo) {
  if (venue.latitude === undefined || venue.longitude === undefined) return null;
  const left = ((venue.longitude - 25.78) / (25.83 - 25.78)) * 100;
  const top = ((46.39 - venue.latitude) / (46.39 - 46.35)) * 100;
  return {
    left: `${Math.max(4, Math.min(96, left))}%`,
    top: `${Math.max(8, Math.min(92, top))}%`,
  };
}
