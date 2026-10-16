import { motion, AnimatePresence, type Variants } from "motion/react";
import { useLayoutEffect, useRef } from "react";
import { PlayCircle, Map as MapIcon, Trophy, ArrowRight, MapPin, Globe, Flag } from "lucide-react";
import { Routes, Route, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import VideoLibrary from "./components/VideoLibrary";
import Header from "./components/Header";
import InteractiveMap from "./components/InteractiveMap";
import PreviewMap from "./components/PreviewMap";
import GeoGame from "./components/GeoGame";
import AboutContact from "./components/AboutContact";
import SuggestionForm from "./components/SuggestionForm";
import Portfolio from "./components/Portfolio";
import BackToTop from "./components/BackToTop";
import ScrollProgress from "./components/ScrollProgress";

function RouteScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const previousLocation = useRef({ key: location.key, pathname: location.pathname });

  useLayoutEffect(() => {
    const previous = previousLocation.current;
    positions.current.set(previous.key, window.scrollY);

    if (location.key !== previous.key) {
      if (navigationType === "POP") {
        window.scrollTo(0, positions.current.get(location.key) ?? 0);
      } else if (location.pathname !== previous.pathname) {
        window.scrollTo(0, 0);
      }
      previousLocation.current = { key: location.key, pathname: location.pathname };
    }
  }, [location.key, location.pathname, navigationType]);

  useLayoutEffect(() => {
    const originalBehavior = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = originalBehavior;
    };
  }, []);

  return null;
}

function Home() {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      {/* Ultra-Minimalist Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-[500px] md:h-[580px] rounded-3xl overflow-hidden flex items-center justify-center text-center px-6 shadow-2xl border border-white/10"
      >
        {/* Background Map Image & Refined Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000"
            alt="World Map Background"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/90 via-[#090d16]/75 to-[#090d16]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          {/* Minimalist Atlas Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-geoCyan animate-pulse"></span>
            <span>Interactive Cartography & Frontier Atlas</span>
          </div>

          {/* Clean Logo Emblem */}
          <motion.img
            src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w"
            alt="GeoGlobe Emblem"
            className="h-20 w-20 md:h-24 md:w-24 object-contain mb-5 filter drop-shadow-[0_4px_15px_rgba(66,194,203,0.25)]"
          />

          <h1 className="text-3xl sm:text-5xl md:text-6xl text-white font-extrabold tracking-tight mb-5 leading-tight">
            Explore the <span className="text-geoCyan">World's</span> Mysteries
          </h1>

          <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-8">
            Documentaries, coordinate-pinned border anomalies, enclaves, and gamified trivia powered by free open-source cartography.
          </p>

          {/* Primary CTA Button */}
          <button
            onClick={() => navigate("/map")}
            className="bg-geoCyan hover:bg-geoYellow text-gray-950 px-8 py-3.5 rounded-xl font-bold text-sm md:text-base transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-geoCyan/20 active:scale-98"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.section>

      {/* Live Statistics Counter Cards */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl">
          <MapPin className="w-6 h-6 text-geoCyan mb-2" />
          <span className="text-2xl md:text-3xl font-black text-white tracking-tight">100+</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">Anomalies Mapped</span>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl">
          <Globe className="w-6 h-6 text-geoYellow mb-2" />
          <span className="text-2xl md:text-3xl font-black text-white tracking-tight">6</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">World Regions</span>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl">
          <Flag className="w-6 h-6 text-geoCyan mb-2" />
          <span className="text-2xl md:text-3xl font-black text-white tracking-tight">197</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">Verified Flags</span>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl">
          <Trophy className="w-6 h-6 text-geoYellow mb-2" />
          <span className="text-2xl md:text-3xl font-black text-white tracking-tight">100%</span>
          <span className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">Free & Open</span>
        </div>
      </motion.section>

      {/* Feature Cards Grid (3 Minimalist Cards) */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Card 1: Video Library */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          onClick={() => navigate("/videos")}
          className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-geoCyan/50 transition-all group cursor-pointer shadow-lg flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-geoCyan/10 text-geoCyan flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <PlayCircle className="w-6 h-6" />
          </div>
          <h3 className="text-white text-lg font-bold mb-2 group-hover:text-geoCyan transition-colors">
            Video Library
          </h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 flex-grow">
            Watch curated animations and documentary deep-dives exploring enclaves, disputed frontiers, and global quirks.
          </p>
          <div className="flex items-center text-geoCyan text-xs font-semibold gap-1.5 mt-auto">
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Interactive Map */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          onClick={() => navigate("/map")}
          className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-geoCyan/50 transition-all group cursor-pointer shadow-lg flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-geoCyan/10 text-geoCyan flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <MapIcon className="w-6 h-6" />
          </div>
          <h3 className="text-white text-lg font-bold mb-2 group-hover:text-geoCyan transition-colors">
            Interactive Map
          </h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 flex-grow">
            Navigate the globe with keyless Dark, Natural & High-Res Satellite maps. Click any anomaly marker to inspect coordinates and launch videos.
          </p>
          <div className="flex items-center text-geoCyan text-xs font-semibold gap-1.5 mt-auto">
            <span>Open Interactive Map</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 3: Geo Game */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5 }}
          onClick={() => navigate("/game")}
          className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-geoCyan/50 transition-all group cursor-pointer shadow-lg flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-geoCyan/10 text-geoCyan flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-white text-lg font-bold mb-2 group-hover:text-geoCyan transition-colors">
            Geo Game
          </h3>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 flex-grow">
            Test your knowledge with Fisher-Yates true random trivia, Web Speech audio answer pronunciation, and coordinate map previews.
          </p>
          <div className="flex items-center text-geoCyan text-xs font-semibold gap-1.5 mt-auto">
            <span>Play Trivia</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased">
      <RouteScrollRestoration />
      <ScrollProgress />
      <Header />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/videos" element={<VideoLibrary onBack={() => navigate("/")} />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/game" element={<GeoGame />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/contact" element={<AboutContact />} />
            <Route path="/admin-portal-xyz" element={<SuggestionForm />} />
            <Route path="/preview-map" element={<PreviewMap />} />
          </Routes>
        </AnimatePresence>
      </main>

      <BackToTop />

      {/* Minimalist Ultra-Professional Footer */}
      <footer className="bg-[#070a12] py-10 px-4 md:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo placed horizontally beside text */}
          <div
            className="flex flex-row items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src="https://lh3.googleusercontent.com/d/1PYQ705DpgwDPAV7kERrpa8a0m8hFdq5w"
              alt="GeoGlobe Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="geoglobe-text text-geoCyan font-bold text-xl group-hover:text-geoYellow transition-colors">
              GeoGlobe
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a
              href="https://youtube.com/@geoglobe23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube text-lg"></i>
            </a>
            <a
              href="https://www.tiktok.com/@geoglobe23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="TikTok"
            >
              <i className="fa-brands fa-tiktok text-lg"></i>
            </a>
            <a
              href="https://x.com/GeoGlobe23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="X Twitter"
            >
              <i className="fa-brands fa-x-twitter text-lg"></i>
            </a>
            <a
              href="https://www.instagram.com/geoglobe23"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram text-lg"></i>
            </a>
            <a
              href="https://www.facebook.com/share/1CRAgwF8TH/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-geoCyan transition-colors"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook text-lg"></i>
            </a>
          </div>

          {/* Clean Copyright */}
          <div className="text-center sm:text-right text-xs text-gray-500">
            <span>&copy; 2026 GeoGlobe. Free & Open Cartography.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
