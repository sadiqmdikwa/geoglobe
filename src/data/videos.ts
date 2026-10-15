import Papa from "papaparse";

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  region: string;
  lat: number;
  lng: number;
  youtubeId: string;
  description: string;
  duration?: string;
  date?: string;
}

export const VIDEO_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=0&single=true&output=csv";
export const GAME_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=1141935128&single=true&output=csv";

export async function loadLiveVideos(): Promise<VideoItem[]> {
  const liveItems: VideoItem[] = [];

  // 1. Fetch Videos & Pins Sheet (gid=0)
  try {
    const res = await fetch(VIDEO_SHEET_CSV_URL);
    if (res.ok) {
      const csvText = await res.text();
      const parsed = Papa.parse<string[]>(csvText, { header: false, skipEmptyLines: "greedy" });
      parsed.data.slice(1).forEach((cols, index) => {
        const title = cols[1]?.replace(/"/g, "").trim() || "";
        const latRaw = cols[2]?.replace(/"/g, "").trim();
        const lngRaw = cols[3]?.replace(/"/g, "").trim();
        const lat = parseFloat(latRaw);
        const lng = parseFloat(lngRaw);
        const youtubeId = cols[4]?.replace(/"/g, "").trim() || "";
        const correctAnswer = cols[5]?.replace(/"/g, "").trim() || "";
        const category = cols[6]?.replace(/"/g, "").trim() || "Border Mysteries";
        const region = cols[7]?.replace(/"/g, "").trim() || "Global";

        if (title && !isNaN(lat) && !isNaN(lng)) {
          const displayTitle = correctAnswer ? `${title} (${correctAnswer})` : title;
          liveItems.push({
            id: `v-sheet-${index + 1}`,
            title: displayTitle,
            lat,
            lng,
            youtubeId,
            category,
            region,
            description: title,
            duration: youtubeId ? "03:00" : undefined,
            date: cols[0]?.split(" ")[0] || "2026-03-13",
          });
        }
      });
    }
  } catch (e) {
    console.error("Error fetching video sheet:", e);
  }

  // 2. Fetch Quiz & Game Pins Sheet (gid=1141935128)
  try {
    const res2 = await fetch(GAME_SHEET_CSV_URL);
    if (res2.ok) {
      const csvText2 = await res2.text();
      const parsed2 = Papa.parse<string[]>(csvText2, { header: false, skipEmptyLines: "greedy" });
      parsed2.data.slice(1).forEach((cols, index) => {
        const title = cols[1]?.replace(/"/g, "").trim() || "";
        const latRaw = cols[2]?.replace(/"/g, "").trim();
        const lngRaw = cols[3]?.replace(/"/g, "").trim();
        const lat = parseFloat(latRaw);
        const lng = parseFloat(lngRaw);
        const youtubeId = cols[4]?.replace(/"/g, "").trim() || "";
        const correctAnswer = cols[5]?.replace(/"/g, "").trim() || "";
        const category = cols[6]?.replace(/"/g, "").trim() || "General";
        const region = cols[7]?.replace(/"/g, "").trim() || "Global";

        if (title && !isNaN(lat) && !isNaN(lng)) {
          const itemTitle = correctAnswer ? `${correctAnswer}: ${title}` : title;
          if (!liveItems.some((v) => Math.abs(v.lat - lat) < 0.0001 && Math.abs(v.lng - lng) < 0.0001)) {
            liveItems.push({
              id: `g-sheet-${index + 1}`,
              title: itemTitle,
              lat,
              lng,
              youtubeId,
              category,
              region,
              description: title,
              duration: youtubeId ? "03:00" : undefined,
              date: cols[0]?.split(" ")[0] || "2026-03-13",
            });
          }
        }
      });
    }
  } catch (e) {
    console.error("Error fetching game sheet for pins:", e);
  }

  return liveItems;
}

export const initialVideos: VideoItem[] = [];
