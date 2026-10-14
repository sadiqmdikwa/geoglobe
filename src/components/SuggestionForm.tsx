import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, Video, Database, Send, Plus, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin 
} from "lucide-react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxYhRfD4jSTFm1b_cAmPDtq_NYuNi0NxoqMN-ciY5VyJ2Idc8ojGqhyf6sJvFjxrzHsg/exec";

export default function SuggestionForm() {
  const [activeTab, setActiveTab] = useState<"videos" | "game">("videos");
  const [gameMode, setGameMode] = useState<"single" | "bulk">("single");

  // Video & Pins State
  const [videoForm, setVideoForm] = useState({
    title: "",
    lat: "",
    lng: "",
    youtubeId: ""
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
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: videoForm.title.trim(),
          lat: parseFloat(videoForm.lat) || 0,
          lng: parseFloat(videoForm.lng) || 0,
          youtubeId: videoForm.youtubeId.trim()
        }),
      });

      setStatus("success");
      setFeedback("Video location successfully submitted to Google Sheet!");
      setVideoForm({ title: "", lat: "", lng: "", youtubeId: "" });
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
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
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

  // Process AI Bulk Questions with Geocoding
  const handleBulkSubmit = async () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(l => l.length > 0 && l.includes(":"));
    if (lines.length === 0) {
      setStatus("error");
      setFeedback("Please enter lines in the format: Question:Answer:SearchPlace:Category:Region");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    let successCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(":").map(p => p.trim());
      const question = parts[0] || "Geography Trivia";
      const answer = parts[1] || "";
      const searchPlace = parts[2] || answer;
      const category = parts[3] || "Mixed Global";
      const region = parts[4] || "Global";

      setBulkProgress({
        current: i + 1,
        total: lines.length,
        log: `Geocoding '${searchPlace}'...`
      });

      let lat = 0;
      let lng = 0;

      // Geocode with Nominatim API (1000ms delay to adhere to rate limits)
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

      // Submit to Google Sheet Apps Script
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: question,
            lat: lat,
            lng: lng,
            correctAnswer: answer,
            category: category,
            region: region
          }),
        });
        successCount++;
      } catch (submitErr) {
        console.warn("Row submit error:", submitErr);
      }

      // 1000ms polite delay
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      <div className="grid grid-cols-2 gap-3 mb-8 bg-gray-900/60 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
        <button
          onClick={() => {
            setActiveTab("videos");
            setStatus("idle");
            setFeedback("");
          }}
          className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "videos"
              ? "bg-geoCyan text-gray-900 shadow-md"
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
          className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "game"
              ? "bg-geoYellow text-gray-900 shadow-md"
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
          1. VIDEO & PINS FORM (4 ESSENTIAL INPUTS)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "videos" && (
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-geoCyan" />
            Add Map Video Pin
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Enter the exact 4 parameters to plot a new documentary video onto the interactive map.
          </p>

          <form onSubmit={handleVideoSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                Location Name / Video Title <span className="text-geoCyan">*</span>
              </label>
              <input
                type="text"
                required
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="e.g. The Truth About the Ilemi Triangle"
                className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoCyan outline-none text-white p-3 rounded-2xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={videoForm.lat}
                  onChange={(e) => setVideoForm({ ...videoForm, lat: e.target.value })}
                  placeholder="e.g. 4.9000"
                  className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoCyan outline-none text-white p-3 rounded-2xl text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={videoForm.lng}
                  onChange={(e) => setVideoForm({ ...videoForm, lng: e.target.value })}
                  placeholder="e.g. 35.3000"
                  className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoCyan outline-none text-white p-3 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                YouTube Video ID <span className="text-geoCyan">*</span>
              </label>
              <input
                type="text"
                required
                value={videoForm.youtubeId}
                onChange={(e) => setVideoForm({ ...videoForm, youtubeId: e.target.value })}
                placeholder="e.g. 3Zp_vR6P6mI (from watch?v=...)"
                className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoCyan outline-none text-white p-3 rounded-2xl text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold py-3.5 rounded-2xl transition-all mt-4 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/10 shadow-2xl">
          {/* Sub-mode Toggle */}
          <div className="flex gap-2 p-1.5 bg-gray-900 rounded-xl mb-6 max-w-xs mx-auto">
            <button
              onClick={() => {
                setGameMode("single");
                setStatus("idle");
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                gameMode === "single"
                  ? "bg-geoYellow text-gray-900 shadow"
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
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                gameMode === "bulk"
                  ? "bg-geoYellow text-gray-900 shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI BULK
            </button>
          </div>

          {gameMode === "single" ? (
            <form onSubmit={handleSingleGameSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                  Question Prompt / Title <span className="text-geoYellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleGameForm.title}
                  onChange={(e) => setSingleGameForm({ ...singleGameForm, title: e.target.value })}
                  placeholder="e.g. Unclaimed desert territory between Egypt and Sudan"
                  className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                  Correct Answer (Official Name) <span className="text-geoYellow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={singleGameForm.correctAnswer}
                  onChange={(e) => setSingleGameForm({ ...singleGameForm, correctAnswer: e.target.value })}
                  placeholder="e.g. Bir Tawil"
                  className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                    Category
                  </label>
                  <select
                    value={singleGameForm.category}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, category: e.target.value })}
                    className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl text-sm cursor-pointer"
                  >
                    <option value="Borders">Borders</option>
                    <option value="Anomalies">Anomalies</option>
                    <option value="Flags">Flags</option>
                    <option value="Mixed Global">Mixed Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                    Region
                  </label>
                  <select
                    value={singleGameForm.region}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, region: e.target.value })}
                    className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl text-sm cursor-pointer"
                  >
                    <option value="Global">Global</option>
                    <option value="Africa">Africa</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Americas">Americas</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={singleGameForm.lat}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, lat: e.target.value })}
                    placeholder="e.g. 21.8706"
                    className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs font-semibold mb-1 ml-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={singleGameForm.lng}
                    onChange={(e) => setSingleGameForm({ ...singleGameForm, lng: e.target.value })}
                    placeholder="e.g. 33.7342"
                    className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-geoYellow hover:bg-geoCyan text-gray-900 font-bold py-3.5 rounded-2xl transition-all mt-4 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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
            <div className="space-y-4">
              <div className="bg-gray-900/80 p-4 rounded-2xl border border-white/5 text-xs text-gray-300 space-y-1">
                <p className="font-bold text-geoYellow">AI Bulk Syntax Format (1 question per line):</p>
                <p className="font-mono text-gray-400">Question:Answer:SearchPlace:Category:Region</p>
                <p className="text-gray-400 mt-1">
                  Example: <code>Unclaimed desert trapezoid:Bir Tawil:Bir Tawil:Anomalies:Africa</code>
                </p>
              </div>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Unclaimed desert trapezoid:Bir Tawil:Bir Tawil:Anomalies:Africa&#10;Belgian enclave town in Netherlands:Baarle-Hertog:Baarle-Hertog:Borders:Europe"
                className="w-full bg-gray-900 border-2 border-gray-700/80 focus:border-geoYellow outline-none text-white p-3 rounded-2xl font-mono text-xs md:text-sm leading-relaxed resize-none"
              ></textarea>

              {bulkProgress && (
                <div className="p-4 bg-gray-900 rounded-2xl border border-geoYellow/30 text-xs">
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
                className="w-full bg-geoYellow hover:bg-geoCyan text-gray-900 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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
