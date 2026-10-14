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

export async function loadGameQuestions(): Promise<GameQuestion[]> {
  const response = await fetch(GAME_SHEET_CSV_URL);
  if (!response.ok) {
    throw new Error(`Question sheet request failed with status ${response.status}`);
  }

  const csv = Papa.parse<string[]>(await response.text(), {
    header: false,
    skipEmptyLines: "greedy",
  });

  return csv.data.slice(1).flatMap((columns, index) => {
    const title = columns[1]?.trim() ?? "";
    const name = columns[5]?.trim() ?? "";
    if (!title || !name) return [];

    const lat = Number.parseFloat(columns[2] ?? "");
    const lng = Number.parseFloat(columns[3] ?? "");
    const youtubeId = columns[4]?.trim();

    return [{
      id: `sheet-${index + 1}`,
      title,
      name,
      lat: Number.isFinite(lat) ? lat : 0,
      lng: Number.isFinite(lng) ? lng : 0,
      category: columns[6]?.trim() || "General",
      region: columns[7]?.trim() || "Global",
      ...(youtubeId ? { youtubeId } : {}),
    }];
  });
}