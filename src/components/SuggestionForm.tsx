import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, Video, Database, Send, Plus, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin 
} from "lucide-react";
import { GAME_ADMIN_SCRIPT_URL } from "../data/gameDataSource";

export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<"videos" | "game">("videos");
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

  // Game Bulk State
  const [bulkText, setBulkText] = useState("");
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; log: string } | null>(null);

  // Status
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

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
          correctAnswer: singleGameForm.correctAnswer.trim()
        }),
      });

      setStatus("success");
      setFeedback("Trivia question successfully added to Game database!");
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

  // Process AI Bulk Questions (Supports Question:Lat:Lng:CorrectAnswer:Category:Region OR Question:CorrectAnswer:SearchPlace:Category:Region)
  const handleBulkSubmit = async () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(l => l.length > 0 && l.includes(":"));
    if (lines.length === 0) {
      setStatus("error");
      setFeedback("Please enter lines in the format: Question:Lat:Lng:CorrectAnswer:Category:Region or Question:Answer:SearchPlace:Category:Region");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    let successCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(":").map(p => p.trim());
      const question = parts[0] || "Geography Trivia";

      let lat = 0;
      let lng = 0;
      let answer = "";
      let category = "Mixed Global";
      let region = "Global";

      // Check if format is Question:Lat:Lng:CorrectAnswer:Category:Region
      if (parts.length >= 6 && !isNaN(parseFloat(parts[1])) && !isNaN(parseFloat(parts[2]))) {
        lat = parseFloat(parts[1]);
        lng = parseFloat(parts[2]);
        answer = parts[3] || "";
        category = parts[4] || "Mixed Global";
        region = parts[5] || "Global";
      } else {
        // Format: Question:Answer:SearchPlace:Category:Region
        answer = parts[1] || "";
        const searchPlace = parts[2] || answer;
        category = parts[3] || "Mixed Global";
        region = parts[4] || "Global";

        setBulkProgress({
          current: i + 1,
          total: lines.length,
          log: `Geocoding '${searchPlace}'...`
        });

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchPlace)}&limit=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          }
        } catch (geoErr) {
          console.warn(`Geocoding error for ${searchPlace}:`, geoErr);
        }
      }

      // Submit to Google Sheet Apps Script
      try {
        await fetch(GAME_ADMIN_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            title: question,
            lat: lat,
            lng: lng,
            correctAnswer: answer,
            category: category,
            region: region,
            youtubeId: ""
          }),
        });
        successCount++;
      } catch (submitErr) {
        console.warn("Row submit error:", submitErr);
      }

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setStatus("success");
    setFeedback(`Bulk import completed! Successfully processed and uploaded ${successCount} of ${lines.length} questions.`);
    setBulkProgress(null);
    setBulkText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto pb-20"
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
          Add new documentary video coordinates or populate game trivia questions.
        </p>
      </div>

      {/* Top Main Tab Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-8 bg-gray-900/60 p-2 rounded-3xl border border-white/5 backdrop-blur-xl">
        <button
          onClick={() => {
            setActiveTab("videos");
            setStatus("idle");
            setFeedback("");
          }}
          className={`py-3 px-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "videos"
              ? "bg-geoCyan text-gray-950 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          VIDEO & PINS
        </button>

        <button
          onClick={() => {
            setActiveTab("game");
            setStatus("idle");
            setFeedback("");
          }}
          className={`py-3 px-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          1. VIDEO & PINS FORM
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
          2. GAME DATA FORM (SINGLE vs AI BULK)
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
                <div className="p-4 bg-black/40 rounded-2xl border border-geoYellow/30 text-xs">
                  <div className="flex justify-between items-center mb-2 font-bold text-geoYellow">
                    <span>Processing {bulkProgress.current} / {bulkProgress.total}</span>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <p className="text-gray-400">{bulkProgress.log}</p>
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
