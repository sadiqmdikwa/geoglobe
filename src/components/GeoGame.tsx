import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowRight, Globe2, Flag, Map, MapPin } from "lucide-react";

interface Question {
  id: string;
  name: string;
  clue: string;
  lat: number;
  lng: number;
  category: string;
  region: string;
  fact: string;
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
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSN2eegc7Fbv9U2Wlui2p3kzG9mai7Q-lbNF-zHW2mNpOPNESCg5Oiwqvnr8IPIVVqfrfl6CVRkIqnV/pub?output=csv";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        
        const parsed = rows.map((row, index) => {
          const cols = row.split(',');
          if (cols.length < 6) return null;
          return {
            id: index.toString(),
            clue: cols[1]?.replace(/"/g, ""), 
            lat: parseFloat(cols[2]) || 0,
            lng: parseFloat(cols[3]) || 0,
            name: cols[5]?.replace(/"/g, "").trim(), 
            category: cols[6]?.replace(/"/g, "").trim() || "General",
            region: cols[7]?.replace(/"/g, "").trim() || "Global",
            fact: "This location is part of the GeoGlobe master database."
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
        alert("No questions found in this category yet! Add some in the Admin Portal.");
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

  // Teleport to Preview Map Logic
  const handleTeleport = () => {
    const current = shuffledQuestions[currentIndex];
    navigate(`/preview-map?lat=${current.lat}&lng=${current.lng}`);
  };

  if (loading) return <div className="text-center py-20 text-geoCyan animate-pulse">Loading Database...</div>;

  if (gameState === "lobby") {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-geoCyan mb-4 text-center">GeoQuest Pro</h1>
        <p className="text-gray-400 text-center mb-12">Select a category to test your knowledge</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'Global', icon: <Globe2 />, desc: 'All database questions' },
            { id: 'Africa', icon: <Map />, desc: 'African Continental challenge' },
            { id: 'Borders', icon: <Flag />, desc: 'Disputed & unique borders' },
            { id: 'Flags', icon: <Flag />, desc: 'Identify by flag details' },
          ].map(cat => (
            <button 
              key={cat.id}
              onClick={() => startLevel(cat.id)}
              className="bg-gray-900/50 border border-white/10 p-8 rounded-3xl hover:border-geoCyan transition-all group text-left"
            >
              <div className="text-geoCyan mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{cat.id}</h3>
              <p className="text-gray-500 text-sm">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="text-center py-20">
        <Trophy className="text-geoYellow w-20 h-20 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-white mb-2">Well Played!</h2>
        <p className="text-gray-400 text-xl mb-8">Score: {score} / {shuffledQuestions.length}</p>
        <button onClick={() => setGameState("lobby")} className="bg-geoCyan text-black font-bold px-10 py-4 rounded-xl hover:bg-white transition-colors">Back to Lobby</button>
      </div>
    );
  }

  const current = shuffledQuestions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <span className="text-geoCyan font-mono bg-geoCyan/10 px-3 py-1 rounded-lg text-xs uppercase tracking-widest">{selectedCategory}</span>
        <span className="text-geoYellow font-bold">SCORE: {score}</span>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
            <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-4">Question {currentIndex + 1} of {shuffledQuestions.length}</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {current.clue}
            </h2>
        </div>

        <input 
          ref={inputRef}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          disabled={gameState === "revealed"}
          placeholder="Enter country name..."
          className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white text-center text-xl mb-6 focus:border-geoCyan outline-none transition-all placeholder:text-gray-700"
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
        />

        <AnimatePresence>
            {gameState === "revealed" && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`text-center p-6 rounded-2xl mb-6 ${isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                >
                    <p className="font-bold text-lg mb-4">
                        {isCorrect ? '✨ Genius! You nailed it.' : `❌ Not quite! The answer is ${current.name}`}
                    </p>
                    
                    {/* THE TELEPORT BUTTON */}
                    <button 
                        onClick={handleTeleport}
                        className="flex items-center gap-2 mx-auto bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm transition-all group"
                    >
                        <MapPin className="w-4 h-4 text-geoCyan group-hover:animate-bounce" />
                        {isCorrect ? "See your kingdom on the map" : "Show me where this is on the map"}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <button 
          onClick={handleCheck}
          className="w-full py-5 rounded-2xl bg-geoCyan text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all active:scale-95"
        >
          {gameState === "revealed" ? "Next Question" : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}
