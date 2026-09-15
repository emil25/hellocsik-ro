export const REGION_NAME = "Székelyföld";
export const REGION_COUNTIES = ["Hargita", "Kovászna", "Maros"] as const;

export type RegionCounty = (typeof REGION_COUNTIES)[number];

export const REGION_DESCRIPTION = "Székelyföld városainak programjai egy helyen.";

const COUNTY_KEYWORDS: Record<RegionCounty, string[]> = {
  Hargita: [
    "hargita", "harghita", "csíkszereda", "miercurea ciuc", "csíksomlyó", "sumuleu", "șumuleu",
    "székelyudvarhely", "odorheiu secuiesc", "gyergyószentmiklós", "gheorgheni", "toplița", "toplita",
    "székelykeresztúr", "cristuru secuiesc", "balánbánya", "bălan", "szováta", "sovata",
  ],
  Kovászna: [
    "kovászna", "covasna", "sepsiszentgyörgy", "sfântu gheorghe", "sfantu gheorghe", "kézdivásárhely",
    "târgu secuiesc", "targu secuiesc", "barót", "baraolt", "bodzaforduló", "întorsura buzăului",
  ],
  Maros: [
    "maros", "mureș", "mures", "marosvásárhely", "târgu mureș", "targu mures", "szászrégen", "reghin",
    "erdőszentgyörgy", "sângeorgiu de pădure", "nyárádszereda", "măgherani",
  ],
};

export function normalizeRegionText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu-HU");
}

export function eventCountyMatches(value: string, county: RegionCounty) {
  const normalized = normalizeRegionText(value);
  return COUNTY_KEYWORDS[county].some((keyword) => normalized.includes(normalizeRegionText(keyword)));
}

export function eventMatchesRegion(value: string) {
  return REGION_COUNTIES.some((county) => eventCountyMatches(value, county));
}
