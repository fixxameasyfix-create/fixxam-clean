export type ServiceSearchDictionary = {
  terms: string[];
  aliases: string[];
};

const COMMON_TERMS: Record<
  string,
  string[]
> = {
  repair: [
    "gyara",
    "gyaran",
    "repair",
    "fix",
    "fixing",
    "maintenance",
    "gyara abu",
    "abu ya lalace",
    "baya aiki",
    "ba ya aiki",
    "ya lalace",
    "damaged",
  ],

  installation: [
    "installation",
    "install",
    "installing",
    "saka",
    "sakawa",
    "girke",
    "girki",
    "shigarwa",
    "mount",
    "fitting",
  ],

  cleaning: [
    "cleaning",
    "clean",
    "wash",
    "washing",
    "tsaftace",
    "tsaftacewa",
    "wanke",
    "wankewa",
    "share",
    "shara",
  ],

  plumbing: [
    "plumbing",
    "plumber",
    "pipe",
    "pipes",
    "bututu",
    "ruwa",
    "matsalar ruwa",
    "gyaran ruwa",
    "famfo",
    "tap",
    "toilet",
    "bandaki",
  ],

  electrical: [
    "electric",
    "electrical",
    "electrician",
    "wiring",
    "wire",
    "waya",
    "lantarki",
    "wutar lantarki",
    "gyaran lantarki",
    "socket",
    "switch",
  ],

  hair: [
    "hair",
    "haircut",
    "hair cut",
    "barbing",
    "barber",
    "aski",
    "yin aski",
    "gyaran gashi",
    "yanke gashi",
    "gashi",
    "salon",
  ],

  beauty: [
    "beauty",
    "makeup",
    "make up",
    "kwalliya",
    "gyaran fuska",
    "fuska",
    "nails",
    "nail",
    "farce",
    "manicure",
    "pedicure",
  ],

  phone: [
    "phone",
    "mobile",
    "smartphone",
    "waya",
    "wayata",
    "iphone",
    "android",
    "screen",
    "display",
    "charging",
    "charger",
  ],

  computer: [
    "computer",
    "laptop",
    "pc",
    "desktop",
    "keyboard",
    "mouse",
    "printer",
    "software",
    "hardware",
    "kwamfuta",
    "computer dina",
  ],

  car: [
    "car",
    "vehicle",
    "auto",
    "mota",
    "motar",
    "abin hawa",
  ],

  ac: [
    "ac",
    "air conditioner",
    "air conditioning",
    "aircon",
    "conditioner",
    "na'urar sanyaya",
    "sanyaya",
    "gyaran ac",
    "ac dina",
  ],

  refrigerator: [
    "refrigerator",
    "fridge",
    "freezer",
    "firiji",
    "friji",
    "daskarewa",
    "gyaran firiji",
  ],

  washingMachine: [
    "washing machine",
    "washer",
    "washing",
    "machine",
    "injin wanki",
    "na'urar wanki",
    "wanki",
    "wankin kaya",
  ],

  generator: [
    "generator",
    "gen",
    "power generator",
    "janareta",
    "jenereta",
    "wutar generator",
    "gyaran generator",
  ],

  welding: [
    "welding",
    "welder",
    "weld",
    "walda",
    "welding work",
    "karfe",
    "gyaran karfe",
  ],

  painting: [
    "painting",
    "painter",
    "paint",
    "fenti",
    "fentin gida",
    "zane gida",
    "gyaran bango",
  ],

  construction: [
    "construction",
    "building",
    "builder",
    "building work",
    "gini",
    "ginawa",
    "gida",
    "aikin gini",
    "gyaran gida",
  ],

  furniture: [
    "furniture",
    "carpenter",
    "carpentry",
    "wood",
    "katako",
    "kayan daki",
    "kujera",
    "tebur",
    "wardrobe",
    "cabinet",
  ],

  moving: [
    "moving",
    "relocation",
    "moving house",
    "move house",
    "motsawa",
    "sauya gida",
    "kawo kaya",
    "daukar kaya",
  ],

  delivery: [
    "delivery",
    "deliver",
    "dispatch",
    "transport",
    "shipping",
    "kai kaya",
    "isarda kaya",
    "aika kaya",
    "daukar kaya",
  ],

  photography: [
    "photography",
    "photographer",
    "photo",
    "picture",
    "hotuna",
    "daukar hoto",
    "hoto",
  ],

  event: [
    "event",
    "events",
    "party",
    "wedding",
    "birthday",
    "bikin aure",
    "biki",
    "party",
    "shagali",
  ],
};

const LANGUAGE_TERMS: Record<
  string,
  string[]
> = {
  yoruba: [
    "atunṣe",
    "ṣe atunṣe",
    "fifi sori",
    "mimọ",
    "irun",
    "gige irun",
    "ile",
  ],

  igbo: [
    "ndozi",
    "idozi",
    "rụkwa",
    "ịrụkwa",
    "ịkpụ ntutu",
    "ntutu",
    "ụlọ",
  ],

  pidgin: [
    "fix am",
    "repair am",
    "make you fix",
    "abeg fix",
    "e don spoil",
    "e no dey work",
    "no dey work",
    "cut hair",
    "barb",
  ],
};

function normalize(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(/\s+/g, " ");
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map(normalize)
        .filter(Boolean),
    ),
  );
}

function includesAny(
  text: string,
  values: string[],
): boolean {
  return values.some(
    (value) =>
      text.includes(
        normalize(value),
      ),
  );
}

export function buildServiceSearchDictionary(
  input: {
    name?: string;
    description?: string;
    categoryId?: string;
    subcategoryId?: string;
  },
): ServiceSearchDictionary {
  const baseText = normalize([
    input.name,
    input.description,
    input.categoryId,
    input.subcategoryId,
  ].join(" "));

  const aliases: string[] = [];
  const terms: string[] = [];

  /*
   * Add original service information.
   */
  aliases.push(
    normalize(input.name),
    normalize(input.description),
    normalize(input.categoryId),
    normalize(input.subcategoryId),
  );

  /*
   * Add relevant common service groups.
   */
  for (
    const [
      group,
      groupTerms,
    ] of Object.entries(
      COMMON_TERMS,
    )
  ) {
    if (
      includesAny(
        baseText,
        groupTerms,
      ) ||
      baseText.includes(group)
    ) {
      terms.push(...groupTerms);
    }
  }

  /*
   * Add multilingual terms.
   *
   * These are intentionally added
   * conservatively rather than putting
   * every language into every service.
   */
  if (
    includesAny(
      baseText,
      COMMON_TERMS.hair,
    )
  ) {
    terms.push(
      ...LANGUAGE_TERMS.yoruba,
      ...LANGUAGE_TERMS.igbo,
      ...LANGUAGE_TERMS.pidgin,
    );
  }

  /*
   * Repair-related Nigerian expressions.
   */
  if (
    includesAny(
      baseText,
      COMMON_TERMS.repair,
    )
  ) {
    aliases.push(
      "gyara",
      "gyaran",
      "gyarawa",
      "fix",
      "repair",
      "fix it",
      "fix am",
      "repair am",
      "abeg fix am",
      "ya lalace",
      "baya aiki",
      "ba ya aiki",
    );
  }

  return {
    terms: unique(terms),
    aliases: unique(aliases),
  };
}