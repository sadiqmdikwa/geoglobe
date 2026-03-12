import { useState, useEffect, useRef } from "react";
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

  // 1. IMPROVED PERSISTENCE RECOVERY
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
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    initGame();
  }, []);

  // 2. MISSION AUTO-SAVE
  useEffect(() => {
    if (step === 'playing' && shuffledQuestions.length > 0) {
      const sessionData = {
        questions: shuffledQuestions, index: currentIndex, score, wrong: wrongCount, mainCat, subCat, gameLength
      };
      localStorage.setItem("geoglobe_active_mission", JSON.stringify(sessionData));
    }
  }, [currentIndex, score, wrongCount, step, shuffledQuestions]);

  const handleBack = () => {
    if (step === 'sub_cat') setStep('main_cat');
    else if (step === 'settings') setStep('sub_cat');
    else if (step === 'playing') {
      if (window.confirm("Abort current mission? Progress will be lost.")) {
        localStorage.removeItem("geoglobe_active_mission");
        setStep('main_cat');
      }
    } else navigate('/');
  };

  const prepareGame = () => {
    let pool = [...allData];
    if (mainCat !== "Mixed Global") pool = pool.filter(q => q.category === mainCat);
    if (subCat !== "Global") pool = pool.filter(q => q.region === subCat);
    if (pool.length === 0) return alert("Insufficient data!");

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = gameLength === 'unlimited' ? shuffled : shuffled.slice(0, gameLength as number);
    localStorage.removeItem("geoglobe_active_mission");
    setShuffledQuestions(selected);
    setCurrentIndex(0); setScore(0); setWrongCount(0); setStep('playing');
    setGameState("playing");
  };

  const handleCheck = () => {
    if (gameState === "revealed") { nextQuestion(); return; }
    const current = shuffledQuestions[currentIndex];
    const guess = userInput.trim().toLowerCase();
    const target = current.name.toLowerCase();
    const isMatch = guess === target || getLevenshteinDistance(guess, target) <= 2;

    if (isMatch) { setScore(s => s + 1); setIsCorrect(true); } 
    else { setWrongCount(w => w + 1); setIsCorrect(false); }
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
        <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-geoCyan mb-8 transition-colors group font-bold uppercase tracking-widest text-[10px]">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step === 'playing' ? 'Abort Active Mission' : 'Back'}
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 'main_cat' && (
          <motion.div key="main" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-5xl font-black text-white italic tracking-tighter uppercase">Intelligence Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["Mixed Global", "Flags", "Borders", "Anomalies"].map(cat => (
                <button key={cat} onClick={() => { setMainCat(cat); setStep('sub_cat'); }} className="p-10 bg-gray-900/60 border-2 border-white/5 rounded-[3rem] text-left hover:border-geoCyan/50 hover:bg-geoCyan/5 transition-all group backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-geoCyan/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-geoCyan/20 transition-all" />
                  <h3 className="text-3xl font-black text-geoCyan group-hover:text-white transition-colors tracking-tight">{cat}</h3>
                  <p className="text-gray-500 text-xs mt-3 uppercase tracking-[0.2em]">Initiate Mission Protocols</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'sub_cat' && (
          <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white italic uppercase tracking-tighter">Operational Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map(reg => (
                <button key={reg} onClick={() => { setSubCat(reg); setStep('settings'); }} className="p-6 bg-gray-900/80 border border-white/10 rounded-3xl hover:bg-geoCyan hover:text-black font-black transition-all uppercase tracking-widest text-[11px] shadow-lg">
                  {reg}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div key="set" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mission Scale</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[5, 10, 'unlimited'].map(len => (
                <button key={len} onClick={() => setGameLength(len as any)} className={`px-12 py-6 rounded-3xl font-black border-2 transition-all ${gameLength === len ? 'border-geoCyan text-geoCyan bg-geoCyan/10 shadow-[0_0_30px_rgba(0,255,255,0.2)]' : 'border-white/10 text-gray-500'}`}>
                  {len.toString().toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={prepareGame} className="bg-geoCyan text-black px-20 py-7 rounded-[3rem] font-black text-2xl hover:shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:scale-105 transition-all uppercase tracking-tighter">
              Launch
            </button>
          </motion.div>
        )}

        {step === 'playing' && shuffledQuestions.length > 0 && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 px-6 font-mono text-[10px] tracking-[0.4em] text-gray-500 uppercase">
              <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5">{mainCat} // {subCat}</span>
              <div className="flex gap-6">
                <span className="text-green-500 font-black">✓ {score}</span>
                <span className="text-red-500 font-black">✗ {wrongCount}</span>
              </div>
            </div>
            
            <div className="bg-gray-900/90 border-2 border-white/10 p-10 md:p-14 rounded-[4.5rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] relative backdrop-blur-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-geoCyan to-transparent opacity-40" />

                {mainCat === "Flags" && (
                    <div className="w-full aspect-video flex items-center justify-center mb-12 bg-black/50 rounded-[3rem] overflow-hidden shadow-inner border border-white/5 p-8">
                      <motion.img layoutId="flag" src={`https://flagcdn.com/w640/${shuffledQuestions[currentIndex].countryCode}.png`} className="h-32 md:h-48 object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)]" />
                    </div>
                )}
                
                <h3 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 leading-tight tracking-tight px-2 italic">
                  "{shuffledQuestions[currentIndex].clue}"
                </h3>
                
                <input ref={inputRef} value={userInput} onChange={e => setUserInput(e.target.value)} disabled={gameState === "revealed"} placeholder="ENTER TARGET..." className="w-full p-8 bg-black/60 border-2 border-white/5 rounded-[2.5rem] text-white text-center text-2xl font-black focus:border-geoCyan/50 outline-none mb-8 transition-all tracking-[0.2em] shadow-inner uppercase" onKeyDown={e => e.key === 'Enter' && handleCheck()} />
                
                <AnimatePresence>
                {gameState === "revealed" && (
                    <motion.div initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`p-10 rounded-[3rem] mb-10 text-center border-2 shadow-2xl ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <p className="font-black uppercase tracking-[0.3em] mb-6 text-sm italic">{isCorrect ? 'Target Authenticated' : `Identification: ${shuffledQuestions[currentIndex].name}`}</p>
                        <button onClick={() => navigate(`/preview-map?lat=${shuffledQuestions[currentIndex].lat}&lng=${shuffledQuestions[currentIndex].lng}`)} className="mx-auto flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-geoCyan transition-all bg-white/5 px-10 py-4 rounded-full border border-white/10 hover:bg-white/10">
                          <MapPin size={16} className="text-geoCyan animate-pulse" /> Satellite Scan
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="flex gap-5">
                  <button onClick={handleCheck} className="flex-grow py-7 bg-geoCyan text-black font-black text-2xl rounded-[2rem] hover:bg-white transition-all shadow-[0_20px_40px_rgba(0,255,255,0.2)] active:scale-95 uppercase italic tracking-tighter">
                      {gameState === "revealed" ? "Continue" : "Finalize"}
                  </button>
                  {gameState === "playing" && (
                    <button onClick={() => { setIsCorrect(false); setGameState("revealed"); }} className="px-10 bg-white/5 text-gray-500 rounded-[2rem] hover:text-geoCyan hover:bg-white/10 transition-all border border-white/5 group shadow-xl">
                      <Eye size={30} className="group-hover:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12">
            <div className="relative inline-block">
              <Trophy className="w-32 h-32 text-geoYellow mx-auto drop-shadow-[0_0_40px_rgba(255,215,0,0.5)]" />
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-geoYellow/20 rounded-full scale-[1.4]" />
            </div>
            <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter">Mission Debrief</h2>
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto font-mono">
                <div className="bg-gray-900/50 p-10 rounded-[3rem] border-2 border-green-500/20 shadow-2xl"><p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Confirmed</p><p className="text-6xl font-black text-green-500">{score}</p></div>
                <div className="bg-gray-900/50 p-10 rounded-[3rem] border-2 border-red-500/20 shadow-2xl"><p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Anomalies</p><p className="text-6xl font-black text-red-500">{wrongCount}</p></div>
            </div>
            <button onClick={() => setStep('main_cat')} className="bg-white text-black font-black px-20 py-7 rounded-[2.5rem] hover:bg-geoCyan transition-all shadow-2xl uppercase italic tracking-tighter hover:scale-105 active:scale-95">
                New Mission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
