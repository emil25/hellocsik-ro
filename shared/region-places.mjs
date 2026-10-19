export const REGION_AREAS = [
  {
    slug: "csik",
    name: "Csík és környéke",
    shortName: "Csík",
    color: "#4b59c7",
  },
  {
    slug: "udvarhely",
    name: "Udvarhely és környéke",
    shortName: "Udvarhely",
    color: "#bb577d",
  },
  {
    slug: "gyergyo",
    name: "Gyergyó és környéke",
    shortName: "Gyergyó",
    color: "#238672",
  },
  {
    slug: "haromszek",
    name: "Háromszék",
    shortName: "Háromszék",
    color: "#bd7c28",
  },
  {
    slug: "maros",
    name: "Maros térsége",
    shortName: "Maros",
    color: "#7e61be",
  },
  { slug: "sovidek", name: "Sóvidék", shortName: "Sóvidék", color: "#338ba6" },
];

const place = (slug, name, area, aliases = [], city = false) => ({
  slug,
  name,
  area,
  keys: [name, ...aliases],
  city,
});
export const REGION_PLACES = [
  place(
    "csikszereda",
    "Csíkszereda",
    "csik",
    [
      "Miercurea Ciuc",
      "Csíkszeredában",
      "Csíkszeredán",
      "Csíksomlyó",
      "Șumuleu Ciuc",
      "Csíkzsögöd",
    ],
    true,
  ),
  place(
    "szekelyudvarhely",
    "Székelyudvarhely",
    "udvarhely",
    ["Odorheiu Secuiesc", "Székelyudvarhelyen"],
    true,
  ),
  place(
    "sepsiszentgyorgy",
    "Sepsiszentgyörgy",
    "haromszek",
    ["Sfântu Gheorghe", "Sepsiszentgyörgyön"],
    true,
  ),
  place(
    "marosvasarhely",
    "Marosvásárhely",
    "maros",
    ["Târgu Mureș", "Marosvásárhelyen"],
    true,
  ),
  place(
    "gyergyoszentmiklos",
    "Gyergyószentmiklós",
    "gyergyo",
    ["Gheorgheni", "Gyergyószentmiklóson"],
    true,
  ),
  place(
    "kezdivasarhely",
    "Kézdivásárhely",
    "haromszek",
    ["Târgu Secuiesc", "Kézdivásárhelyen"],
    true,
  ),
  place("szovata", "Szováta", "sovidek", ["Sovata", "Szovátán"], true),
  place(
    "szekelykeresztur",
    "Székelykeresztúr",
    "udvarhely",
    ["Cristuru Secuiesc"],
    true,
  ),
  place("barot", "Barót", "haromszek", ["Baraolt"], true),
  place("kovaszna", "Kovászna", "haromszek", ["Covasna", "Kovásznán"], true),
  place("borszek", "Borszék", "gyergyo", ["Borsec", "Borszéki"], true),
  place("marosheviz", "Maroshévíz", "gyergyo", ["Toplița"], true),
  place("tusnadfurdo", "Tusnádfürdő", "csik", ["Băile Tușnad"], true),
  place("szentegyhaza", "Szentegyháza", "udvarhely", ["Vlăhița"], true),
  place("balanbanya", "Balánbánya", "csik", ["Bălan"], true),
  place(
    "nyaradszereda",
    "Nyárádszereda",
    "maros",
    ["Miercurea Nirajului"],
    true,
  ),
  place(
    "erdoszentgyorgy",
    "Erdőszentgyörgy",
    "maros",
    ["Sângeorgiu de Pădure"],
    true,
  ),
  place("szaszregen", "Szászrégen", "maros", ["Reghin"], true),
  place("segesvar", "Segesvár", "maros", ["Sighișoara", "Segesvári"], true),
  place(
    "bodzafordulo",
    "Bodzaforduló",
    "haromszek",
    ["Întorsura Buzăului"],
    true,
  ),
  place("hargitafurdo", "Hargitafürdő", "csik", ["Harghita Băi"]),
  place("csikcsicso", "Csíkcsicsó", "csik", ["Ciceu"]),
  place("madefalva", "Madéfalva", "csik", ["Siculeni"]),
  place("szepviz", "Szépvíz", "csik", ["Csíkszépvíz", "Frumoasa"]),
  place("csikpalfalva", "Csíkpálfalva", "csik", [
    "Păuleni Ciuc",
    "Csíkdelne",
    "Delnița",
    "Csíkcsomortán",
    "Șoimeni",
  ]),
  place("csikszentmihaly", "Csíkszentmihály", "csik", ["Mihăileni"]),
  place("csikrakos", "Csíkrákos", "csik", ["Racu"]),
  place("csikmadaras", "Csíkmadaras", "csik", ["Mădăraș"]),
  place("csikdanfalva", "Csíkdánfalva", "csik", ["Dănești"]),
  place("csikkarcfalva", "Csíkkarcfalva", "csik", [
    "Karcfalva",
    "Cârța",
    "Csíkjenőfalva",
  ]),
  place("csikszenttamas", "Csíkszenttamás", "csik", ["Tomești"]),
  place("csikszentdomokos", "Csíkszentdomokos", "csik", ["Sândominic"]),
  place("csikszentkiraly", "Csíkszentkirály", "csik", ["Sâncrăieni"]),
  place("csikszentimre", "Csíkszentimre", "csik", ["Sântimbru"]),
  place("csikszentsimon", "Csíkszentsimon", "csik", [
    "Sânsimion",
    "Csíkcsatószeg",
    "Cetățuia",
  ]),
  place("csikszentmarton", "Csíkszentmárton", "csik", ["Sânmartin"]),
  place("csikkozmas", "Csíkkozmás", "csik", ["Cozmeni"]),
  place("csikszentgyorgy", "Csíkszentgyörgy", "csik", [
    "Ciucsângeorgiu",
    "Csíkbánkfalva",
    "Bancu",
  ]),
  place("csikszentlelek", "Csíkszentlélek", "csik", [
    "Leliceni",
    "Csíkmindszent",
    "Misentea",
  ]),
  place("tusnad", "Tusnád", "csik", ["Tușnad", "Újtusnád", "Tușnadu Nou"]),
  place("gyimeskozeplok", "Gyimesközéplok", "csik", ["Lunca de Jos"]),
  place("gyimesfelsolok", "Gyimesfelsőlok", "csik", ["Lunca de Sus"]),
  place("szep-havas", "Szép-havas és Pogány-havas", "csik", [
    "Szép-havas",
    "Pogány-havas",
    "Csíki-havasok",
  ]),
  place("zetelaka", "Zetelaka", "udvarhely", ["Zetea"]),
  place("oroszhegy", "Oroszhegy", "udvarhely", ["Dealu"]),
  place("fenyed", "Fenyéd", "udvarhely", ["Brădești"]),
  place("kapolnasfalu", "Kápolnásfalu", "udvarhely", ["Căpâlnița"]),
  place("lovete", "Lövéte", "udvarhely", ["Lueta"]),
  place("homorodszentmarton", "Homoródszentmárton", "udvarhely", ["Mărtiniș"]),
  place("homorodalmas", "Homoródalmás", "udvarhely", ["Merești"]),
  place("farkaslaka", "Farkaslaka", "udvarhely", ["Lupeni"]),
  place("gyergyoditro", "Gyergyóditró", "gyergyo", ["Ditró", "Ditrău"]),
  place("gyergyoszarhegy", "Gyergyószárhegy", "gyergyo", ["Lăzarea"]),
  place("gyergyoalfalu", "Gyergyóalfalu", "gyergyo", ["Joseni"]),
  place("gyergyocsomafalva", "Gyergyócsomafalva", "gyergyo", ["Ciumani"]),
  place("gyergyoujfalu", "Gyergyóújfalu", "gyergyo", ["Suseni"]),
  place("gyergyoremete", "Gyergyóremete", "gyergyo", ["Remetea"]),
  place("vaslab", "Vasláb", "gyergyo", ["Voșlăbeni"]),
  place("arkos", "Árkos", "haromszek", ["Arcuș"]),
  place("illyefalva", "Illyefalva", "haromszek", ["Ilieni"]),
  place("sepsibukszad", "Sepsibükszád", "haromszek", ["Bixad"]),
  place("balvanyos", "Bálványosfürdő", "haromszek", [
    "Balvanyos",
    "Băile Balvanyos",
  ]),
  place("sugasfurdo", "Sugásfürdő", "haromszek", ["Șugaș Băi"]),
  place("kezdiszentlelek", "Kézdiszentlélek", "haromszek", ["Sânzieni"]),
  place("zabola", "Zabola", "haromszek", ["Zăbala"]),
  place("csernaton", "Csernáton", "haromszek", ["Cernat"]),
  place("gelence", "Gelence", "haromszek", ["Ghelința"]),
  place("torja", "Torja", "haromszek", ["Turia"]),
  place("rety", "Réty", "haromszek", ["Reci"]),
  place("bodok", "Bodok", "haromszek", ["Bodoc"]),
  place("miklosvar", "Miklósvár", "haromszek", ["Micloșoara"]),
  place("nagybacon", "Nagybacon", "haromszek", ["Bățanii Mari", "Bacon"]),
  place("vargyas", "Vargyas", "haromszek", ["Vârghiș"]),
  place("parajd", "Parajd", "sovidek", ["Praid"]),
  place("korond", "Korond", "sovidek", ["Corund"]),
  place("alsosofalva", "Alsósófalva", "sovidek", ["Ocna de Jos"]),
  place("felsosofalva", "Felsősófalva", "sovidek", ["Ocna de Sus"]),
  place("marosszentgyorgy", "Marosszentgyörgy", "maros", [
    "Sângeorgiu de Mureș",
  ]),
  place("saromberke", "Sáromberke", "maros", ["Dumbrăvioara"]),
  place("gernyeszeg", "Gernyeszeg", "maros", ["Gornești"]),
  place("nagyernye", "Nagyernye", "maros", ["Ernei"]),
  place("akosfalva", "Ákosfalva", "maros", ["Acățari"]),
  place("nyaradmagyaros", "Nyárádmagyarós", "maros", ["Măgherani"]),
  place("nyaradremete", "Nyárádremete", "maros", ["Eremitu"]),
];

