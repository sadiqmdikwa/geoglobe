here is the game "import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Trophy, Globe2, Flag, Map, MapPin, Loader2, Play, RotateCcw, ChevronLeft, Eye } from "lucide-react";

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

function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

export default function GeoGame() {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<Question[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState<GameStep>('main_cat');
  const [mainCat, setMainCat] = useState("");
  const [subCat, setSubCat] = useState("Global");
  const [gameLength, setGameLength] = useState<number | 'unlimited'>(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<"playing" | "revealed">("playing");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?gid=1141935128&single=true&output=csv";

  // 1. INITIAL LOAD & RESTORE SESSION
  useEffect(() => {
    const initGame = async () => {
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

        // Check for saved mission in progress
        const saved = localStorage.getItem("geoglobe_active_mission");
        if (saved) {
          const data = JSON.parse(saved);
          if (data.questions && data.questions.length > 0) {
            setShuffledQuestions(data.questions);
            setCurrentIndex(data.index);
            setScore(data.score);
            setWrongCount(data.wrong);
            setMainCat(data.mainCat);
            setSubCat(data.subCat);
            setGameLength(data.gameLength);
            setStep('playing');
          }
        }
      } catch (e) {
        console.error("Data Load Error:", e);
      } finally {
        setLoading(false);
      }
    };
    initGame();
  }, []);

  // 2. PERSISTENCE ENGINE (Saves state whenever user makes progress)
  useEffect(() => {
    if (step === 'playing' && shuffledQuestions.length > 0) {
      const sessionData = {
        questions: shuffledQuestions,
        index: currentIndex,
        score: score,
        wrong: wrongCount,
        mainCat,
        subCat,
        gameLength
      };
      localStorage.setItem("geoglobe_active_mission", JSON.stringify(sessionData));
    }
  }, [currentIndex, score, wrongCount, step, shuffledQuestions]);

  const handleBack = () => {
    if (step === 'sub_cat') setStep('main_cat');
    else if (step === 'settings') setStep('sub_cat');
    else if (step === 'playing') {
      if (window.confirm("Abort mission? Progress will be lost.")) {
        localStorage.removeItem("geoglobe_active_mission");
        setStep('main_cat');
      }
    } else {
      navigate('/');
    }
  };

  const prepareGame = () => {
    let pool = [...allData];
    if (mainCat !== "Mixed Global") pool = pool.filter(q => q.category === mainCat);
    if (subCat !== "Global") pool = pool.filter(q => q.region === subCat);
    
    if (pool.length === 0) return alert("Insufficient data for this combination!");

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = gameLength === 'unlimited' ? shuffled : shuffled.slice(0, gameLength as number);
    
    // Clear old storage for new game
    localStorage.removeItem("geoglobe_active_mission");
    
    setShuffledQuestions(selected);
    setCurrentIndex(0); 
    setScore(0); 
    setWrongCount(0); 
    setStep('playing');
    setGameState("playing");
  };

  const handleCheck = () => {
    if (gameState === "revealed") { nextQuestion(); return; }
    const current = shuffledQuestions[currentIndex];
    const guess = userInput.trim().toLowerCase();
    const target = current.name.toLowerCase();
    
    const isMatch = guess === target || getLevenshteinDistance(guess, target) <= 2;

    if (isMatch) { 
      setScore(s => s + 1); 
      setIsCorrect(true); 
    } else { 
      setWrongCount(w => w + 1); 
      setIsCorrect(false); 
    }
    setGameState("revealed");
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setGameState("playing");
      setIsCorrect(null);
    } else {
      localStorage.removeItem("geoglobe_active_mission");
      setStep('results');
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-geoCyan w-12 h-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 min-h-[70vh] flex flex-col justify-center">
      {step !== 'results' && (
        <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-geoCyan mb-8 transition-colors group font-bold uppercase tracking-widest text-xs">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step === 'playing' ? 'Abort Mission' : 'Back'}
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 'main_cat' && (
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white italic tracking-tighter uppercase">Intelligence Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Mixed Global", "Flags", "Borders", "Anomalies"].map(cat => (
                <button key={cat} onClick={() => { setMainCat(cat); setStep('sub_cat'); }} className="p-8 bg-gray-900/50 border border-white/5 rounded-[2.5rem] text-left hover:border-geoCyan hover:bg-geoCyan/5 transition-all group backdrop-blur-md shadow-2xl">
                  <h3 className="text-2xl font-bold text-geoCyan group-hover:text-white transition-colors">{cat}</h3>
                  <p className="text-gray-500 text-sm mt-2">Initialize {cat} protocols.</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'sub_cat' && (
          <motion.div key="sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white italic uppercase tracking-tighter">Operational Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map(reg => (
                <button key={reg} onClick={() => { setSubCat(reg); setStep('settings'); }} className="p-6 bg-gray-900/50 border border-white/5 rounded-3xl hover:bg-geoCyan hover:text-black font-bold transition-all uppercase tracking-widest text-xs shadow-lg">
                  {reg}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div key="set" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mission Scale</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[5, 10, 'unlimited'].map(len => (
                <button key={len} onClick={() => setGameLength(len as any)} className={`px-10 py-5 rounded-2xl font-black border-2 transition-all ${gameLength === len ? 'border-geoCyan text-geoCyan bg-geoCyan/10 shadow-[0_0_20px_rgba(0,255,255,0.1)]' : 'border-white/10 text-gray-500'}`}>
                  {len.toString().toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={prepareGame} className="bg-geoCyan text-black px-16 py-6 rounded-[2rem] font-black text-xl hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:scale-105 transition-all flex items-center gap-3 mx-auto uppercase tracking-tighter">
              Launch Session
            </button>
          </motion.div>
        )}

        {step === 'playing' && shuffledQuestions.length > 0 && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 px-4 font-mono text-[10px] tracking-widest text-gray-500 uppercase">
              <span className="bg-white/5 px-3 py-1 rounded-full">{mainCat} // {subCat}</span>
              <div className="flex gap-4">
                <span className="text-green-500 font-bold">✓ {score}</span>
                <span className="text-red-500 font-bold">✗ {wrongCount}</span>
              </div>
            </div>
            <div className="bg-gray-900/90 border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative backdrop-blur-2xl">
                {mainCat === "Flags" && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full aspect-video flex items-center justify-center mb-10 bg-black/40 rounded-[2.5rem] overflow-hidden shadow-inner border border-white/5">
                      <img src={`https://flagcdn.com/w640/${shuffledQuestions[currentIndex].countryCode}.png`} className="h-32 md:h-44 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
                    </motion.div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-10 leading-snug tracking-tight px-2">
                  {shuffledQuestions[currentIndex].clue}
                </h3>
                
                <div className="relative group">
                  <input ref={inputRef} value={userInput} onChange={e => setUserInput(e.target.value)} disabled={gameState === "revealed"} placeholder="ENTER IDENTITY..." className="w-full p-6 bg-black/60 border-2 border-white/5 rounded-3xl text-white text-center text-xl font-black focus:border-geoCyan/50 outline-none mb-6 transition-all tracking-widest shadow-inner group-hover:border-white/10" onKeyDown={e => e.key === 'Enter' && handleCheck()} />
                </div>
                
                <AnimatePresence>
                {gameState === "revealed" && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`p-8 rounded-3xl mb-8 text-center border-2 ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <p className="font-black uppercase tracking-[0.2em] mb-4 text-sm">{isCorrect ? '✓ Verification Success' : `⚠ Data Match: ${shuffledQuestions[currentIndex].name.toUpperCase()}`}</p>
                        <button onClick={() => navigate(`/preview-map?lat=${shuffledQuestions[currentIndex].lat}&lng=${shuffledQuestions[currentIndex].lng}`)} className="mx-auto flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-geoCyan transition-colors bg-white/5 px-6 py-3 rounded-full hover:bg-white/10">
                          <MapPin size={14} className="text-geoCyan" /> Scan Satellite Data
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="flex gap-4">
                  <button onClick={handleCheck} className="flex-grow py-6 bg-geoCyan text-black font-black text-xl rounded-2xl hover:bg-white transition-all shadow-[0_10px_20px_rgba(0,255,255,0.15)] active:scale-95 uppercase italic tracking-tighter">
                      {gameState === "revealed" ? "Next Sector" : "Finalize"}
                  </button>
                  {gameState === "playing" && (
                    <button onClick={() => { setIsCorrect(false); setGameState("revealed"); }} className="px-8 bg-white/5 text-gray-500 rounded-2xl hover:text-geoCyan hover:bg-white/10 transition-all border border-white/5 group" title="Reveal Answer">
                      <Eye size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
            <div className="relative inline-block">
              <Trophy className="w-28 h-28 text-geoYellow mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]" />
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-geoYellow/20 rounded-full" />
            </div>
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Mission Accomplished</h2>
            <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto font-mono">
                <div className="bg-gray-900 p-8 rounded-[2rem] border-2 border-green-500/20 shadow-lg"><p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Confirmed</p><p className="text-5xl font-black text-green-500">{score}</p></div>
                <div className="bg-gray-900 p-8 rounded-[2rem] border-2 border-red-500/20 shadow-lg"><p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Errors</p><p className="text-5xl font-black text-red-500">{wrongCount}</p></div>
            </div>
            <button onClick={() => setStep('main_cat')} className="bg-white text-black font-black px-16 py-6 rounded-[2rem] hover:bg-geoCyan transition-all shadow-xl uppercase italic tracking-tighter hover:scale-105">
                New Mission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}"
