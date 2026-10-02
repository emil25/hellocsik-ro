import { getVenueInfo } from "./venues";

type LocatedEvent = { location: string; locationAddress?: string | null };
type CsikArea = "city" | "surroundings";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const contains = (text: string, names: readonly string[]) => names.some(name => (` ${text} `).includes(` ${normalize(name)} `));
const CITY_NAMES = ["Csíkszereda", "Csíkszeredában", "Miercurea Ciuc", "Csíksomlyó", "Șumuleu Ciuc", "Csíkzsögöd", "Jigodin"];
const AREA_NAMES = [
  "Hargitafürdő", "Harghita Băi", "Csíkpálfalva", "Păuleni Ciuc", "Csíkdelne", "Delnița", "Csíkcsomortán", "Șoimeni",
  "Csíkszentmihály", "Mihăileni", "Csíkszépvíz", "Szépvíz", "Frumoasa", "Csíkszentmiklós", "Nicolești",
  "Csíkrákos", "Racu", "Csíkmadaras", "Mădăraș", "Csíkcsicsó", "Ciceu", "Csíkszentdomokos", "Sândominic",
  "Csíkszenttamás", "Tomești", "Csíkdánfalva", "Dănești", "Csíkkarcfalva", "Karcfalva", "Cârța", "Csíkjenőfalva", "Ineu",
  "Csíkszentkirály", "Sâncrăieni", "Csíkszentimre", "Sântimbru", "Csíkszentsimon", "Sânsimion", "Csíkcsatószeg", "Cetățuia",
  "Csíkszentmárton", "Sânmartin", "Csíkkozmás", "Cozmeni", "Csíkszentgyörgy", "Ciucsângeorgiu", "Csíkbánkfalva", "Bancu",
  "Csíkmindszent", "Misentea", "Csíkszentlélek", "Leliceni", "Tusnád", "Tușnad", "Újtusnád", "Tușnadu Nou", "Tusnádfürdő", "Băile Tușnad",
];
const OUTSIDE_NAMES = ["Székelyudvarhely", "Odorheiu Secuiesc", "Gyergyószentmiklós", "Gheorgheni", "Sepsiszentgyörgy", "Sfântu Gheorghe", "Kézdivásárhely", "Târgu Secuiesc", "Marosvásárhely", "Târgu Mureș", "Szováta", "Sovata", "Székelykeresztúr", "Cristuru Secuiesc", "Gyergyóremete", "Remetea", "Kolozsvár", "Cluj Napoca", "Homoródalmás", "Merești", "Nyújtód", "Lunga"];

function explicitArea(value: string): CsikArea | "outside" | null {
  const text = normalize(value);
  if (contains(text, OUTSIDE_NAMES)) return "outside";
  if (contains(text, CITY_NAMES)) return "city";
  if (contains(text, AREA_NAMES)) return "surroundings";
  return null;
}

export function getCsikArea(event: LocatedEvent): CsikArea | null {
  // The actual address takes precedence over an imported host or venue name.
  const addressArea = explicitArea(event.locationAddress ?? "");
  if (addressArea) return addressArea === "outside" ? null : addressArea;
  const locationArea = explicitArea(event.location);
  if (locationArea) return locationArea === "outside" ? null : locationArea;
  const knownVenueArea = explicitArea(getVenueInfo(event.location).address ?? "");
  return knownVenueArea === "city" || knownVenueArea === "surroundings" ? knownVenueArea : null;
}

export function isCsikEvent(event: LocatedEvent) {
  return getCsikArea(event) !== null;
}
