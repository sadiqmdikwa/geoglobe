import Papa from "papaparse";

export interface GameQuestion {
  id: string;
  title: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  region: string;
  clue?: string;
  fact?: string;
  countryCode?: string;
  youtubeId?: string;
}

const GAME_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=1141935128&single=true&output=csv";

export const GAME_ADMIN_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIR5OmHrP1wNIksz_XDt86EpNsycOpkPBfPJJrLS6ouBLbXD_gahpm26cCvewF9Gkt/exec";

// Exhaustive ISO 3166-1 alpha-2 mapping covering all world nations, territories, and common aliases
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  // Caribbean & Americas
  "grenada": "gd",
  "barbados": "bb",
  "saint lucia": "lc",
  "st lucia": "lc",
  "saint vincent and the grenadines": "vc",
  "st vincent": "vc",
  "dominica": "dm",
  "antigua and barbuda": "ag",
  "saint kitts and nevis": "kn",
  "st kitts": "kn",
  "trinidad and tobago": "tt",
  "trinidad": "tt",
  "bahamas": "bs",
  "the bahamas": "bs",
  "belize": "bz",
  "guyana": "gy",
  "suriname": "sr",
  "cuba": "cu",
  "haiti": "ht",
  "jamaica": "jm",
  "dominican republic": "do",
  "puerto rico": "pr",
  "panama": "pa",
  "costa rica": "cr",
  "nicaragua": "ni",
  "honduras": "hn",
  "el salvador": "sv",
  "guatemala": "gt",
  "mexico": "mx",
  "canada": "ca",
  "united states": "us",
  "usa": "us",
  "brazil": "br",
  "argentina": "ar",
  "colombia": "co",
  "peru": "pe",
  "chile": "cl",
  "venezuela": "ve",
  "ecuador": "ec",
  "bolivia": "bo",
  "paraguay": "py",
  "uruguay": "uy",

  // Africa
  "algeria": "dz",
  "angola": "ao",
  "benin": "bj",
  "botswana": "bw",
  "burkina faso": "bf",
  "burundi": "bi",
  "cabo verde": "cv",
  "cape verde": "cv",
  "cameroon": "cm",
  "central african republic": "cf",
  "chad": "td",
  "comoros": "km",
  "congo": "cg",
  "republic of the congo": "cg",
  "democratic republic of the congo": "cd",
  "dr congo": "cd",
  "cote divoire": "ci",
  "ivory coast": "ci",
  "djibouti": "dj",
  "egypt": "eg",
  "equatorial guinea": "gq",
  "eritrea": "er",
  "eswatini": "sz",
  "swaziland": "sz",
  "ethiopia": "et",
  "gabon": "ga",
  "gambia": "gm",
  "the gambia": "gm",
  "ghana": "gh",
  "guinea": "gn",
  "guinea bissau": "gw",
  "kenya": "ke",
  "lesotho": "ls",
  "liberia": "lr",
  "libya": "ly",
  "madagascar": "mg",
  "malawi": "mw",
  "mali": "ml",
  "mauritania": "mr",
  "mauritius": "mu",
  "morocco": "ma",
  "mozambique": "mz",
  "namibia": "na",
  "niger": "ne",
  "nigeria": "ng",
  "rwanda": "rw",
  "sao tome and principe": "st",
  "sao tome": "st",
  "principe": "st",
  "senegal": "sn",
  "seychelles": "sc",
  "sierra leone": "sl",
  "somalia": "so",
  "south africa": "za",
  "south sudan": "ss",
  "sudan": "sd",
  "tanzania": "tz",
  "togo": "tg",
  "tunisia": "tn",
  "uganda": "ug",
  "zambia": "zm",
  "zimbabwe": "zw",

  // Europe
  "albania": "al",
  "andorra": "ad",
  "armenia": "am",
  "austria": "at",
  "azerbaijan": "az",
  "belarus": "by",
  "belgium": "be",
  "bosnia and herzegovina": "ba",
  "bosnia": "ba",
  "bulgaria": "bg",
  "croatia": "hr",
  "cyprus": "cy",
  "czech republic": "cz",
  "czechia": "cz",
  "denmark": "dk",
  "estonia": "ee",
  "finland": "fi",
  "france": "fr",
  "georgia": "ge",
  "germany": "de",
  "greece": "gr",
  "hungary": "hu",
  "iceland": "is",
  "ireland": "ie",
  "italy": "it",
  "kosovo": "xk",
  "latvia": "lv",
  "liechtenstein": "li",
  "lithuania": "lt",
  "luxembourg": "lu",
  "macedonia": "mk",
  "north macedonia": "mk",
  "malta": "mt",
  "moldova": "md",
  "monaco": "mc",
  "montenegro": "me",
  "netherlands": "nl",
  "norway": "no",
  "poland": "pl",
  "portugal": "pt",
  "romania": "ro",
  "russia": "ru",
  "san marino": "sm",
  "serbia": "rs",
  "slovakia": "sk",
  "slovenia": "si",
  "spain": "es",
  "sweden": "se",
  "switzerland": "ch",
  "turkey": "tr",
  "ukraine": "ua",
  "united kingdom": "gb",
  "uk": "gb",
  "vatican city": "va",
  "vatican": "va",

  // Asia & Middle East
  "afghanistan": "af",
  "bahrain": "bh",
  "bangladesh": "bd",
  "bhutan": "bt",
  "brunei": "bn",
  "cambodia": "kh",
  "china": "cn",
  "east timor": "tl",
  "timor leste": "tl",
  "india": "in",
  "indonesia": "id",
  "iran": "ir",
  "iraq": "iq",
  "israel": "il",
  "japan": "jp",
  "jordan": "jo",
  "kazakhstan": "kz",
  "kuwait": "kw",
  "kyrgyzstan": "kg",
  "laos": "la",
  "lebanon": "lb",
  "malaysia": "my",
  "maldives": "mv",
  "mongolia": "mn",
  "myanmar": "mm",
  "burma": "mm",
  "nepal": "np",
  "north korea": "kp",
  "oman": "om",
  "pakistan": "pk",
  "palestine": "ps",
  "philippines": "ph",
  "qatar": "qa",
  "saudi arabia": "sa",
  "singapore": "sg",
  "south korea": "kr",
  "sri lanka": "lk",
  "syria": "sy",
  "taiwan": "tw",
  "tajikistan": "tj",
  "thailand": "th",
  "turkmenistan": "tm",
  "united arab emirates": "ae",
  "uae": "ae",
  "uzbekistan": "uz",
  "vietnam": "vn",
  "yemen": "ye",

  // Oceania
  "australia": "au",
  "fiji": "fj",
  "kiribati": "ki",
  "marshall islands": "mh",
  "micronesia": "fm",
  "nauru": "nr",
  "new zealand": "nz",
  "palau": "pw",
  "papua new guinea": "pg",
  "samoa": "ws",
  "solomon islands": "sb",
  "tonga": "to",
  "tuvalu": "tv",
  "vanuatu": "vu"
};

