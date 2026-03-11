import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, RefreshCw, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  name: string;
  acceptedNames: string[];
  countryCode: string;
  clue: string;
  fact: string;
}

const questionBank: Question[] = [
  {
    name: "Egypt",
    acceptedNames: ["egypt"],
    countryCode: "eg",
    clue: "This country is home to the Pyramids of Giza and the Nile River.",
    fact: "The Great Pyramid of Giza is the only one of the Seven Wonders of the Ancient World still in existence."
  },
  {
    name: "Ilemi Triangle",
    acceptedNames: ["ilemi triangle", "ilemi"],
    countryCode: "ss",
    clue: "A disputed territory in East Africa claimed by South Sudan and Kenya.",
    fact: "The dispute dates back to 1902 and remains one of Africa's most complex border issues."
  },
  {
    name: "Baarle-Hertog",
    acceptedNames: ["baarle-hertog", "baarle hertog", "baarle"],
    countryCode: "be",
    clue: "A Belgian municipality consisting of several enclaves inside the Netherlands.",
    fact: "The border is so complex it sometimes runs through individual houses and restaurants!"
  },
  {
    name: "Lesotho",
    acceptedNames: ["lesotho"],
    countryCode: "ls",
    clue: "A high-altitude, landlocked kingdom completely surrounded by South Africa.",
    fact: "It is the only independent state in the world that lies entirely above 1,000 metres in elevation."
  },
  {
    name: "Bhutan",
    acceptedNames: ["bhutan"],
    countryCode: "bt",
    clue: "Known as the 'Land of the Thunder Dragon', this Himalayan kingdom measures progress by Gross National Happiness.",
    fact: "Bhutan is the only carbon-negative country in the world."
  },
  {
    name: "Suriname",
    acceptedNames: ["suriname"],
    countryCode: "sr",
    clue: "The smallest sovereign state in South America, where Dutch is the official language.",
    fact: "Over 90% of Suriname is covered by pristine tropical rainforest."
  },
  {
    name: "Kyrgyzstan",
    acceptedNames: ["kyrgyzstan"],
    countryCode: "kg",
    clue: "A landlocked country in Central Asia dominated by the Tian Shan mountains.",
    fact: "It is home to the world's second-largest alpine lake, Issyk-Kul."
  },
  {
    name: "Djibouti",
    acceptedNames: ["djibouti"],
    countryCode: "dj",
    clue: "A small country in the Horn of Africa that hosts numerous foreign military bases due to its strategic location.",
    fact: "Lake Assal in Djibouti is the lowest point on the African continent."
  },
  {
    name: "Andorra",
    acceptedNames: ["andorra"],
    countryCode: "ad",
    clue: "A tiny, independent co-principality situated in the Pyrenees mountains between France and Spain.",
    fact: "Andorra is the only country in the world where Catalan is the sole official language."
  },
  {
    name: "Nauru",
    acceptedNames: ["nauru"],
    countryCode: "nr",
    clue: "The world's smallest island nation and the smallest independent republic.",
    fact: "Nauru has no official capital city, though Yaren is the de facto seat of government."
  }
];

