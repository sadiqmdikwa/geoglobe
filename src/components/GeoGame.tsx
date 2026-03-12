import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, MapPin, Loader2, Eye, ChevronLeft } from "lucide-react";

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

// Calculate typos (Levenshtein Distance)
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

// Smart Answer Matching (Ignores "desert", "river", etc., and allows partial matches)
function checkAnswerIsCorrect(guess: string, target: string): boolean {
  const g = guess.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (g === t) return true;

  // Strip common geographical terms to allow for partial answers
  const stripWords = (str: string) => 
    str.replace(/\b(the|republic of|democratic republic of|desert|river|mountains|mountain|ocean|sea|lake|island|islands)\b/g, '')
       .replace(/\s+/g, ' ')
       .trim();

  const cleanG = stripWords(g);
  const cleanT = stripWords(t);

  if (cleanG === cleanT) return true;
  // Allow up to 2 typos
  if (getLevenshteinDistance(cleanG, cleanT) <= 2) return true;
  // If the user typed a substantial part of the word (e.g. "Sahara" in "Sahara Desert")
  if (cleanG.length >= 4 && cleanT.includes(cleanG)) return true;

  return false;
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

  // INITIAL LOAD & RESTORE SESSION
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

        const saved = localStorage.getItem("geoglobe_active_session");
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

  // PERSISTENCE ENGINE
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
      localStorage.setItem("geoglobe_active_session", JSON.stringify(sessionData));
    }
  }, [currentIndex, score, wrongCount, step, shuffledQuestions]);

  const handleBack = () => {
    if (step === 'sub_cat') setStep('main_cat');
    else if (step === 'settings') setStep('sub_cat');
    else if (step === 'playing') {
      if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
        localStorage.removeItem("geoglobe_active_session");
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
    
    if (pool.length === 0) return alert("Insufficient questions for this category and region combination.");

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = gameLength === 'unlimited' ? shuffled : shuffled.slice(0, gameLength as number);
    
    localStorage.removeItem("geoglobe_active_session");
    
    setShuffledQuestions(selected);
    setCurrentIndex(0); 
    setScore(0); 
    setWrongCount(0); 
    setStep('playing');
    setGameState("playing");
  };

  const handleCheck = () => {
    if (gameState === "revealed") { nextQuestion(); return; }
    if (!userInput.trim()) return;

    const current = shuffledQuestions[currentIndex];
    const isMatch = checkAnswerIsCorrect(userInput, current.name);

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
      localStorage.removeItem("geoglobe_active_session");
      setStep('results');
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-geoCyan w-10 h-10" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 min-h-[70vh] flex flex-col justify-center">
      {step !== 'results' && (
        <button onClick={handleBack} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors text-sm font-medium w-fit">
          <ChevronLeft className="w-4 h-4 mr-1" />
          {step === 'playing' ? 'Exit Game' : 'Back'}
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 'main_cat' && (
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-3xl font-bold text-white tracking-tight">Select Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {["Mixed Global", "Flags", "Borders", "Anomalies"].map(cat => (
                <button key={cat} onClick={() => { setMainCat(cat); setStep('sub_cat'); }} className="p-8 bg-gray-900/40 border border-gray-800 rounded-2xl text-left hover:border-geoCyan hover:bg-gray-800 transition-all group backdrop-blur-md">
                  <h3 className="text-xl font-semibold text-white group-hover:text-geoCyan transition-colors">{cat}</h3>
                  <p className="text-gray-400 text-sm mt-2">Play {cat.toLowerCase()} questions.</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'sub_cat' && (
          <motion.div key="sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <h2 className="text-center text-3xl font-bold text-white tracking-tight">Select Region</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {["Global", "Africa", "Asia", "Europe", "Americas", "Oceania"].map(reg => (
                <button key={reg} onClick={() => { setSubCat(reg); setStep('settings'); }} className="p-6 bg-gray-900/40 border border-gray-800 rounded-2xl hover:border-geoCyan hover:bg-gray-800 text-white font-medium transition-all shadow-sm">
                  {reg}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'settings' && (
          <motion.div key="set" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
            <h2 className="text-3xl font-bold text-white tracking-tight">Game Length</h2>
            <div className="flex flex-wrap justify-center gap-5">
              {[5, 10, 'unlimited'].map(len => (
                <button key={len} onClick={() => setGameLength(len as any)} className={`px-8 py-4 rounded-xl font-medium border transition-all ${gameLength === len ? 'border-geoCyan text-geoCyan bg-geoCyan/10' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
                  {len === 'unlimited' ? 'Unlimited' : `${len} Questions`}
                </button>
              ))}
            </div>
            <button onClick={prepareGame} className="bg-geoCyan hover:bg-geoCyan/90 text-gray-900 px-12 py-4 rounded-xl font-semibold text-lg transition-all mx-auto mt-4">
              Start Game
            </button>
          </motion.div>
        )}

        {step === 'playing' && shuffledQuestions.length > 0 && (
          <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl mx-auto">
            {/* Header / Stats */}
            <div className="flex justify-between items-center mb-6 px-2 text-sm font-medium text-gray-400">
              <span className="bg-gray-800 px-3 py-1 rounded-md">{mainCat} • {subCat}</span>
              <div className="flex gap-4 bg-gray-800 px-3 py-1 rounded-md">
                <span className="text-green-500">Correct: {score}</span>
                <span className="text-red-500">Incorrect: {wrongCount}</span>
              </div>
            </div>

            {/* Main Game Card */}
            <div className="bg-gray-900/50 border border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md">
                {mainCat === "Flags" && (
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full aspect-video flex items-center justify-center mb-8 bg-black/20 rounded-2xl overflow-hidden border border-gray-800">
                      <img src={`https://flagcdn.com/w640/${shuffledQuestions[currentIndex].countryCode}.png`} className="h-32 md:h-44 object-contain" alt="Flag clue" />
                    </motion.div>
                )}
                
                <h3 className="text-xl md:text-2xl font-semibold text-center text-white mb-8 leading-relaxed px-2">
                  {shuffledQuestions[currentIndex].clue}
                </h3>
                
                {/* Input Field */}
                <div className="mb-6">
                  <input 
                    ref={inputRef} 
                    value={userInput} 
                    onChange={e => setUserInput(e.target.value)} 
                    disabled={gameState === "revealed"} 
                    placeholder="Type your answer..." 
                    className="w-full p-4 bg-black/40 border border-gray-700 rounded-xl text-white text-center text-lg font-medium focus:border-geoCyan focus:ring-1 focus:ring-geoCyan outline-none transition-all placeholder-gray-500 disabled:opacity-50" 
                    onKeyDown={e => e.key === 'Enter' && handleCheck()} 
                  />
                </div>
                
                {/* Feedback Box (Updated to always show the correct answer) */}
                <AnimatePresence>
                {gameState === "revealed" && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`p-6 rounded-xl mb-6 text-center border ${isCorrect ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}>
                        <p className="font-semibold text-xl mb-1">
                          {isCorrect ? 'Correct!' : 'Incorrect.'}
                        </p>
                        <p className="text-sm opacity-90 mb-4">
                          The answer is <span className="font-bold">{shuffledQuestions[currentIndex].name}</span>
                        </p>
                        <button onClick={() => navigate(`/preview-map?lat=${shuffledQuestions[currentIndex].lat}&lng=${shuffledQuestions[currentIndex].lng}`)} className="mx-auto flex items-center gap-2 text-sm font-medium text-white hover:text-geoCyan transition-colors bg-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-700">
                          <MapPin size={16} className="text-geoCyan" /> View on Map
                        </button>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={handleCheck} className="flex-grow py-4 bg-geoCyan hover:bg-geoCyan/90 text-gray-900 font-semibold text-lg rounded-xl transition-all">
                      {gameState === "revealed" ? "Next Question" : "Submit"}
                  </button>
                  {gameState === "playing" && (
                    <button onClick={() => { setIsCorrect(false); setGameState("revealed"); }} className="px-6 bg-gray-800 text-gray-400 rounded-xl hover:text-white hover:bg-gray-700 transition-all border border-gray-700" title="Reveal Answer">
                      <Eye size={20} />
                    </button>
                  )}
                </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
            <Trophy className="w-20 h-20 text-geoCyan mx-auto" />
            <h2 className="text-4xl font-bold text-white tracking-tight">Game Complete</h2>
            
            <div className="grid grid-cols-2 gap-5 max-w-sm mx-auto">
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                  <p className="text-sm text-gray-400 font-medium mb-1">Correct</p>
                  <p className="text-4xl font-bold text-green-500">{score}</p>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                  <p className="text-sm text-gray-400 font-medium mb-1">Incorrect</p>
                  <p className="text-4xl font-bold text-red-500">{wrongCount}</p>
                </div>
            </div>
            
            <button onClick={() => setStep('main_cat')} className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-10 py-4 rounded-xl transition-all mt-4">
                Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
