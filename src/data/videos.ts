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

export async function loadLiveVideos(): Promise<VideoItem[]> {
  try {
    const res = await fetch(VIDEO_SHEET_CSV_URL);
    if (!res.ok) return [];

    const csvText = await res.text();
    const parsed = Papa.parse<string[]>(csvText, { header: false, skipEmptyLines: "greedy" });
    const liveItems: VideoItem[] = [];

    parsed.data.slice(1).forEach((cols, index) => {
      const rawTitle = cols[1]?.replace(/"/g, "").trim() || "";
      const latRaw = cols[2]?.replace(/"/g, "").trim();
      const lngRaw = cols[3]?.replace(/"/g, "").trim();
      const lat = parseFloat(latRaw);
      const lng = parseFloat(lngRaw);
      const youtubeId = cols[4]?.replace(/"/g, "").trim() || "";

      // Column F (index 5): Description
      const rawDesc = cols[5]?.replace(/"/g, "").trim() || "";
      // Column G (index 6): Category
      const category = cols[6]?.replace(/"/g, "").trim() || "Borders";
      // Column H (index 7): Region
      const region = cols[7]?.replace(/"/g, "").trim() || "Global";

      // Fix encoding artifacts if present (e.g. â€“ -> –)
      const cleanTitle = rawTitle.replace(/â€“/g, "–").replace(/â/g, "–");
      const cleanDesc = rawDesc.replace(/â€“/g, "–").replace(/â/g, "–");

      const description = cleanDesc || cleanTitle;

      if (cleanTitle && !isNaN(lat) && !isNaN(lng)) {
        liveItems.push({
          id: `v-sheet-${index + 1}`,
          title: cleanTitle,
          lat,
          lng,
          youtubeId,
          category,
          region,
          description,
          duration: youtubeId ? "03:00" : undefined,
          date: cols[0]?.split(" ")[0] || "2026-03-13",
        });
      }
    });

    return liveItems.reverse();
  } catch (e) {
    console.error("Error fetching video sheet:", e);
    return [];
  }
}

export const initialVideos: VideoItem[] = [];