function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export default function GeoGame() {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameState, setGameState] = useState<"playing" | "revealed" | "finished">("playing");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5).slice(0, 5);
    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setUserInput("");
    setGameState("playing");
    setIsCorrect(null);
    setFeedback(null);
  };

  const handleCheck = () => {
    if (gameState === "revealed") {
      nextQuestion();
      return;
    }

    const current = shuffledQuestions[currentIndex];
    const guess = userInput.trim().toLowerCase();
    
    if (!guess) return;

    const isMatch = current.acceptedNames.some(name => name === guess) || 
                    getLevenshteinDistance(guess, current.name.toLowerCase()) <= 2;

    if (isMatch) {
      setScore(prev => prev + 1);
      setIsCorrect(true);
      setGameState("revealed");
      setFeedback(null);
    } else {
      setShake(true);
      setFeedback("Wrong Answer! Try again.");
      setTimeout(() => setShake(false), 500);
      setUserInput("");
      inputRef.current?.focus();
    }
  };

  const handleSkip = () => {
    setIsCorrect(false);
    setGameState("revealed");
    setFeedback(null);
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setGameState("playing");
      setIsCorrect(null);
      setFeedback(null);
    } else {
      setGameState("finished");
    }
  };

  if (shuffledQuestions.length === 0) return null;

  if (gameState === "finished") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-20"
      >
        <div className="bg-geoCyan/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <Trophy className="text-geoCyan w-12 h-12" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
        <p className="text-2xl text-gray-300 mb-8">
          You scored <span className="text-geoYellow font-bold">{score}</span> out of {shuffledQuestions.length}
        </p>
        <button 
          onClick={initGame}
          className="bg-geoCyan hover:bg-geoYellow text-gray-900 font-bold text-xl px-12 py-4 rounded-2xl transition-all flex items-center gap-3 mx-auto"
        >
          <RefreshCw className="w-6 h-6" />
          Play Again
        </button>
      </motion.div>
    );
  }

  const current = shuffledQuestions[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full pb-20"
    >
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold text-center mb-2">
          Guess the Country
        </h1>
        <p className="text-gray-300 text-lg text-center mb-8">
          Test your geography knowledge. Spelling counts (mostly)!
        </p>
      </header>

      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center text-geoYellow font-bold text-lg md:text-xl mb-4">
          <span>Q{currentIndex + 1} of {shuffledQuestions.length}</span>
          <span>Score: {score}</span>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl border border-gray-700">
          {/* Flag Container */}
          <div className="w-full h-32 md:h-64 bg-gray-900 rounded-xl flex items-center justify-center mb-6 border border-gray-600 overflow-hidden relative">
            {gameState === "revealed" ? (
              <motion.img 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                src={`https://flagcdn.com/w640/${current.countryCode}.png`}
                alt="Country Flag"
                className="w-full h-full object-contain p-2 md:p-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-4xl md:text-6xl text-gray-700 font-bold">?</span>
            )}
            
            {gameState === "revealed" && (
              <div className="absolute top-2 right-2 md:top-4 md:right-4">
                {isCorrect ? (
                  <CheckCircle2 className="text-emerald-500 w-8 h-8 md:w-10 md:h-10 fill-emerald-500/20" />
                ) : (
                  <XCircle className="text-rose-500 w-8 h-8 md:w-10 md:h-10 fill-rose-500/20" />
                )}
              </div>
            )}
          </div>

          {/* The Clue / Fact */}
          <AnimatePresence mode="wait">
            {gameState === "revealed" ? (
              <motion.div 
                key="fact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6 md:mb-8"
              >
                <h3 className="text-geoCyan font-bold text-xl md:text-2xl mb-1 md:mb-2">{current.name}</h3>
                <p className="text-gray-300 italic leading-relaxed text-sm md:text-base">
                  {current.fact}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="clue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg md:text-2xl text-white text-center font-medium mb-6 md:mb-8 leading-relaxed"
              >
                {current.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Input Area */}
          <div className={`${shake ? "animate-shake" : ""} relative`}>
            <input 
              ref={inputRef}
              type="text" 
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (feedback) setFeedback(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              disabled={gameState === "revealed"}
              placeholder={gameState === "revealed" ? "" : "Type country name..."}
              className={`w-full bg-gray-900 border-2 outline-none text-white text-center text-base md:text-xl p-3 md:p-4 rounded-xl mb-2 transition-all placeholder-gray-500
                ${gameState === "revealed" ? "border-transparent opacity-50" : "border-gray-700 focus:border-geoCyan"}
                ${shake ? "border-rose-500" : ""}
              `}
            />
            <AnimatePresence>
              {feedback && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-rose-500 text-center font-bold text-xs md:text-sm mb-4"
                >
                  {feedback}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <button 
              onClick={handleCheck}
              className={`font-bold text-base md:text-lg py-2.5 md:py-3 rounded-xl transition-all flex items-center justify-center gap-2
                ${gameState === "revealed" 
                  ? "bg-geoYellow hover:bg-geoCyan text-gray-900 md:col-span-2" 
                  : "bg-geoCyan hover:bg-geoYellow text-gray-900"}
              `}
            >
              {gameState === "revealed" ? (
                <>Next Question <ArrowRight className="w-4 h-4 md:w-5 md:h-5" /></>
              ) : (
                "Submit Guess"
              )}
            </button>
            
            {gameState === "playing" && (
              <button 
                onClick={handleSkip}
                className="bg-transparent border-2 border-gray-600 hover:border-gray-400 text-gray-300 font-bold text-base md:text-lg py-2.5 md:py-3 rounded-xl transition-colors"
              >
                Reveal & Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
