import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowLeft, Globe2, Flag, Map, MapPin, Loader2, Play, RotateCcw, HelpCircle } from "lucide-react";

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

// PRO ALGO: Allows for small spelling mistakes
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

  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pubhtml?gid=1141935128&single=true";

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

  // PRO NAVIGATION: Go back step-by-step
  const handleBack = () => {
    if (step === 'playing' || step === 'results') {
      if (window.confirm("Abort mission? Your progress will be lost.")) setStep('main_cat');
    } else if (step === 'settings') setStep('sub_cat');
    else if (step === 'sub_cat') setStep('main_cat');
    else navigate("/");
  };

  const prepareGame = () => {
    let pool = allData.filter(q => (mainCat === "Mixed Global" || q.category === mainCat) && (subCat === "Global" || q.region === subCat));
    if (pool.length === 0) return alert("Insufficient data! Add more in Admin Portal.");
    const shuffled = pool.sort(() => Math.random() - 0.5);
    setShuffledQuestions(gameLength === 'unlimited' ? shuffled : shuffled.slice(0, gameLength as number));
    setCurrentIndex(0); setScore(0); setWrongCount(0); setStep('playing');
  };

  const handleCheck = () => {
    if (gameState === "revealed") { nextQuestion(); return; }
    const current = shuffledQuestions[currentIndex];
    const guess = userInput.trim().toLowerCase();
    const actual = current.name.toLowerCase();
    
    // FUZZY MATCH: Allowed distance of 2 for spelling errors
    const isMatch = guess === actual || getLevenshteinDistance(guess, actual) <= 2;

    if (isMatch) { setScore(s => s + 1); setIsCorrect(true); } 
    else { setWrongCount(w => w + 1); setIsCorrect(false); }
    setGameState("revealed");
  };

  const handleSkip = () => {
    setWrongCount(w => w + 1);
    setIsCorrect(false);
    setGameState("revealed");
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1); setUserInput(""); setGameState("playing");
    } else setStep('results');
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-geoCyan w-12 h-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 min-h-[600px]">
      {/* Back Button */}
      <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-geoCyan mb-10 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        {step === 'main_cat' ? "Exit Game" : "Previous Step"}
      </button>

      <AnimatePresence mode="wait">
        {step === 'main_cat' && (
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <h2 className="text-center text-4xl font-black text-white italic tracking-tighter uppercase">Intelligence Sector</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Mixed Global", "Flags", "Borders", "Anomalies"].map(cat => (
                <button key={cat} onClick={() => { setMainCat(cat); setStep('sub_cat'); }} className="p-8 bg-gray-900 border border-white/5 rounded-3xl text-left hover:border-geoCyan hover:bg-gray-800/50 transition-all group">
                  <h3 className="text-2xl font-bold text-geoCyan mb-2">{cat}</h3>
                  <p className="text-gray-500 text-sm italic">Analyze data across {cat} metrics.</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'sub_cat' && (
          <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-center">
            <h2 className="text-4xl font-black text-white italic uppercase">Target Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map(reg => (
                <button key={reg} onClick={() => { setSubCat(reg); setStep('settings'); }} className="p-6 bg-gray-900/50 border border-white/5 rounded-2xl hover:bg-geoCyan hover:text-black font-black transition-all uppercase tracking-tighter">{reg}</button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div key="set" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12 py-10">
            <h2 className="text-4xl font-black text-white italic uppercase">Mission Length</h2>
            <div className="flex justify-center gap-6">
              {[5, 10, 'unlimited'].map(len => (
                <button key={len} onClick={() => setGameLength(len as any)} className={`w-32 py-5 rounded-2xl font-black border-2 transition-all ${gameLength === len ? 'border-geoCyan text-geoCyan bg-geoCyan/5' : 'border-white/10 text-gray-500 hover:border-white/30'}`}>
                  {len.toString().toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={prepareGame} className="bg-geoCyan text-black px-16 py-6 rounded-3xl font-black text-xl hover:scale-110 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]">START MISSION</button>
          </motion.div>
        )}

        {step === 'playing' && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6 px-2 font-mono text-[10px] tracking-[0.2em] text-gray-500 uppercase">
                <span>{mainCat} / {subCat}</span>
                <span className="text-geoYellow">Progress: {currentIndex + 1} / {shuffledQuestions.length}</span>
            </div>
            <div className="bg-gray-900 border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl backdrop-blur-md">
                {mainCat === "Flags" && (
                    <div className="w-full aspect-video flex items-center justify-center mb-10 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                        <img src={`https://flagcdn.com/w640/${shuffledQuestions[currentIndex].countryCode}.png`} className="h-32 md:h-44 object-contain drop-shadow-2xl" />
                    </div>
                )}
                <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-10 leading-tight">{shuffledQuestions[currentIndex].clue}</h3>
                <input ref={inputRef} value={userInput} onChange={e => setUserInput(e.target.value)} disabled={gameState === "revealed"} placeholder="TYPE ANSWER..." className="w-full p-6 bg-black/40 border-2 border-white/10 rounded-2xl text-white text-center text-xl font-black focus:border-geoCyan outline-none tracking-widest mb-6 transition-all" onKeyDown={e => e.key === 'Enter' && handleCheck()} autoFocus />
                
                {gameState === "revealed" && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`p-8 rounded-3xl mb-8 text-center border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <p className="font-black text-xl mb-4 uppercase">{isCorrect ? 'Target Identified ✓' : `Identity Revealed: ${shuffledQuestions[currentIndex].name}`}</p>
                        <button onClick={() => navigate(`/preview-map?lat=${shuffledQuestions[currentIndex].lat}&lng=${shuffledQuestions[currentIndex].lng}`)} className="flex items-center gap-2 mx-auto text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 py-2 px-4 rounded-lg transition-all"><MapPin size={14} className="text-geoCyan" /> View Location</button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleCheck} className={`py-5 rounded-2xl font-black text-lg transition-all ${gameState === "revealed" ? "bg-geoCyan text-black md:col-span-2 shadow-lg" : "bg-geoCyan text-black"}`}>
                        {gameState === "revealed" ? "CONTINUE MISSION" : "CONFIRM"}
                    </button>
                    {gameState === "playing" && (
                        <button onClick={handleSkip} className="py-5 border-2 border-white/10 text-gray-400 rounded-2xl font-black text-lg hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-2">
                           <HelpCircle size={20} /> SKIP
                        </button>
                    )}
                </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 max-w-lg mx-auto bg-gray-900 border border-white/5 p-12 rounded-[4rem]">
            <Trophy className="w-24 h-24 text-geoYellow mx-auto drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Debriefing</h2>
            <div className="flex justify-center gap-8">
                <div className="text-center"><p className="text-green-500 text-4xl font-black">{score}</p><p className="text-[10px] text-gray-500 font-bold tracking-widest">SUCCESS</p></div>
                <div className="text-center"><p className="text-red-500 text-4xl font-black">{wrongCount}</p><p className="text-[10px] text-gray-500 font-bold tracking-widest">FAILURE</p></div>
            </div>
            <button onClick={() => setStep('main_cat')} className="w-full py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-geoCyan transition-all flex items-center justify-center gap-3">
                <RotateCcw size={20} /> NEW SESSION
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
