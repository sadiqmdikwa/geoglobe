import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Globe as GlobeIcon, Search, ZoomIn, ZoomOut, RotateCcw, Trophy, ArrowLeft, MapPin, Waves, Snowflake, Sparkles } from "lucide-react";
import AdBanner from "./AdBanner";

export interface FeatureData {
  name: string;
  code: string;
  type: "country" | "water" | "ice";
  capital?: string;
  population?: string;
  region: string;
  area: string;
  languages?: string;
  desc?: string;
  lat: number;
  lng: number;
}

const FEATURE_DATABASE: { [key: string]: FeatureData } = {
  "Nigeria": { name: "Nigeria", code: "NG", type: "country", capital: "Abuja", population: "218,541,212 people", region: "Africa • Western Africa", area: "923,768 km²", languages: "English", lat: 9.082, lng: 8.6753 },
  "Mali": { name: "Mali", code: "ML", type: "country", capital: "Bamako", population: "21,900,000 people", region: "Africa • Western Africa", area: "1,240,192 km²", languages: "French, Bambara", lat: 17.5707, lng: -3.9962 },
  "Algeria": { name: "Algeria", code: "DZ", type: "country", capital: "Algiers", population: "44,900,000 people", region: "Africa • Northern Africa", area: "2,381,741 km²", languages: "Arabic, Berber", lat: 28.0339, lng: 1.6596 },
  "Niger": { name: "Niger", code: "NE", type: "country", capital: "Niamey", population: "25,250,000 people", region: "Africa • Western Africa", area: "1,267,000 km²", languages: "French, Hausa", lat: 17.6078, lng: 8.0817 },
  "Chad": { name: "Chad", code: "TD", type: "country", capital: "N'Djamena", population: "17,180,000 people", region: "Africa • Central Africa", area: "1,284,000 km²", languages: "French, Arabic", lat: 15.4542, lng: 18.7322 },
  "Sudan": { name: "Sudan", code: "SD", type: "country", capital: "Khartoum", population: "45,660,000 people", region: "Africa • Northern Africa", area: "1,886,068 km²", languages: "Arabic, English", lat: 12.8628, lng: 30.2176 },
  "Senegal": { name: "Senegal", code: "SN", type: "country", capital: "Dakar", population: "16,880,000 people", region: "Africa • Western Africa", area: "196,712 km²", languages: "French, Wolof", lat: 14.4974, lng: -14.4524 },
  "Ghana": { name: "Ghana", code: "GH", type: "country", capital: "Accra", population: "32,830,000 people", region: "Africa • Western Africa", area: "238,535 km²", languages: "English", lat: 7.9465, lng: -1.0232 },
  "Morocco": { name: "Morocco", code: "MA", type: "country", capital: "Rabat", population: "37,080,000 people", region: "Africa • Northern Africa", area: "446,550 km²", languages: "Arabic, Berber", lat: 31.7917, lng: -7.0926 },
  "Ethiopia": { name: "Ethiopia", code: "ET", type: "country", capital: "Addis Ababa", population: "120,300,000 people", region: "Africa • Eastern Africa", area: "1,104,300 km²", languages: "Amharic", lat: 9.145, lng: 40.4897 },
  "Kenya": { name: "Kenya", code: "KE", type: "country", capital: "Nairobi", population: "53,010,000 people", region: "Africa • Eastern Africa", area: "580,367 km²", languages: "Swahili, English", lat: -0.0236, lng: 37.9062 },
  "United States": { name: "United States", code: "US", type: "country", capital: "Washington, D.C.", population: "333,287,557 people", region: "Americas • North America", area: "9,833,520 km²", languages: "English", lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { name: "United Kingdom", code: "GB", type: "country", capital: "London", population: "67,596,281 people", region: "Europe • Northern Europe", area: "242,495 km²", languages: "English", lat: 55.3781, lng: -3.4360 },
  "France": { name: "France", code: "FR", type: "country", capital: "Paris", population: "64,756,584 people", region: "Europe • Western Europe", area: "551,695 km²", languages: "French", lat: 46.2276, lng: 2.2137 },
  "Germany": { name: "Germany", code: "DE", type: "country", capital: "Berlin", population: "83,369,843 people", region: "Europe • Central Europe", area: "357,022 km²", languages: "German", lat: 51.1657, lng: 10.4515 },
  "Spain": { name: "Spain", code: "ES", type: "country", capital: "Madrid", population: "47,420,000 people", region: "Europe • Southern Europe", area: "505,990 km²", languages: "Spanish", lat: 40.4637, lng: -3.7492 },
  "Italy": { name: "Italy", code: "IT", type: "country", capital: "Rome", population: "59,110,000 people", region: "Europe • Southern Europe", area: "301,340 km²", languages: "Italian", lat: 41.8719, lng: 12.5674 },
  "Japan": { name: "Japan", code: "JP", type: "country", capital: "Tokyo", population: "123,951,692 people", region: "Asia • Eastern Asia", area: "377,975 km²", languages: "Japanese", lat: 36.2048, lng: 138.2529 },
  "Brazil": { name: "Brazil", code: "BR", type: "country", capital: "Brasília", population: "215,313,498 people", region: "Americas • South America", area: "8,515,767 km²", languages: "Portuguese", lat: -14.2350, lng: -51.9253 },
  "Australia": { name: "Australia", code: "AU", type: "country", capital: "Canberra", population: "26,068,792 people", region: "Oceania • Australasia", area: "7,692,024 km²", languages: "English", lat: -25.2744, lng: 133.7751 },
  "South Africa": { name: "South Africa", code: "ZA", type: "country", capital: "Pretoria / Cape Town", population: "59,392,255 people", region: "Africa • Southern Africa", area: "1,221,037 km²", languages: "Zulu, Xhosa, Afrikaans, English", lat: -30.5595, lng: 22.9375 },
  "Canada": { name: "Canada", code: "CA", type: "country", capital: "Ottawa", population: "38,250,000 people", region: "Americas • North America", area: "9,984,670 km²", languages: "English, French", lat: 56.1304, lng: -106.3468 },
  "Egypt": { name: "Egypt", code: "EG", type: "country", capital: "Cairo", population: "110,990,103 people", region: "Africa • Northern Africa", area: "1,010,408 km²", languages: "Arabic", lat: 26.8206, lng: 30.8025 },
  "India": { name: "India", code: "IN", type: "country", capital: "New Delhi", population: "1,428,627,663 people", region: "Asia • Southern Asia", area: "3,287,263 km²", languages: "Hindi, English", lat: 20.5937, lng: 78.9629 },
  "China": { name: "China", code: "CN", type: "country", capital: "Beijing", population: "1,412,000,000 people", region: "Asia • Eastern Asia", area: "9,596,961 km²", languages: "Mandarin Chinese", lat: 35.8617, lng: 104.1954 },
  "Atlantic Ocean": { name: "Atlantic Ocean", code: "AO", type: "water", region: "Global Water Basin", area: "106,460,000 km²", desc: "The world's second-largest ocean basin.", lat: 14.59, lng: -28.67 },
  "Pacific Ocean": { name: "Pacific Ocean", code: "PO", type: "water", region: "Global Water Basin", area: "165,250,000 km²", desc: "The world's largest and deepest ocean basin.", lat: 0, lng: -160 },
  "Indian Ocean": { name: "Indian Ocean", code: "IO", type: "water", region: "Global Water Basin", area: "70,560,000 km²", desc: "Bounded by Asia, Africa, Australia, and the Southern Ocean.", lat: -20, lng: 80 },
  "Antarctica": { name: "Antarctica", code: "AQ", type: "ice", region: "South Polar Zone", area: "14,200,000 km²", desc: "Earth's southernmost continent containing 90% of global ice.", lat: -82.86, lng: 135.0 },
  "Greenland": { name: "Greenland", code: "GL", type: "ice", capital: "Nuuk", population: "56,000 people", region: "North Polar Zone", area: "2,166,086 km²", languages: "Greenlandic", desc: "Massive autonomous polar island covered by the Greenland Ice Sheet.", lat: 71.70, lng: -42.60 }
};

export default function GlobeExplorer() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<FeatureData | null>(FEATURE_DATABASE["Nigeria"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSelect = (countryName: string) => {
    const item = FEATURE_DATABASE[countryName];
    if (item) {
      setSelectedCountry(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20"
    >
      {/* Top Navigation Row */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 active:scale-95 shadow-sm group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Minimalist Page Header */}
      <header className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-geoCyan font-semibold uppercase tracking-wider text-xs mb-2 bg-geoCyan/10 px-3 py-1 rounded-full border border-geoCyan/20">
            <GlobeIcon className="w-3.5 h-3.5" />
            Cartographic Atlas
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight mb-2">
            3D Globe Explorer
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Explore world countries, oceans, and polar regions with interactive popup cards and detailed preview modals.
          </p>
        </div>
        <div className="lg:col-span-5">
          <AdBanner slotId="globe-explorer-header-slot" className="my-0" />
        </div>
      </header>

      {/* Map Card Shell (Matching InteractiveMap shell style) */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden p-0 h-[650px] md:h-[720px] flex flex-col items-center justify-center">
        {/* Top Floating Search & Quiz Bar */}
        <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-gray-900/80 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl shadow-2xl">
            <Search className="w-4 h-4 text-gray-400" />
            <select
              onChange={(e) => handleSearchSelect(e.target.value)}
              value={selectedCountry?.name || ""}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-gray-900 text-gray-400">Select location to explore...</option>
              {Object.keys(FEATURE_DATABASE).map(name => (
                <option key={name} value={name} className="bg-gray-900 text-white">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="pointer-events-auto ml-auto">
            <button
              onClick={() => navigate("/game")}
              className="inline-flex items-center gap-2 bg-geoYellow hover:bg-geoCyan text-gray-950 px-5 py-2 rounded-full border border-geoYellow/40 transition-all text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Start Quiz</span>
            </button>
          </div>
        </div>

        {/* Interactive Globe Visual Centerpiece with Clickable Country Nodes */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#060a12] via-[#091120] to-[#060a12]">
          {/* Animated 3D Globe representation with glowing pins */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-[#122b39] via-[#0b1c28] to-[#060f16] border-4 border-geoCyan/40 shadow-[0_0_80px_rgba(66,194,203,0.35)] flex items-center justify-center overflow-hidden animate-float">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(66,194,203,0.2)_0,transparent_70%)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-[1px] bg-geoCyan/30 absolute"></div>
              <div className="h-full w-[1px] bg-geoCyan/30 absolute"></div>
              <div className="w-[80%] h-[80%] rounded-full border border-dashed border-geoCyan/30 absolute"></div>
            </div>

            {/* Selected Country Pulsing Marker Pin */}
            <div className="absolute flex flex-col items-center cursor-pointer group" onClick={() => setIsModalOpen(true)}>
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-geoYellow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-geoYellow border-2 border-white shadow-lg"></span>
              </span>
              <div className="mt-2 bg-gray-950/90 border border-geoYellow/50 text-geoYellow px-3 py-1 rounded-full text-xs font-black shadow-2xl backdrop-blur-md">
                📍 {selectedCountry?.name}
              </div>
            </div>
          </div>

          {/* Compact Popup Card Above Map (Just like InteractiveMap!) */}
          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute bottom-20 z-30 max-w-sm w-[90%] bg-gray-950/95 text-white rounded-3xl p-4 border border-geoYellow/40 shadow-2xl backdrop-blur-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                {selectedCountry.type === "country" ? (
                  <img src={`https://flagcdn.com/w320/${selectedCountry.code.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                ) : selectedCountry.type === "water" ? (
                  <Waves className="w-6 h-6 text-geoCyan" />
                ) : (
                  <Snowflake className="w-6 h-6 text-cyan-200" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <span className="text-[10px] font-bold text-geoYellow uppercase tracking-wider block">{selectedCountry.region}</span>
                <h4 className="font-extrabold text-sm text-white truncate">{selectedCountry.name}</h4>
                <p className="text-[11px] text-gray-400 truncate">{selectedCountry.capital || selectedCountry.area}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-3.5 py-2 rounded-full text-xs shrink-0 transition-all cursor-pointer shadow-md"
              >
                Read More ➔
              </button>
            </motion.div>
          )}

          <div className="absolute bottom-5 left-5 z-30 flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-geoYellow" />
            <span>Select any location to view popup card & details</span>
          </div>
        </div>
      </div>

      {/* Video Preview Modal Style Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCountry && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080e1a] border border-white/20 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Banner / Modal Header */}
              <div className="relative p-6 bg-gradient-to-br from-gray-900 to-black border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/20 shadow">
                    {selectedCountry.type === "country" ? (
                      <img src={`https://flagcdn.com/w320/${selectedCountry.code.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                    ) : selectedCountry.type === "water" ? (
                      <div className="w-full h-full bg-geoCyan/20 flex items-center justify-center text-geoCyan"><Waves className="w-5 h-5" /></div>
                    ) : (
                      <div className="w-full h-full bg-cyan-200/20 flex items-center justify-center text-cyan-200"><Snowflake className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedCountry.name}</h3>
                    <span className="text-xs font-mono text-geoCyan font-bold uppercase">{selectedCountry.region}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Stats */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto video-preview-scroll text-sm">
                {selectedCountry.capital && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Capital</span>
                    <span className="font-bold text-white">{selectedCountry.capital}</span>
                  </div>
                )}
                {selectedCountry.population && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Population</span>
                    <span className="font-bold text-white">{selectedCountry.population}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Total Area</span>
                  <span className="font-bold text-white">{selectedCountry.area}</span>
                </div>
                {selectedCountry.languages && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Language(s)</span>
                    <span className="font-bold text-white">{selectedCountry.languages}</span>
                  </div>
                )}
                {selectedCountry.desc && (
                  <div className="pt-1">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold block mb-1">Geographic Overview</span>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedCountry.desc}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 bg-black/40 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/map?lat=${selectedCountry.lat}&lng=${selectedCountry.lng}&from=explorer`);
                  }}
                  className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3.5 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  View on Interactive Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
