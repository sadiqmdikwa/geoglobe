import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, RefreshCw, ArrowRight, CheckCircle2, XCircle, Globe2, Flag, Map } from "lucide-react";

interface Question {
  id: string;
  name: string;
  clue: string;
  countryCode: string; // Used for flags
  category: string;
  region: string;
  fact: string;
}

export default function GeoGame() {
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
          return {
            id: index.toString(),
            clue: cols[1]?.replace(/"/g, ""), // Title acts as Clue
            name: cols[5]?.replace(/"/g, "").trim(), // Correct Answer
            category: cols[6]?.replace(/"/g, "").trim() || "General",
            region: cols[7]?.replace(/"/g, "").trim() || "Global",
            fact: "Did you know? This location is a key geographical landmark.",
            countryCode: (cols[5]?.replace(/"/g, "").substring(0,2).toLowerCase()) || "un" // Fallback
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

  // --- LOBBY VIEW ---
  if (gameState === "lobby") {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-geoCyan mb-4 text-center">GeoQuest Pro</h1>
        <p className="text-gray-400 text-center mb-12">Select a category to test your knowledge</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'Global', icon: <Globe2 />, desc: 'All questions' },
            { id: 'Africa', icon: <Map />, desc: 'Continental challenge' },
            { id: 'Borders', icon: <Flag />, desc: 'Disputed & unique borders' },
            { id: 'Flags', icon: <Flag />, desc: 'Identify by flags' },
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

  // --- FINISHED VIEW ---
  if (gameState === "finished") {
    return (
      <div className="text-center py-20">
        <Trophy className="text-geoYellow w-20 h-20 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-white mb-2">Well Played!</h2>
        <p className="text-gray-400 text-xl mb-8">Score: {score} / {shuffledQuestions.length}</p>
        <button onClick={() => setGameState("lobby")} className="bg-geoCyan text-black font-bold px-10 py-4 rounded-xl">Back to Lobby</button>
      </div>
    );
  }

  const current = shuffledQuestions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <span className="text-geoCyan font-mono">CATEGORY: {selectedCategory}</span>
        <span className="text-geoYellow font-bold">SCORE: {score}</span>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
            <p className="text-gray-500 uppercase tracking-widest text-xs mb-2">Question {currentIndex + 1}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {current.clue}
            </h2>
        </div>

        <input 
          ref={inputRef}
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          disabled={gameState === "revealed"}
          placeholder="Enter country name..."
          className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-white text-center text-xl mb-6 focus:border-geoCyan outline-none transition-all"
          onKeyDown={e => e.key === 'Enter' && handleCheck()}
        />

        {gameState === "revealed" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center p-4 rounded-2xl mb-6 ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <p className="font-bold">{isCorrect ? 'Correct!' : `Wrong! Answer: ${current.name}`}</p>
            </motion.div>
        )}

        <button 
          onClick={handleCheck}
          className="w-full py-5 rounded-2xl bg-geoCyan text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {gameState === "revealed" ? "Next Question" : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}