export function getVerifiedCountryCode(countryName: string): string | undefined {
  if (!countryName) return undefined;

  const rawClean = countryName.toLowerCase().trim();

  // 1. Direct match on raw string
  if (COUNTRY_CODE_MAP[rawClean]) return COUNTRY_CODE_MAP[rawClean];

  // 2. Normalized match (remove accents & filler words)
  const normalized = countryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/republic of|the|democratic|democratique|kingdom of|federal|islamic|state of|and|di/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  if (COUNTRY_CODE_MAP[normalized]) return COUNTRY_CODE_MAP[normalized];

  // 3. Partial key match
  for (const [key, code] of Object.entries(COUNTRY_CODE_MAP)) {
    const normKey = key.replace(/[^a-z0-9]/g, "");
    if (normalized.includes(normKey) || normKey.includes(normalized)) {
      return code;
    }
  }

  return undefined;
}

export async function loadGameQuestions(): Promise<GameQuestion[]> {
  try {
    const response = await fetch(GAME_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Question sheet request failed with status ${response.status}`);
    }

    const csvText = await response.text();
    const csv = Papa.parse<string[]>(csvText, {
      header: false,
      skipEmptyLines: "greedy",
    });

    const parsed = csv.data.slice(1).flatMap((columns, index) => {
      const title = columns[1]?.replace(/"/g, "").trim() ?? "";
      const name = columns[5]?.replace(/"/g, "").trim() ?? "";
      if (!title || !name) return [];

      const lat = Number.parseFloat(columns[2] ?? "");
      const lng = Number.parseFloat(columns[3] ?? "");
      const youtubeId = columns[4]?.replace(/"/g, "").trim();
      const category = columns[6]?.replace(/"/g, "").trim() || "General";
      const region = columns[7]?.replace(/"/g, "").trim() || "Global";

      const verifiedCode = getVerifiedCountryCode(name);

      return [{
        id: `sheet-${index + 1}`,
        title,
        clue: title,
        name,
        lat: Number.isFinite(lat) ? lat : 0,
        lng: Number.isFinite(lng) ? lng : 0,
        category,
        region,
        ...(verifiedCode ? { countryCode: verifiedCode } : {}),
        ...(youtubeId ? { youtubeId } : {}),
      }];
    });

    return parsed;
  } catch (err) {
    console.error("Error fetching live game questions:", err);
    return [];
  }
}
