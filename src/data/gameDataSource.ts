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

const COUNTRY_CODE_MAP: { [key: string]: string } = {
  "nepal": "np",
  "niger": "ne",
  "nigeria": "ng",
  "lesotho": "ls",
  "djibouti": "dj",
  "belgium": "be",
  "andorra": "ad",
  "liechtenstein": "li",
  "bhutan": "bt",
  "oman": "om",
  "kyrgyzstan": "kg",
  "united states": "us",
  "suriname": "sr",
  "nauru": "nr",
  "kiribati": "ki",
  "canada": "ca",
  "japan": "jp",
  "switzerland": "ch",
  "brazil": "br",
  "argentina": "ar",
  "france": "fr",
  "germany": "de",
  "italy": "it",
  "spain": "es",
  "united kingdom": "gb",
  "australia": "au",
  "new zealand": "nz",
  "south africa": "za",
  "egypt": "eg",
  "kenya": "ke",
  "ghana": "gh",
  "namibia": "na",
  "gambia": "gm",
  "albania": "al",
  "cyprus": "cy",
  "vatican city": "va",
  "malaysia": "my",
  "indonesia": "id",
  "singapore": "sg",
  "mongolia": "mn",
  "uruguay": "uy",
  "panama": "pa",
  "mexico": "mx",
  "chile": "cl",
  "fiji": "fj",
  "papua new guinea": "pg",
  "united arab emirates": "ae",
  "bangladesh": "bd",
  "jordan": "jo",
  "lebanon": "lb",
  "kazakhstan": "kz",
  "ethiopia": "et",
  "somalia": "so",
  "eswatini": "sz",
  "tanzania": "tz",
  "norway": "no",
  "peru": "pe",
  "paraguay": "py",
  "colombia": "co",
  "venezuela": "ve",
  "bolivia": "bo",
  "ecuador": "ec",
  "cuba": "cu",
  "haiti": "ht",
  "jamaica": "jm",
  "iceland": "is",
  "ireland": "ie",
  "portugal": "pt",
  "greece": "gr",
  "turkey": "tr",
  "sweden": "se",
  "finland": "fi",
  "denmark": "dk",
  "poland": "pl",
  "ukraine": "ua",
  "romania": "ro",
  "bulgaria": "bg",
  "hungary": "hu",
  "austria": "at",
  "czech republic": "cz",
  "slovakia": "sk",
  "slovenia": "si",
  "croatia": "hr",
  "serbia": "rs",
  "bosnia and herzegovina": "ba",
  "montenegro": "me",
  "kosovo": "xk",
  "macedonia": "mk",
  "estonia": "ee",
  "latvia": "lv",
  "lithuania": "lt",
  "belarus": "by",
  "moldova": "md",
  "georgia": "ge",
  "armenia": "am",
  "azerbaijan": "az",
  "israel": "il",
  "palestine": "ps",
  "syria": "sy",
  "iraq": "iq",
  "iran": "ir",
  "saudi arabia": "sa",
  "yemen": "ye",
  "kuwait": "kw",
  "qatar": "qa",
  "bahrain": "bh",
  "pakistan": "pk",
  "india": "in",
  "sri lanka": "lk",
  "maldives": "mv",
  "afghanistan": "af",
  "tajikistan": "tj",
  "turkmenistan": "tm",
  "uzbekistan": "uz",
  "china": "cn",
  "north korea": "kp",
  "south korea": "kr",
  "taiwan": "tw",
  "vietnam": "vn",
  "laos": "la",
  "cambodia": "kh",
  "thailand": "th",
  "myanmar": "mm",
  "philippines": "ph",
  "brunei": "bn",
  "morocco": "ma",
  "algeria": "dz",
  "tunisia": "tn",
  "libya": "ly",
  "sudan": "sd",
  "south sudan": "ss",
  "uganda": "ug",
  "rwanda": "rw",
  "burundi": "bi",
  "cameroon": "cm",
  "chad": "td",
  "mali": "ml",
  "senegal": "sn",
  "guinea": "gn",
  "sierra leone": "sl",
  "liberia": "lr",
  "togo": "tg",
  "benin": "bj",
  "angola": "ao",
  "zambia": "zm",
  "zimbabwe": "zw",
  "botswana": "bw",
  "mozambique": "mz",
  "madagascar": "mg",
  "mauritius": "mu",
  "seychelles": "sc",
  "sao tome and principe": "st",
  "sao tome": "st",
  "cabo verde": "cv",
  "cape verde": "cv",
  "cote divoire": "ci",
  "ivory coast": "ci"
};

export function getVerifiedCountryCode(countryName: string): string | undefined {
  if (!countryName) return undefined;

  const normalized = countryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/republic of|the|democratic|democratique|kingdom of|federal|islamic|state of|and|di/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  if (COUNTRY_CODE_MAP[normalized]) return COUNTRY_CODE_MAP[normalized];

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
