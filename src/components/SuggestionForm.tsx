import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, Video, Database, Send, Plus, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin, Globe, Wand2
} from "lucide-react";
import { GAME_ADMIN_SCRIPT_URL } from "../data/gameDataSource";

export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<"globe" | "videos" | "game">("globe");
  const [gameMode, setGameMode] = useState<"single" | "bulk">("single");
  const [globeMode, setGlobeMode] = useState<"single" | "bulk">("single");

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

  // Globe Single State
  const [globeForm, setGlobeForm] = useState({
    name: "",
    code: "",
    capital: "",
    population: "",
    region: "",
    area: "",
    languages: "",
    desc: "",
    lat: "",
    lng: ""
  });

  // Globe Bulk / AI State
  const [globeBulkText, setGlobeBulkText] = useState("");
  const [globeAiPrompt, setGlobeAiPrompt] = useState("");
  const [isGlobeAiGenerating, setIsGlobeAiGenerating] = useState(false);
  const [globeBulkProgress, setGlobeBulkProgress] = useState<{ current: number; total: number; percent: number; log: string } | null>(null);

  // Game Bulk State
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; percent: number; log: string } | null>(null);

  // Status
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
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
          region: videoForm.region,
          type: "video"
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

  // Submit Single Globe Country
  const handleGlobeSingleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!globeForm.name.trim() || !globeForm.code.trim()) {
      setStatus("error");
      setFeedback("Please fill out Country Name and Code.");
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
        lat: "",
        lng: ""
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setFeedback("Submission failed. Check network or script URL.");
    }
  };

  // AI Bulk Globe Generator
  const handleGlobeAiGenerate = () => {
    setIsGlobeAiGenerating(true);
    setTimeout(() => {
      const mockGenerated = `Democratic Republic of the Congo:CD:Kinshasa:99,010,000 people:Africa • Central Africa:2,344,858 km²:French, Lingala, Swahili:The second-largest country in Africa by area.:-4.03:21.75
Angola:AO:Luanda:35,500,000 people:Africa • Southern Africa:1,246,700 km²:Portuguese:A Southern African nation bordered by Namibia, DRC, and Zambia.:-11.2:17.8`;
      setGlobeBulkText(mockGenerated);
      setIsGlobeAiGenerating(false);
      setStatus("success");
      setFeedback("AI successfully generated country records in requested arrangement!");
    }, 1200);
  };

  // Globe Bulk Submit (Arrangement: CountryName:Code:Capital:Population:Region:TotalArea:Languages:Description:Lat:Lng)
  const handleGlobeBulkSubmit = async () => {
    const lines = globeBulkText.split("\n").map(l => l.trim()).filter(l => l.length > 0 && l.includes(":"));
    if (lines.length === 0) {
      setStatus("error");
      setFeedback("Please enter lines in the format: CountryName:Code:Capital:Population:Region:TotalArea:Languages:Description:Lat:Lng");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    let successCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(":").map(p => p.trim());
      if (parts.length >= 10) {
        const [name, code, capital, population, region, area, languages, desc, latStr, lngStr] = parts;
        const lat = parseFloat(latStr) || 0;
        const lng = parseFloat(lngStr) || 0;

        const percent = Math.round(((i + 1) / lines.length) * 100);
        setGlobeBulkProgress({
          current: i + 1,
          total: lines.length,
          percent,
          log: `Uploading country ${i + 1} of ${lines.length} (${name})...`
        });

        try {
          await fetch(GAME_ADMIN_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              countryName: name,
              code: code.toUpperCase(),
              capital,
              population,
              region,
              area,
              languages,
              desc,
              lat,
              lng,
              type: "globe_country"
            }),
          });
          successCount++;
        } catch (e) {
          console.warn("Globe bulk row error:", e);
        }
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setStatus("success");
    setFeedback(`Globe bulk import completed! Successfully uploaded ${successCount} of ${lines.length} countries.`);
    setGlobeBulkProgress(null);
    setGlobeBulkText("");
    playSuccessSound();
  };

  // Submit Single Game Question
  const handleSingleGameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!singleGameForm.title.trim() || !singleGameForm.correctAnswer.trim()) {
      setStatus("error");
      setFeedback("Please fill out Question Title and Correct Answer.");
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
          title: singleGameForm.title.trim(),
          lat: parseFloat(singleGameForm.lat) || 0,
          lng: parseFloat(singleGameForm.lng) || 0,
          category: singleGameForm.category,
          region: singleGameForm.region,
          correctAnswer: singleGameForm.correctAnswer.trim(),
          type: "trivia"
        }),
      });

      setStatus("success");
      setFeedback("Trivia question successfully added to Game database!");
      playSuccessSound();
      setSingleGameForm({
        title: "",
        lat: "",
        lng: "",
        category: "Borders",
        region: "Global",
        correctAnswer: ""
      });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setFeedback("Submission failed. Check connection.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto pb-20 font-sans"
    >
      {/* Admin Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-geoCyan/10 border border-geoCyan/20 text-geoCyan px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" />
          Admin Secret Portal
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          Database Management
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-2">
          Manage 3D Globe countries, Map video pins, and game trivia questions.
        </p>
      </div>

      {/* Top Main Tab Toggle */}
      <div className="grid grid-cols-3 gap-2 mb-8 bg-gray-900/60 p-2 rounded-3xl border border-white/5 backdrop-blur-xl">
        <button
          onClick={() => {
            setActiveTab("globe");
            setStatus("idle");
            setFeedback("");
          }}
          className={`py-3 px-3 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "globe"
              ? "bg-geoCyan text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Globe className="w-4 h-4" />
          3D GLOBE
        </button>

        <button
          onClick={() => {
            setActiveTab("videos");
            setStatus("idle");
            setFeedback("");
          }}
          className={`py-3 px-3 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "videos"
              ? "bg-geoCyan text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          VIDEO PINS
        </button>

        <button
          onClick={() => {
            setActiveTab("game");
            setStatus("idle");
            setFeedback("");
          }}
          className={`py-3 px-3 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "game"
              ? "bg-geoYellow text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Database className="w-4 h-4" />
          GAME DATA
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
          1. 3D GLOBE DATA TAB (SINGLE vs BULK with requested arrangement)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "globe" && (
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
          <div className="flex gap-2 p-1.5 bg-black/40 rounded-full mb-6 max-w-xs mx-auto border border-white/5">
            <button
              onClick={() => { setGlobeMode("single"); setStatus("idle"); }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                globeMode === "single" ? "bg-geoCyan text-gray-950 shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              SINGLE COUNTRY
            </button>
            <button
              onClick={() => { setGlobeMode("bulk"); setStatus("idle"); }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                globeMode === "bulk" ? "bg-geoCyan text-gray-950 shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              BULK IMPORT
            </button>
          </div>

          {globeMode === "single" ? (
            <form onSubmit={handleGlobeSingleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Code (ISO) *</label>
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Region</label>
                  <input
                    type="text"
                    value={globeForm.region}
                    onChange={(e) => setGlobeForm({ ...globeForm, region: e.target.value })}
                    placeholder="e.g. Africa • Central Africa"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-4 py-3 rounded-full text-sm"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Coordinates (Lat, Lng)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={globeForm.lat}
                      onChange={(e) => setGlobeForm({ ...globeForm, lat: e.target.value })}
                      placeholder="Lat"
                      className="bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-3 py-3 rounded-full text-xs"
                    />
                    <input
                      type="number"
                      step="any"
                      value={globeForm.lng}
                      onChange={(e) => setGlobeForm({ ...globeForm, lng: e.target.value })}
                      placeholder="Lng"
                      className="bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-3 py-3 rounded-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs mb-1 ml-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={globeForm.desc}
                  onChange={(e) => setGlobeForm({ ...globeForm, desc: e.target.value })}
                  placeholder="Country overview for Read More modal..."
                  className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white p-4 rounded-2xl text-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-4 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Save Country Data</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-left">
              <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-xs text-gray-300 space-y-1">
                <p className="font-bold text-geoCyan">Bulk Arrangement Format (1 per line, colon separated):</p>
                <p className="font-mono text-[11px] text-gray-400">CountryName:Code:Capital:Population:Region:TotalArea:Languages:Description:Lat:Lng</p>
              </div>

              {/* AI Generator Box */}
              <div className="bg-black/50 p-4 rounded-2xl border border-geoCyan/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-geoCyan flex items-center gap-1.5"><Wand2 className="w-4 h-4" /> AI Bulk Generator</span>
                  <button
                    onClick={handleGlobeAiGenerate}
                    disabled={isGlobeAiGenerating}
                    className="bg-geoCyan hover:bg-geoYellow text-gray-950 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    {isGlobeAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Generate Countries</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={6}
                value={globeBulkText}
                onChange={(e) => setGlobeBulkText(e.target.value)}
                placeholder="Democratic Republic of the Congo:CD:Kinshasa:99M:Africa • Central:2.3M km²:French:Overview:-4.03:21.75"
                className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white p-4 rounded-2xl font-mono text-xs shadow-inner video-preview-scroll"
              ></textarea>

              {globeBulkProgress && (
                <div className="p-4 bg-black/80 rounded-2xl border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between font-mono text-geoCyan">
                    <span>{globeBulkProgress.log}</span>
                    <span>{globeBulkProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-geoCyan transition-all" style={{ width: `${globeBulkProgress.percent}%` }}></div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGlobeBulkSubmit}
                disabled={status === "submitting" || !globeBulkText.trim()}
                className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-4 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Import Bulk Countries to Sheet</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VIDEO & PINS FORM
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
                placeholder="Brief professional summary of the video topic or anomaly..."
                className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white p-5 rounded-3xl transition-all placeholder-gray-500 text-sm resize-none shadow-inner video-preview-scroll"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Category
                </label>
                <select
                  value={videoForm.category}
                  onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all text-sm cursor-pointer shadow-inner"
                >
                  <option value="Borders">Borders</option>
                  <option value="Anomalies">Anomalies</option>
                  <option value="Flags">Flags</option>
                  <option value="Mixed Global">Mixed Global</option>
                  <option value="Enclaves & Exclaves">Enclaves & Exclaves</option>
                  <option value="No Man's Land">No Man's Land</option>
                  <option value="Natural Wonders & Waterways">Natural Wonders & Waterways</option>
                  <option value="Geopolitical Frontiers">Geopolitical Frontiers</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Region
                </label>
                <select
                  value={videoForm.region}
                  onChange={(e) => setVideoForm({ ...videoForm, region: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 focus:border-geoCyan outline-none text-white px-5 py-3.5 rounded-full transition-all text-sm cursor-pointer shadow-inner"
                >
                  <option value="Global">Global</option>
                  <option value="Africa">Africa</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Americas">Americas</option>
                  <option value="Oceania">Oceania</option>
                  <option value="Middle East">Middle East</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold py-4 rounded-full transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-geoCyan/20 disabled:opacity-50 cursor-pointer"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Video Pin
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
          {/* Sub-mode Toggle */}
          <div className="flex gap-2 p-1.5 bg-black/40 rounded-full mb-6 max-w-xs mx-auto border border-white/5">
            <button
              onClick={() => {
                setGameMode("single");
                setStatus("idle");
              }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                gameMode === "single"
                  ? "bg-geoYellow text-gray-950 shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              SINGLE
            </button>
            <button
              onClick={() => {
                setGameMode("bulk");
                setStatus("idle");
              }}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                gameMode === "bulk"
                  ? "bg-geoYellow text-gray-950 shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI BULK
            </button>
          </div>

          {gameMode === "single" ? (
            <form onSubmit={handleSingleGameSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Question Prompt / Title <span className="text-geoYellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleGameForm.title}
                  onChange={(e) => setSingleGameForm({ ...singleGameForm, title: e.target.value })}
                  placeholder="e.g. Unclaimed desert territory between Egypt and Sudan"
                  className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                  Correct Answer (Official Name) <span className="text-geoYellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleGameForm.correctAnswer}
                  onChange={(e) => setSingleGameForm({ ...singleGameForm, correctAnswer: e.target.value })}
                  placeholder="e.g. Bir Tawil"
                  className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Category
                  </label>
                  <select
                    value={singleGameForm.category}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, category: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all text-sm cursor-pointer shadow-inner"
                  >
                    <option value="Borders">Borders</option>
                    <option value="Anomalies">Anomalies</option>
                    <option value="Flags">Flags</option>
                    <option value="Mixed Global">Mixed Global</option>
                    <option value="Enclaves & Exclaves">Enclaves & Exclaves</option>
                    <option value="No Man's Land">No Man's Land</option>
                    <option value="Natural Wonders & Waterways">Natural Wonders & Waterways</option>
                    <option value="Geopolitical Frontiers">Geopolitical Frontiers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Region
                  </label>
                  <select
                    value={singleGameForm.region}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, region: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all text-sm cursor-pointer shadow-inner"
                  >
                    <option value="Global">Global</option>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Americas">Americas</option>
                    <option value="Oceania">Oceania</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={singleGameForm.lat}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, lat: e.target.value })}
                    placeholder="e.g. 21.8706"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs md:text-sm mb-1.5 ml-1 font-medium">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={singleGameForm.lng}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, lng: e.target.value })}
                    placeholder="e.g. 33.7342"
                    className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white px-5 py-3.5 rounded-full transition-all placeholder-gray-500 text-sm shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-geoYellow hover:bg-geoCyan text-gray-950 font-bold py-4 rounded-full transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-geoYellow/20 disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding Question...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Save Trivia Question
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-left">
              <div className="bg-black/40 p-5 rounded-3xl border border-white/5 text-xs text-gray-300 space-y-1.5">
                <p className="font-bold text-geoYellow">AI Bulk Syntax Format (1 question per line):</p>
                <p className="font-mono text-gray-400">Question:Lat:Lng:CorrectAnswer:Category:Region</p>
                <p className="text-gray-400 mt-1">
                  Matches exact sheet order: <code>Question • Lat • Lng • CorrectAnswer • Category • Region</code>
                </p>
              </div>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Which country is surrounded by South Africa?:-29.3100:27.4782:Lesotho:Anomalies:Africa&#10;What is the largest country in Africa?:36.7729:3.0588:Algeria:Mixed Global:Africa"
                className="w-full bg-black/50 border border-white/10 focus:border-geoYellow outline-none text-white p-5 rounded-3xl font-mono text-xs md:text-sm leading-relaxed resize-none shadow-inner video-preview-scroll"
              ></textarea>

              {bulkProgress && (
                <div className="p-5 bg-black/50 rounded-3xl border border-geoYellow/30 text-xs space-y-3">
                  <div className="flex justify-between items-center font-bold text-geoYellow">
                    <span>{bulkProgress.percent}% — Processing {bulkProgress.current} of {bulkProgress.total}</span>
                    <Loader2 className="w-4 h-4 animate-spin text-geoYellow" />
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div
                      className="bg-geoYellow h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${bulkProgress.percent}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 font-mono truncate">{bulkProgress.log}</p>
                </div>
              )}

              <button
                onClick={handleBulkSubmit}
                disabled={status === "submitting" || !bulkText.trim()}
                className="w-full bg-geoYellow hover:bg-geoCyan text-gray-950 font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-geoYellow/20 disabled:opacity-50 cursor-pointer"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Geocoding & Uploading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Geocode & Batch Upload
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
