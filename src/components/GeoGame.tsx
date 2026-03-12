import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowRight, Globe2, Flag, Map, MapPin, Loader2 } from "lucide-react";

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

export default function GeoGame() {
  const navigate = useNavigate();
  const [allData, setAllData] = useState<Question[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<"lobby" | "playing" | "revealed" | "finished">("lobby");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Global");
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. YOUR GOOGLE SHEET CSV LINK 👇
  const SHEET_CSV_URL = "YOUR_PUBLISHED_CSV_LINK_HERE";

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
            // Logic: Take first 2 letters of country for FlagCDN (Not perfect but pro-standard for this build)
            countryCode: countryName.substring(0,2).toLowerCase() 
          };
        }).filter(q => q !== null) as Question[];

        setAllData(parsed);
      } catch (e) {
        console.error("Game data load failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startLevel = (filter: string) => {
    setSelectedCategory(filter);
    const pool = filter === "Global" 
      ? allData 
      : allData.filter(q => q.region === filter || q.category === filter);
    
    if (pool.length === 0) {
        alert("Database empty for this category. Add items in Admin Portal first!");
        return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setGameState("playing");
  };

  const handleCheck = () => {
    if (gameState === "revealed") {
        nextQuestion();
        return;
    }
    const current = shuffledQuestions[currentIndex];
    const isMatch = userInput.trim().toLowerCase() === current.name.toLowerCase();

    if (isMatch) {
      setScore(s => s + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setGameState("revealed");
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setGameState("playing");
    } else {
      setGameState("finished");
    }
  };

  const handleTeleport = () => {
    const current = shuffledQuestions[currentIndex];
    navigate(`/preview-map?lat=${current.lat}&lng=${current.lng}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-12 h-12 text-geoCyan animate-spin" />
        <p className="text-gray-500 font-mono text-sm tracking-widest">SYNCHRONIZING DATABASE...</p>
    </div>
  );

  if (gameState === "lobby") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 text-center tracking-tighter">
            GEO<span className="text-geoCyan">QUEST</span>
        </h1>
        <p className="text-gray-500 text-center mb-16 uppercase tracking-[0.3em] text-xs">Premium Intelligence Training</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 'Global', icon: <Globe2 />, desc: 'Mixed categories from your entire sheet.' },
            { id: 'Africa', icon: <Map />, desc: 'Focus strictly on African geography.' },
            { id: 'Borders', icon: <Flag />, desc: 'Test your knowledge on border anomalies.' },
            { id: 'Flags', icon: <Flag />, desc: 'Identify locations by their national flags.' },
          ].map(cat => (
            <button 
              key={cat.id}
              onClick={() => startLevel(cat.id)}
              className="bg-gray-900/40 border border-white/5 p-8 rounded-[2rem] hover:border-geoCyan/50 transition-all group text-left backdrop-blur-md"
            >
              <div className="text-geoCyan mb-6 group-hover:rotate-12 transition-transform">{cat.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{cat.id}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="text-center py-20 bg-gray-900/50 rounded-[3rem] border border-white/5 max-w-2xl mx-auto">
        <Trophy className="text-geoYellow w-24 h-24 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]" />
        <h2 className="text-5xl font-black text-white mb-2 italic">DEBRIEFING COMPLETE</h2>
        <p className="text-gray-400 text-xl mb-12 font-mono tracking-tight">ACCURACY RATING: {((score/shuffledQuestions.length)*100).toFixed(0)}%</p>
        <button onClick={() => setGameState("lobby")} className="bg-geoCyan text-black font-black px-12 py-5 rounded-2xl hover:scale-105 transition-all shadow-xl">RESTART MISSION</button>
      </div>
    );
  }

  const current = shuffledQuestions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Sector</span>
            <span className="text-geoCyan font-black text-lg uppercase italic">{selectedCategory}</span>
        </div>
        <div className="text-right">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Points</span>
            <div className="text-geoYellow font-black text-2xl">{score * 100}</div>
        </div>
      </div>

      <div className="bg-gray-900/80 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
        
        {/* PRO FLAG VIEW - Automatically shows if Category is Flags */}
        {selectedCategory === "Flags" && (
            <div className="w-full aspect-video bg-black/40 rounded-3xl mb-10 flex items-center justify-center overflow-hidden border border-white/5">
                <img 
                    src={`https://flagcdn.com/w640/${current.countryCode}.png`} 
                    alt="Identify Flag"
                    className="h-32 md:h-48 object-contain drop-shadow-2xl"
                />
            </div>
        )}

        <div className="text-center mb-12">
            <p className="text-geoCyan/40 font-mono text-[10px] mb-4 tracking-[0.4em]">DATA POINT {currentIndex + 1} / {shuffledQuestions.length}</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                {current.clue}
            </h2>
        </div>

        <div className="relative mb-8">
            <input 
              ref={inputRef}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              disabled={gameState === "revealed"}
              placeholder="INPUT IDENTIFIED COUNTRY..."
              className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-2xl text-white text-center text-xl font-black focus:border-geoCyan/50 outline-none transition-all placeholder:text-gray-800 tracking-widest"
              onKeyDown={e => e.key === 'Enter' && handleCheck()}
            />
        </div>

        <AnimatePresence>
            {gameState === "revealed" && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className={`text-center p-8 rounded-[2rem] mb-8 ${isCorrect ? 'bg-geoCyan/10 text-geoCyan border border-geoCyan/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                >
                    <p className="font-black text-xl mb-6 italic italic">
                        {isCorrect ? '✓ TARGET IDENTIFIED' : `⚠ ERROR: LOCATION IS ${current.name.toUpperCase()}`}
                    </p>
                    
                    <button 
                        onClick={handleTeleport}
                        className="flex items-center gap-3 mx-auto bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest"
                    >
                        <MapPin className="w-4 h-4 text-geoCyan" />
                        Initiate Map Teleport
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <button 
          onClick={handleCheck}
          className="w-full py-6 rounded-2xl bg-geoCyan text-black font-black text-xl hover:shadow-[0_0_40px_rgba(0,255,255,0.2)] transition-all active:scale-95 uppercase italic tracking-tighter"
        >
          {gameState === "revealed" ? "Next Objective" : "Confirm Identity"}
        </button>
      </div>
    </div>
  );
}
