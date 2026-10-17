import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, Video, Database, Send, Plus, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin, Globe, RefreshCw
} from "lucide-react";
import { GAME_ADMIN_SCRIPT_URL } from "../data/gameDataSource";
import { loadLiveGlobeCountries, CountryData } from "../data/globeDataSource";

export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<"videos" | "game" | "globe">("globe");
  const [gameMode, setGameMode] = useState<"single" | "bulk">("single");

  // Video & Pins State
  const [videoForm, setVideoForm] = useState({
    title: "",
    lat: "",
    lng: "",
    youtubeId: "",
    description: "",
    category: "Borders",
    region: "Global"
  });

  // Game Single State
  const [singleGameForm, setSingleGameForm] = useState({
    title: "",
    lat: "",
    lng: "",
    category: "Borders",
    region: "Global",
    correctAnswer: ""
  });

  // Globe Country State
  const [globeForm, setGlobeForm] = useState({
    name: "",
    code: "",
    capital: "",
    population: "",
    region: "",
    area: "",
    languages: "",
    desc: "",
    wikiUrl: "",
    lat: "",
    lng: ""
  });
  const [liveCountries, setLiveCountries] = useState<{ [key: string]: CountryData }>({});
  const [isLoadingGlobe, setIsLoadingGlobe] = useState(false);

  // Game Bulk State
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; percent: number; log: string } | null>(null);

  // Status
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (activeTab === "globe") {
      fetchGlobeData();
    }
  }, [activeTab]);

  const fetchGlobeData = async () => {
    setIsLoadingGlobe(true);
    try {
      const data = await loadLiveGlobeCountries();
      setLiveCountries(data);
    } catch (e) {
      console.warn("Failed to load live globe data:", e);
    } finally {
      setIsLoadingGlobe(false);
    }
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // Submit Video & Pins
  const handleVideoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.youtubeId.trim()) {
      setStatus("error");
      setFeedback("Please fill out Title and YouTube Video ID.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      await fetch(GAME_ADMIN_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          title: videoForm.title.trim(),
          lat: parseFloat(videoForm.lat) || 0,
          lng: parseFloat(videoForm.lng) || 0,
          youtubeId: videoForm.youtubeId.trim(),
          description: videoForm.description.trim(),
          category: videoForm.category,
          region: videoForm.region
        }),
      });

      setStatus("success");
      setFeedback("Video location successfully submitted to Google Sheet!");
      playSuccessSound();
      setVideoForm({
        title: "",
        lat: "",
        lng: "",
        youtubeId: "",
        description: "",
        category: "Borders",
        region: "Global"
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setFeedback("Submission failed. Check network or script URL.");
    }
  };

  // Submit Globe Country Data
  const handleGlobeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!globeForm.name.trim() || !globeForm.code.trim()) {
      setStatus("error");
      setFeedback("Please fill out Country Name and ISO Code.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      await fetch(GAME_ADMIN_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          countryName: globeForm.name.trim(),
          code: globeForm.code.trim().toUpperCase(),
          capital: globeForm.capital.trim(),
          population: globeForm.population.trim(),
          region: globeForm.region.trim(),
          area: globeForm.area.trim(),
          languages: globeForm.languages.trim(),
          desc: globeForm.desc.trim(),
          wikiUrl: globeForm.wikiUrl.trim(),
          lat: parseFloat(globeForm.lat) || 0,
          lng: parseFloat(globeForm.lng) || 0,
          type: "globe_country"
        }),
      });

      setStatus("success");
      setFeedback(`Country "${globeForm.name}" successfully submitted to spreadsheet!`);
      playSuccessSound();
      setGlobeForm({
        name: "",
        code: "",
        capital: "",
        population: "",
        region: "",
        area: "",
        languages: "",
        desc: "",
        wikiUrl: "",
        lat: "",
        lng: ""
      });
      setTimeout(fetchData, 2000);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setFeedback("Submission failed. Check network or script URL.");
    }
  };

  const fetchData = () => {
    fetchGlobeData();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-black border border-white/10 rounded-[2.5rem] p-6 md:p-10 mb-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-geoCyan/15 text-geoCyan border border-geoCyan/30 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Admin & Data Portal</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Manage live Google Sheet content for Map Pins, Quiz Trivia, and 3D Globe Countries.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-gray-900/80 p-1.5 rounded-full border border-white/10 mb-8 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab("globe")}
          className={`py-3 rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "globe"
              ? "bg-geoCyan text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          3D GLOBE DATA
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`py-3 rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "videos"
              ? "bg-geoCyan text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          MAP PINS
        </button>
        <button
          onClick={() => setActiveTab("game")}
          className={`py-3 rounded-full font-extrabold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "game"
              ? "bg-geoYellow text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          TRIVIA GAME
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl border mb-6 text-sm flex items-center gap-3 ${
          status === "success" 
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200" 
            : "bg-rose-950/40 border-rose-500/40 text-rose-200"
        }`}>
          {status === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{feedback}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. 3D GLOBE COUNTRIES MANAGER FORM & LIVE INSPECTOR
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "globe" && (
        <div className="space-y-8">
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-geoCyan" />
                Add / Update 3D Globe Country
              </h2>
              <button
                onClick={fetchGlobeData}
                disabled={isLoadingGlobe}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGlobe ? "animate-spin" : ""}`} />
                <span>Refresh Live Data</span>
              </button>
            </div>
            <p className="text-gray-400 text-xs mb-6">
              Add custom data for any country. It instantly syncs with your Google Sheet and updates the 3D Globe Explorer.
            </p>

            <form onSubmit={handleGlobeSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Country Name *</label>
                  <input
                    type="text"
                    required
                    value={globeForm.name}
                    onChange={(e) => setGlobeForm({ ...globeForm, name: e.target.value })}
                    placeholder="e.g. Democratic Republic of the Congo"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">ISO Code *</label>
                  <input
                    type="text"
                    required
                    value={globeForm.code}
                    onChange={(e) => setGlobeForm({ ...globeForm, code: e.target.value })}
                    placeholder="e.g. CD"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Capital</label>
                  <input
                    type="text"
                    value={globeForm.capital}
                    onChange={(e) => setGlobeForm({ ...globeForm, capital: e.target.value })}
                    placeholder="e.g. Kinshasa"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Population</label>
                  <input
                    type="text"
                    value={globeForm.population}
                    onChange={(e) => setGlobeForm({ ...globeForm, population: e.target.value })}
                    placeholder="e.g. 99,010,000 people"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Continent & Region</label>
                  <input
                    type="text"
                    value={globeForm.region}
                    onChange={(e) => setGlobeForm({ ...globeForm, region: e.target.value })}
                    placeholder="e.g. Africa • Central Africa"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Total Area</label>
                  <input
                    type="text"
                    value={globeForm.area}
                    onChange={(e) => setGlobeForm({ ...globeForm, area: e.target.value })}
                    placeholder="e.g. 2,344,858 km²"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Languages</label>
                  <input
                    type="text"
                    value={globeForm.languages}
                    onChange={(e) => setGlobeForm({ ...globeForm, languages: e.target.value })}
                    placeholder="e.g. French, Lingala"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Wikipedia URL</label>
                  <input
                    type="url"
                    value={globeForm.wikiUrl}
                    onChange={(e) => setGlobeForm({ ...globeForm, wikiUrl: e.target.value })}
                    placeholder="https://en.wikipedia.org/wiki/..."
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={globeForm.lat}
                    onChange={(e) => setGlobeForm({ ...globeForm, lat: e.target.value })}
                    placeholder="e.g. -4.0383"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={globeForm.lng}
                    onChange={(e) => setGlobeForm({ ...globeForm, lng: e.target.value })}
                    placeholder="e.g. 21.7587"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Detailed Description (for Read More modal)</label>
                <textarea
                  rows={3}
                  value={globeForm.desc}
                  onChange={(e) => setGlobeForm({ ...globeForm, desc: e.target.value })}
                  placeholder="Enter comprehensive overview, geography, and history..."
                  className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-2xl text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-4 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing with Sheet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Country to Spreadsheet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Spreadsheet Inspector */}
          <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-geoYellow" />
                Live Spreadsheet Inspector ({Object.keys(liveCountries).length} Countries Loaded)
              </h3>
            </div>
            <p className="text-gray-400 text-xs mb-4">
              Below are the countries currently being read live from your published Google Sheet:
            </p>

            <div className="max-h-80 overflow-y-auto video-preview-scroll space-y-2 pr-2">
              {isLoadingGlobe ? (
                <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-geoCyan" />
                  <span>Loading live countries from Google Sheet...</span>
                </div>
              ) : (
                Object.values(liveCountries).map((c) => (
                  <div key={c.name} className="bg-black/40 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-geoCyan font-bold shrink-0">{c.code}</span>
                      <span className="font-extrabold text-white truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 shrink-0">
                      <span className="hidden sm:inline">Capital: <strong className="text-white">{c.capital}</strong></span>
                      <span className="font-mono text-[11px]">{c.lat.toFixed(2)}°, {c.lng.toFixed(2)}°</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MAP PINS FORM
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "videos" && (
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-geoCyan" />
            Add Map Video Pin
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Enter the parameters to plot a new documentary video onto the interactive map.
          </p>

          <form onSubmit={handleVideoSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                Location Name / Video Title <span className="text-geoCyan">*</span>
              </label>
              <input
                type="text"
                required
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="e.g. The Truth About the Ilemi Triangle"
                className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={videoForm.lat}
                  onChange={(e) => setVideoForm({ ...videoForm, lat: e.target.value })}
                  placeholder="e.g. 4.9000"
                  className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={videoForm.lng}
                  onChange={(e) => setVideoForm({ ...videoForm, lng: e.target.value })}
                  placeholder="e.g. 35.3000"
                  className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                YouTube Video ID <span className="text-geoCyan">*</span>
              </label>
              <input
                type="text"
                required
                value={videoForm.youtubeId}
                onChange={(e) => setVideoForm({ ...videoForm, youtubeId: e.target.value })}
                placeholder="e.g. 3Zp_vR6P6mI (from watch?v=...)"
                className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm font-mono shadow-inner"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                Description / Summary
              </label>
              <textarea
                rows={3}
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                placeholder="Short video summary..."
                className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-2xl transition-all placeholder-gray-500 text-sm shadow-inner"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-4 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Pin...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Map Pin</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TRIVIA GAME FORM
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "game" && (
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-geoYellow" />
            Add Trivia Question
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Add a single question or bulk import multiple questions to your trivia game database.
          </p>

          <div className="flex gap-2 bg-black/40 p-1 rounded-full border border-white/10 mb-6 w-fit">
            <button
              onClick={() => setGameMode("single")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === "single" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Single Question
            </button>
            <button
              onClick={() => setGameMode("bulk")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === "bulk" ? "bg-geoYellow text-gray-950 shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Bulk Import
            </button>
          </div>

          {gameMode === "single" ? (
            <form onSubmit={handleSingleGameSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Question Title / Prompt <span className="text-geoYellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleGameForm.title}
                  onChange={(e) => setSingleGameForm({ ...singleGameForm, title: e.target.value })}
                  placeholder="e.g. Which African country has the most pyramids?"
                  className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={singleGameForm.lat}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, lat: e.target.value })}
                    placeholder="e.g. 15.5000"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={singleGameForm.lng}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, lng: e.target.value })}
                    placeholder="e.g. 32.5000"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Correct Answer <span className="text-geoYellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleGameForm.correctAnswer}
                  onChange={(e) => setSingleGameForm({ ...singleGameForm, correctAnswer: e.target.value })}
                  placeholder="e.g. Sudan"
                  className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-geoYellow hover:bg-geoCyan text-gray-950 font-extrabold py-4 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Question...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Trivia Question</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Bulk CSV / JSON Data
                </label>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste question rows..."
                  className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-2xl transition-all placeholder-gray-500 font-mono text-xs shadow-inner"
                ></textarea>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
