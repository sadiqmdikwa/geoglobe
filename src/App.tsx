/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import SuggestionForm from './components/SuggestionForm';
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, Map, Trophy, ArrowRight } from "lucide-react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import VideoLibrary from "./components/VideoLibrary";
import Header from "./components/Header";
import InteractiveMap from "./components/InteractiveMap";
import GeoGame from "./components/GeoGame";
import AboutContact from "./components/AboutContact";
import BackToTop from "./components/BackToTop";
import ScrollProgress from "./components/ScrollProgress";
import PreviewMap from "./components/PreviewMap"; 

function Home() {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-16"
    >
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden flex items-center justify-center text-center px-6 shadow-2xl border border-white/5"
      >
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000" 
               alt="World Map Background" 
               className="w-full h-full object-cover scale-105"
               referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/95"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w" 
              alt="GeoGlobe Logo" 
              className="h-24 w-24 md:h-32 md:w-32 object-contain animate-float drop-shadow-[0_0_15px_rgba(66,194,203,0.5)]" 
            />
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-7xl text-white font-bold tracking-tighter mb-6 italic uppercase"
          >
            Explore the <span className="text-geoCyan">World's</span> Mysteries
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
          >
            Discover border anomalies, fascinating country facts, and interactive maps through our premium geography platform.
          </motion.p>
          <motion.div>
            <button 
              onClick={() => navigate("/map")}
              className="group bg-geoCyan hover:bg-white text-black px-12 py-5 rounded-2xl mt-10 font-black text-lg transition-all hover:shadow-[0_0_40px_rgba(66,194,203,0.4)] flex items-center gap-3 mx-auto w-fit uppercase italic tracking-tighter"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Cards Grid */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Card 1: Video Library */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -10 }}
          onClick={() => navigate("/videos")}
          className="relative bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 hover:border-geoCyan/40 transition-all group cursor-pointer shadow-xl"
        >
          <div className="bg-geoCyan/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-geoCyan transition-all">
            <PlayCircle className="text-geoCyan w-7 h-7 group-hover:text-black transition-colors" />
          </div>
          <h3 className="text-white text-2xl font-black mb-3 italic uppercase tracking-tighter group-hover:text-geoCyan">Video Library</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">Watch our latest map animations and high-production geography series.</p>
          <div className="flex items-center text-geoCyan text-xs font-black uppercase tracking-[0.2em] gap-2">
            Browse Videos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Interactive Map */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -10 }}
          onClick={() => navigate("/map")}
          className="relative bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 hover:border-geoCyan/40 transition-all group cursor-pointer shadow-xl"
        >
          <div className="bg-geoCyan/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-geoCyan transition-all">
            <Map className="text-geoCyan w-7 h-7 group-hover:text-black transition-colors" />
          </div>
          <h3 className="text-white text-2xl font-black mb-3 italic uppercase tracking-tighter group-hover:text-geoCyan">Interactive Map</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">Explore the globe and find videos pinned to exact geographical coordinates.</p>
          <div className="flex items-center text-geoCyan text-xs font-black uppercase tracking-[0.2em] gap-2">
            Open Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 3: Geo Game */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -10 }}
          onClick={() => navigate("/game")}
          className="relative bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 hover:border-geoCyan/40 transition-all group cursor-pointer shadow-xl"
        >
          <div className="bg-geoCyan/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-geoCyan transition-all">
            <Trophy className="text-geoCyan w-7 h-7 group-hover:text-black transition-colors" />
          </div>
          <h3 className="text-white text-2xl font-black mb-3 italic uppercase tracking-tighter group-hover:text-geoCyan">Geo Game</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">Test your knowledge in our ultimate "Guess the Country" challenge.</p>
          <div className="flex items-center text-geoCyan text-xs font-black uppercase tracking-[0.2em] gap-2">
            Play Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const getViewFromPath = (path: string): "home" | "videos" | "map" | "game" | "contact" => {
    if (path === "/videos") return "videos";
    if (path === "/map") return "map";
    if (path === "/game") return "game";
    if (path === "/contact") return "contact";
    return "home";
  };

  const handleNavigate = (view: "home" | "videos" | "map" | "game" | "contact") => {
    if (view === "home") navigate("/");
    else navigate(`/${view}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-geoDark">
      <ScrollProgress />
      <Header onNavigate={handleNavigate} currentView={getViewFromPath(location.pathname)} />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<VideoLibrary onBack={() => navigate("/")} />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/game" element={<GeoGame />} />
            <Route path="/contact" element={<AboutContact />} />
            <Route path="/admin-portal-xyz" element={<SuggestionForm />} />
            <Route path="/preview-map" element={<PreviewMap />} />
          </Routes>
        </AnimatePresence>
      </main>

      <BackToTop />

      {/* REFINED FOOTER */}
      <footer className="bg-black/40 backdrop-blur-md py-12 px-4 md:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => navigate("/")}>
            <img 
              src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w" 
              alt="GeoGlobe" 
              className="h-12 w-12 object-contain group-hover:scale-110 transition-transform mb-2" 
            />
            <span className="geoglobe-text text-geoCyan font-black text-xl uppercase italic tracking-tighter">GeoGlobe</span>
          </div>
          
          <div className="flex justify-center gap-8">
            <a href="https://youtube.com/@geoglobe23" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-geoCyan transition-all hover:-translate-y-1">
              <PlayCircle className="w-7 h-7" />
            </a>
            <a href="https://www.tiktok.com/@geoglobe23" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-geoCyan transition-all hover:-translate-y-1">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.89 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            </a>
            <a href="https://x.com/GeoGlobe23" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-geoCyan transition-all hover:-translate-y-1">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.instagram.com/geoglobe23" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-geoCyan transition-all hover:-translate-y-1">
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">Exploring the World's Mysteries</p>
            <p className="text-gray-700 text-[10px]">© 2026 GEOGLOBE BY SADIQ MUHAMMAD MUSTAPHA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