export const normalizePlaceText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const aliases = REGION_PLACES.flatMap((p) =>
  p.keys.map((key) => ({ value: normalizePlaceText(key), place: p })),
).sort((a, b) => b.value.length - a.value.length);
export function findRegionPlace(value) {
  const text = ` ${normalizePlaceText(value)
    .replace(/\b(?:judetul|jud|county) (?:covasna|harghita|mures)\b/g, "")
    .replace(/\b(?:kovaszna|hargita|maros) megye\b/g, "")} `;
  return aliases.find((alias) => text.includes(` ${alias.value} `))?.place;
}
const knownVenues = [
  ["csiki mozi", "csikszereda"],
  ["cinema csiki", "csikszereda"],
  ["miko var", "csikszereda"],
  ["csiki szekely muzeum", "csikszereda"],
  ["szakszervezetek muvelodesi haza", "csikszereda"],
  ["zengo ter", "csikszereda"],
  ["olommadar", "csikszereda"],
  ["hotel fenyo", "csikszereda"],
  ["harghita business center", "szekelyudvarhely"],
  ["kulturpalota", "marosvasarhely"],
  ["palatul culturii", "marosvasarhely"],
  ["ariel szinhaz", "marosvasarhely"],
  ["tamasi aron szinhaz", "sepsiszentgyorgy"],
  ["figura studio", "gyergyoszentmiklos"],
  ["zabola estate", "zabola"],
  ["vardomb panzio", "csikcsicso"],
];
export function regionPlaceForEvent(event) {
  const actual =
    findRegionPlace(event.locality ?? "") ??
    findRegionPlace(event.locationAddress ?? "") ??
    findRegionPlace(event.location ?? "") ??
    findRegionPlace(event.title ?? "");
  if (actual) return actual;
  const location = normalizePlaceText(event.location ?? "");
  const venue = knownVenues.find(([name]) => location.includes(name));
  return venue ? REGION_PLACES.find((p) => p.slug === venue[1]) : undefined;
}
export function regionAreaForEvent(event) {
  const p = regionPlaceForEvent(event);
  return p ? REGION_AREAS.find((area) => area.slug === p.area) : undefined;
}
export function mergeLocalityAddress(address, locality) {
  const a = String(address ?? "").trim(),
    city = String(locality ?? "").trim();
  if (!city || normalizePlaceText(a).includes(normalizePlaceText(city)))
    return a || null;
  return [a, city].filter(Boolean).join(", ");
}
