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
// 👇 IMPORT YOUR NEW PREVIEW MAP HERE
import PreviewMap from "./components/PreviewMap"; 

function Home() {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
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
        className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden flex items-center justify-center text-center px-6 shadow-2xl"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000" 
               alt="World Map Background" 
               className="w-full h-full object-cover scale-105"
               referrerPolicy="no-referrer" />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-7xl text-white font-bold tracking-tight mb-6"
          >
            Explore the <span className="text-geoCyan">World's</span> Mysteries
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Discover border anomalies, fascinating country facts, and interactive maps through our premium geography platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <button 
              onClick={() => navigate("/videos")}
              className="group bg-geoCyan hover:bg-geoYellow text-gray-900 px-10 py-4 rounded-full mt-10 font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] flex items-center gap-2 mx-auto w-fit"
            >
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          onClick={() => navigate("/videos")}
          className="relative bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-geoCyan/30 transition-colors group cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-geoCyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-geoCyan/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <PlayCircle className="text-geoCyan w-6 h-6" />
          </div>
          <h3 className="text-white text-xl font-bold mb-3 group-hover:text-geoCyan transition-colors">Video Library</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Watch our latest map animations and high-production geography series.
          </p>
          <div className="flex items-center text-geoCyan text-xs font-bold uppercase tracking-wider gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Browse Videos <ArrowRight className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Card 2: Interactive Map */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          onClick={() => navigate("/map")}
          className="relative bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-geoCyan/30 transition-colors group cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-geoCyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-geoCyan/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Map className="text-geoCyan w-6 h-6" />
          </div>
          <h3 className="text-white text-xl font-bold mb-3 group-hover:text-geoCyan transition-colors">Interactive Map</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Explore the globe and find videos pinned to exact geographical coordinates.
          </p>
          <div className="flex items-center text-geoCyan text-xs font-bold uppercase tracking-wider gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Open Map <ArrowRight className="w-3 h-3" />
          </div>
        </motion.div>

        {/* Card 3: Geo Game */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          onClick={() => navigate("/game")}
          className="relative bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-geoCyan/30 transition-colors group cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-geoCyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="bg-geoCyan/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Trophy className="text-geoCyan w-6 h-6" />
          </div>
          <h3 className="text-white text-xl font-bold mb-3 group-hover:text-geoCyan transition-colors">Geo Game</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Test your knowledge in our ultimate "Guess the Country" challenge.
          </p>
          <div className="flex items-center text-geoCyan text-xs font-bold uppercase tracking-wider gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Play Now <ArrowRight className="w-3 h-3" />
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
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Header onNavigate={handleNavigate} currentView={getViewFromPath(location.pathname)} />
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<VideoLibrary onBack={() => navigate("/")} />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/game" element={<GeoGame />} />
            <Route path="/contact" element={<AboutContact />} />
            
            {/* 👇 THIS IS YOUR SECRET ADMIN PORTAL ROUTE 👇 */}
            <Route path="/admin-portal-xyz" element={<SuggestionForm />} />

            {/* 👇 THIS IS THE NEW PREVIEW MAP ROUTE 👇 */}
            <Route path="/preview-map" element={<PreviewMap />} />
          </Routes>
        </AnimatePresence>
      </main>

      <BackToTop />

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 md:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-1 cursor-pointer" onClick={() => navigate("/")}>
            <img src="https://lh3.googleusercontent.com/d/1rVa6ZpCFASDIAkgKEwaUtbb7qKhQROsX" alt="GeoGlobe" className="h-14 w-14 object-contain" />
            <span className="geoglobe-text text-geoCyan font-bold text-2xl">GeoGlobe</span>
          </div>
          
          <div className="flex justify-center gap-8">
            <a href="https://youtube.com/@geoglobe23?si=05p8Xhx0ZrjFezJe" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-geoCyan transition-all hover:scale-110">
              <PlayCircle className="w-7 h-7" />
            </a>
            <a href="https://www.tiktok.com/@geoglobe23?_r=1&_t=ZS-94aKE23usMi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-geoCyan transition-all hover:scale-110">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
            </a>
            <a href="https://x.com/GeoGlobe23" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-geoCyan transition-all hover:scale-110">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.instagram.com/geoglobe23?igsh=ZmE0aG16aXV2NzJq" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-geoCyan transition-all hover:scale-110">
              <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.facebook.com/share/1CRAgwF8TH/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-geoCyan transition-all hover:scale-110">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-500 text-sm">© 2026 GeoGlobe. All rights reserved.</p>
            <p className="text-gray-600 text-xs uppercase tracking-[0.2em]">Exploring the World's Mysteries</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
