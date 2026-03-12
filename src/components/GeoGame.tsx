import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowRight, Globe2, Flag, Map, MapPin, Loader2, Play, Settings2, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  name: string;
  clue: string;
  lat: number;
  lng: number;
  category: string;
  region: string;
  countryCode: string;
}

type GameStep = 'main_cat' | 'sub_cat' | 'settings' | 'playing' | 'results';

export default function GeoGame() {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<Question[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  
  // Navigation & State
  const [step, setStep] = useState<GameStep>('main_cat');
  const [mainCat, setMainCat] = useState("");
  const [subCat, setSubCat] = useState("Global");
  const [gameLength, setGameLength] = useState<number | 'unlimited'>(10);
  
  // Game Logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<"playing" | "revealed">("playing");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=1141935128&single=true&output=csv";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        const parsed = rows.map((row, index) => {
          const cols = row.split(',');
          if (cols.length < 6) return null;
          const countryName = cols[5]?.replace(/"/g, "").trim() || "";
          return {
            id: index.toString(),
            clue: cols[1]?.replace(/"/g, ""), 
            lat: parseFloat(cols[2]) || 0,
            lng: parseFloat(cols[3]) || 0,
            name: countryName, 
            category: cols[6]?.replace(/"/g, "").trim() || "General",
            region: cols[7]?.replace(/"/g, "").trim() || "Global",
            countryCode: countryName.substring(0,2).toLowerCase() 
          };
        }).filter(q => q !== null) as Question[];
        setAllData(parsed);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const prepareGame = () => {
    let pool = [...allData];
    
    // Filter by Main Category
    if (mainCat !== "Mixed Global") {
        pool = pool.filter(q => q.category === mainCat);
    }
    
    // Filter by Sub Category (Region)
    if (subCat !== "Global") {
        pool = pool.filter(q => q.region === subCat);
    }

    if (pool.length === 0) {
        alert("Insufficient data for this combination. Try another!");
        return;
    }

    const shuffled = pool.sort(() => Math.random() - 0.5);
    setShuffledQuestions(gameLength === 'unlimited' ? shuffled : shuffled.slice(0, gameLength));
    setCurrentIndex(0);
    setScore(0);
    setWrongCount(0);
    setStep('playing');
  };

  const handleCheck = () => {
    if (gameState === "revealed") { nextQuestion(); return; }
    const current = shuffledQuestions[currentIndex];
    const isMatch = userInput.trim().toLowerCase() === current.name.toLowerCase();

    if (isMatch) { setScore(s => s + 1); setIsCorrect(true); } 
    else { setWrongCount(w => w + 1); setIsCorrect(false); }
    setGameState("revealed");
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setGameState("playing");
    } else {
      setStep('results');
    }
  };

  const handleTeleport = () => {
    const current = shuffledQuestions[currentIndex];
    navigate(`/preview-map?lat=${current.lat}&lng=${current.lng}`);
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-screen"><Loader2 className="animate-spin text-geoCyan w-12 h-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 min-h-[600px] flex flex-col justify-center">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: MAIN CATEGORY */}
        {step === 'main_cat' && (
          <motion.div key="main" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white uppercase italic tracking-tighter">Choose Your Intelligence Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Mixed Global", "Flags", "Borders", "Anomalies"].map(cat => (
                <button key={cat} onClick={() => { setMainCat(cat); setStep('sub_cat'); }} className="p-8 bg-gray-900 border border-white/5 rounded-3xl text-left hover:border-geoCyan transition-all group">
                  <h3 className="text-2xl font-bold text-geoCyan group-hover:text-white">{cat}</h3>
                  <p className="text-gray-500">Engage mission protocols for {cat}.</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: SUB CATEGORY (REGION) */}
        {step === 'sub_cat' && (
          <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white uppercase italic">Select Targeted Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map(reg => (
                <button key={reg} onClick={() => { setSubCat(reg); setStep('settings'); }} className="p-6 bg-gray-900 border border-white/5 rounded-2xl hover:bg-geoCyan hover:text-black font-bold transition-all uppercase tracking-widest text-sm">
                  {reg}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: SETTINGS (LENGTH) */}
        {step === 'settings' && (
          <motion.div key="set" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-10">
            <h2 className="text-4xl font-black text-white uppercase italic">Mission Parameters</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[5, 10, 'unlimited'].map(len => (
                <button key={len} onClick={() => setGameLength(len as any)} className={`px-10 py-5 rounded-2xl font-black border-2 transition-all ${gameLength === len ? 'border-geoCyan text-geoCyan' : 'border-white/10 text-gray-500'}`}>
                  {len.toString().toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={prepareGame} className="bg-geoCyan text-black px-16 py-6 rounded-3xl font-black text-xl hover:scale-110 transition-all flex items-center gap-3 mx-auto">
              <Play fill="black" /> START MISSION
            </button>
          </motion.div>
        )}

        {/* STEP 4: PLAYING */}
        {step === 'playing' && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 px-4">
                <div className="text-xs font-mono text-gray-500">TRACKING: {mainCat} | {subCat}</div>
                <div className="flex gap-4 font-black">
                    <span className="text-green-500">✓ {score}</span>
                    <span className="text-red-500">✗ {wrongCount}</span>
                </div>
            </div>
            <div className="bg-gray-900 border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl relative">
                {mainCat === "Flags" && (
                    <div className="w-full aspect-video flex items-center justify-center mb-8 bg-black/20 rounded-3xl"><img src={`https://flagcdn.com/w640/${shuffledQuestions[currentIndex].countryCode}.png`} className="h-32 md:h-44 object-contain" /></div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-10">{shuffledQuestions[currentIndex].clue}</h3>
                <input ref={inputRef} value={userInput} onChange={e => setUserInput(e.target.value)} disabled={gameState === "revealed"} placeholder="ENTER IDENTITY..." className="w-full p-6 bg-black/40 border-2 border-white/5 rounded-2xl text-white text-center text-xl font-black focus:border-geoCyan outline-none tracking-widest mb-6" onKeyDown={e => e.key === 'Enter' && handleCheck()} />
                
                {gameState === "revealed" && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`p-6 rounded-2xl mb-6 text-center border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <p className="font-black text-lg mb-4 uppercase tracking-tighter">{isCorrect ? 'Target Confirmed' : `Verification Failure: ${shuffledQuestions[currentIndex].name}`}</p>
                        <button onClick={handleTeleport} className="mx-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"><MapPin size={14} /> Teleport to Map</button>
                    </motion.div>
                )}

                <button onClick={handleCheck} className="w-full py-6 bg-geoCyan text-black font-black text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all">
                    {gameState === "revealed" ? "CONTINUE" : "SUBMIT"}
                </button>
                
                {gameLength === 'unlimited' && (
                    <button onClick={() => setStep('results')} className="w-full mt-4 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Abort Mission & See Results</button>
                )}
            </div>
          </motion.div>
        )}

        {/* STEP 5: RESULTS */}
        {step === 'results' && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <Trophy className="w-24 h-24 text-geoYellow mx-auto" />
            <h2 className="text-5xl font-black text-white uppercase italic">Debriefing Complete</h2>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                <div className="bg-gray-900 p-6 rounded-2xl border border-green-500/20"><p className="text-xs text-gray-500 mb-1">ACCURATE</p><p className="text-3xl font-black text-green-500">{score}</p></div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-red-500/20"><p className="text-xs text-gray-500 mb-1">INCORRECT</p><p className="text-3xl font-black text-red-500">{wrongCount}</p></div>
            </div>
            <div className="flex gap-4 justify-center pt-8">
                <button onClick={() => setStep('main_cat')} className="flex items-center gap-2 bg-white text-black font-black px-8 py-4 rounded-xl hover:bg-geoCyan transition-all"><RotateCcw size={18} /> NEW SESSION</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
