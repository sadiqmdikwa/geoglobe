import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowRight, Globe2, Flag, Map, MapPin, Loader2, Play, RotateCcw, ChevronLeft, Eye } from "lucide-react";

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

// PRO ALGO: Allows for 1-2 character spelling mistakes
function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
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

  const handleBack = () => {
    if (step === 'sub_cat') setStep('main_cat');
    else if (step === 'settings') setStep('sub_cat');
    else if (step === 'playing') setStep('settings');
    else navigate('/');
  };

  const prepareGame = () => {
    let pool = [...allData];
    if (mainCat !== "Mixed Global") pool = pool.filter(q => q.category === mainCat);
    if (subCat !== "Global") pool = pool.filter(q => q.region === subCat);
    if (pool.length === 0) return alert("No data found for this selection!");

    const shuffled = pool.sort(() => Math.random() - 0.5);
    setShuffledQuestions(gameLength === 'unlimited' ? shuffled : shuffled.slice(0, gameLength as number));
    setCurrentIndex(0); setScore(0); setWrongCount(0); setStep('playing');
  };

  const handleCheck = () => {
    if (gameState === "revealed") { nextQuestion(); return; }
    const current = shuffledQuestions[currentIndex];
    const guess = userInput.trim().toLowerCase();
    const target = current.name.toLowerCase();
    
    // Spelling tolerance (Levenshtein)
    const isMatch = guess === target || getLevenshteinDistance(guess, target) <= 2;

    if (isMatch) { setScore(s => s + 1); setIsCorrect(true); } 
    else { setWrongCount(w => w + 1); setIsCorrect(false); }
    setGameState("revealed");
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1); setUserInput(""); setGameState("playing");
    } else setStep('results');
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-geoCyan w-12 h-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* INTERNAL NAVIGATION BACK BUTTON */}
      {step !== 'results' && (
        <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-geoCyan mb-8 transition-colors group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 'main_cat' && (
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white italic">Intelligence Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Mixed Global", "Flags", "Borders", "Anomalies"].map(cat => (
                <button key={cat} onClick={() => { setMainCat(cat); setStep('sub_cat'); }} className="p-8 bg-gray-900/50 border border-white/5 rounded-3xl text-left hover:border-geoCyan transition-all group backdrop-blur-md">
                  <h3 className="text-2xl font-bold text-geoCyan">{cat}</h3>
                  <p className="text-gray-500 text-sm">Deploy protocols for {cat}.</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'sub_cat' && (
          <motion.div key="sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white italic">Operational Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map(reg => (
                <button key={reg} onClick={() => { setSubCat(reg); setStep('settings'); }} className="p-6 bg-gray-900 border border-white/5 rounded-2xl hover:bg-geoCyan hover:text-black font-bold transition-all uppercase">
                  {reg}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div key="set" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">Mission Parameters</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[5, 10, 'unlimited'].map(len => (
                <button key={len} onClick={() => setGameLength(len as any)} className={`px-10 py-5 rounded-2xl font-black border-2 transition-all ${gameLength === len ? 'border-geoCyan text-geoCyan' : 'border-white/10 text-gray-500'}`}>
                  {len.toString().toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={prepareGame} className="bg-geoCyan text-black px-16 py-6 rounded-3xl font-black text-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all flex items-center gap-3 mx-auto">
              START SESSION
            </button>
          </motion.div>
        )}

        {step === 'playing' && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 px-2 font-mono text-[10px] tracking-widest text-gray-500 uppercase">
                <span>{mainCat} // {subCat}</span>
                <span className="text-geoYellow font-black text-sm">ACCURACY: {score} / {currentIndex + 1}</span>
            </div>
            <div className="bg-gray-900 border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl relative">
                {mainCat === "Flags" && (
                    <div className="w-full aspect-video flex items-center justify-center mb-8 bg-black/40 rounded-3xl"><img src={`https://flagcdn.com/w640/${shuffledQuestions[currentIndex].countryCode}.png`} className="h-32 md:h-44 object-contain shadow-2xl" /></div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-10 leading-tight">{shuffledQuestions[currentIndex].clue}</h3>
                <input ref={inputRef} value={userInput} onChange={e => setUserInput(e.target.value)} disabled={gameState === "revealed"} placeholder="IDENTIFY TARGET..." className="w-full p-6 bg-black border-2 border-white/5 rounded-2xl text-white text-center text-xl font-black focus:border-geoCyan outline-none mb-6" onKeyDown={e => e.key === 'Enter' && handleCheck()} />
                
                {gameState === "revealed" && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`p-6 rounded-2xl mb-6 text-center border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <p className="font-black uppercase mb-4">{isCorrect ? '✓ Verified' : `⚠ Identity: ${shuffledQuestions[currentIndex].name}`}</p>
                        <button onClick={() => navigate(`/preview-map?lat=${shuffledQuestions[currentIndex].lat}&lng=${shuffledQuestions[currentIndex].lng}`)} className="mx-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors"><MapPin size={14} /> View Satellite Data</button>
                    </motion.div>
                )}

                <div className="flex gap-4">
                  <button onClick={handleCheck} className="flex-grow py-6 bg-geoCyan text-black font-black text-xl rounded-2xl hover:bg-white transition-all">
                      {gameState === "revealed" ? "NEXT" : "SUBMIT"}
                  </button>
                  {gameState === "playing" && (
                    <button onClick={() => { setIsCorrect(false); setGameState("revealed"); }} className="p-6 bg-white/5 text-gray-400 rounded-2xl hover:text-white transition-colors">
                      <Eye />
                    </button>
                  )}
                </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <Trophy className="w-24 h-24 text-geoYellow mx-auto" />
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter">Debriefing Complete</h2>
            <p className="text-3xl font-black text-geoCyan">FINAL SCORE: {score} / {shuffledQuestions.length}</p>
            <button onClick={() => setStep('main_cat')} className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:bg-geoCyan transition-all flex items-center gap-3 mx-auto uppercase">
                <RotateCcw size={18} /> New Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
