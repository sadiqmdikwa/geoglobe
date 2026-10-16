import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Globe, { GlobeInstance } from "globe.gl";
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
  color: string;
}

const FEATURE_DATABASE: { [key: string]: FeatureData } = {
  "Nigeria": { name: "Nigeria", code: "NG", type: "country", capital: "Abuja", population: "218,541,212 people", region: "Africa • Western Africa", area: "923,768 km²", languages: "English", lat: 9.082, lng: 8.6753, color: "#F4D03F" },
  "United States of America": { name: "United States", code: "US", type: "country", capital: "Washington, D.C.", population: "333,287,557 people", region: "Americas • North America", area: "9,833,520 km²", languages: "English", lat: 37.0902, lng: -95.7129, color: "#42C2CB" },
  "United Kingdom": { name: "United Kingdom", code: "GB", type: "country", capital: "London", population: "67,596,281 people", region: "Europe • Northern Europe", area: "242,495 km²", languages: "English", lat: 55.3781, lng: -3.4360, color: "#34d399" },
  "France": { name: "France", code: "FR", type: "country", capital: "Paris", population: "64,756,584 people", region: "Europe • Western Europe", area: "551,695 km²", languages: "French", lat: 46.2276, lng: 2.2137, color: "#fb7185" },
  "Germany": { name: "Germany", code: "DE", type: "country", capital: "Berlin", population: "83,369,843 people", region: "Europe • Central Europe", area: "357,022 km²", languages: "German", lat: 51.1657, lng: 10.4515, color: "#a78bfa" },
  "Japan": { name: "Japan", code: "JP", type: "country", capital: "Tokyo", population: "123,951,692 people", region: "Asia • Eastern Asia", area: "377,975 km²", languages: "Japanese", lat: 36.2048, lng: 138.2529, color: "#38bdf8" },
  "Brazil": { name: "Brazil", code: "BR", type: "country", capital: "Brasília", population: "215,313,498 people", region: "Americas • South America", area: "8,515,767 km²", languages: "Portuguese", lat: -14.2350, lng: -51.9253, color: "#facc15" },
  "Australia": { name: "Australia", code: "AU", type: "country", capital: "Canberra", population: "26,068,792 people", region: "Oceania • Australasia", area: "7,692,024 km²", languages: "English", lat: -25.2744, lng: 133.7751, color: "#fb923c" },
  "South Africa": { name: "South Africa", code: "ZA", type: "country", capital: "Pretoria / Cape Town", population: "59,392,255 people", region: "Africa • Southern Africa", area: "1,221,037 km²", languages: "Zulu, Xhosa, Afrikaans, English", lat: -30.5595, lng: 22.9375, color: "#e879f9" },
  "Canada": { name: "Canada", code: "CA", type: "country", capital: "Ottawa", population: "38,250,000 people", region: "Americas • North America", area: "9,984,670 km²", languages: "English, French", lat: 56.1304, lng: -106.3468, color: "#34d399" },
  "Egypt": { name: "Egypt", code: "EG", type: "country", capital: "Cairo", population: "110,990,103 people", region: "Africa • Northern Africa", area: "1,010,408 km²", languages: "Arabic", lat: 26.8206, lng: 30.8025, color: "#f4d03f" },
  "India": { name: "India", code: "IN", type: "country", capital: "New Delhi", population: "1,428,627,663 people", region: "Asia • Southern Asia", area: "3,287,263 km²", languages: "Hindi, English", lat: 20.5937, lng: 78.9629, color: "#fb7185" },
  "China": { name: "China", code: "CN", type: "country", capital: "Beijing", population: "1,412,000,000 people", region: "Asia • Eastern Asia", area: "9,596,961 km²", languages: "Mandarin Chinese", lat: 35.8617, lng: 104.1954, color: "#42C2CB" }
};

const COUNTRY_COLORS = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#457b9d", "#1d3557", "#6a040f", "#38bdf8", "#a78bfa"];

function getCountryColor(name: string): string {
  if (!name) return "#2a9d8f";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COUNTRY_COLORS[hash % COUNTRY_COLORS.length];
}

export default function GlobeExplorer() {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<GlobeInstance | null>(null);
  const navigate = useNavigate();

  const [selectedFeature, setSelectedFeature] = useState<FeatureData | null>(FEATURE_DATABASE["Nigeria"]);
  const [hoveredPolygon, setHoveredPolygon] = useState<any | null>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          setCountriesGeoJson(data.features);
        }
      })
      .catch(err => console.warn("Failed to load country polygons:", err));
  }, []);

  useEffect(() => {
    if (!globeContainerRef.current) return;

    const globe = Globe()(globeContainerRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .showAtmosphere(true)
      .atmosphereColor("#42C2CB")
      .atmosphereAltitude(0.18)
      .polygonsData(countriesGeoJson)
      .polygonAltitude(d => d === hoveredPolygon ? 0.04 : (selectedFeature && (d as any).properties?.NAME === selectedFeature.name ? 0.03 : 0.01))
      .polygonCapColor(d => {
        const name = (d as any).properties?.NAME;
        if (selectedFeature && name === selectedFeature.name) return "#F4D03F"; // Gold fill on tap
        if (d === hoveredPolygon) return "rgba(66, 194, 203, 0.8)"; // Bright cyan on hover
        return getCountryColor(name);
      })
      .polygonSideColor(() => "rgba(15, 23, 42, 0.8)")
      .polygonStrokeColor(d => {
        const name = (d as any).properties?.NAME;
        if (selectedFeature && name === selectedFeature.name) return "#ffffff";
        if (d === hoveredPolygon) return "#F4D03F";
        return "rgba(66, 194, 203, 0.35)";
      })
      .onPolygonHover(polygon => {
        setHoveredPolygon(polygon);
      })
      .onPolygonClick(polygon => {
        const props = (polygon as any).properties;
        const name = props?.NAME || "Selected Country";
        const item: FeatureData = FEATURE_DATABASE[name] || {
          name,
          code: props?.ISO_A2 || "UN",
          type: "country",
          capital: "Capital Region",
          population: "Estimated 10M+ people",
          region: "Global Frontier",
          area: "50,000+ km²",
          languages: "Official / Regional",
          lat: 10,
          lng: 10,
          color: "#42C2CB"
        };
        setSelectedFeature(item);
        if (globeInstanceRef.current) {
          globeInstanceRef.current.pointOfView({ lat: item.lat, lng: item.lng, altitude: 1.4 }, 1200);
        }
      });

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = true;

    // Stop auto-spinning instantly when user starts dragging or clicking the globe
    const stopAutoRotate = () => {
      if (controls.autoRotate) {
        controls.autoRotate = false;
      }
    };
    controls.addEventListener("start", stopAutoRotate);
    globeContainerRef.current.addEventListener("pointerdown", stopAutoRotate);

    globeInstanceRef.current = globe;

    const handleResize = () => {
      if (globeContainerRef.current) {
        globe.width(globeContainerRef.current.clientWidth);
        globe.height(globeContainerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      try {
        if (globeContainerRef.current) {
          globeContainerRef.current.innerHTML = "";
        }
      } catch (e) {
        // cleanup
      }
    };
  }, [countriesGeoJson, selectedFeature, hoveredPolygon]);

  const handleZoomIn = () => {
    if (!globeInstanceRef.current) return;
    const pov = globeInstanceRef.current.pointOfView();
    const nextAlt = Math.max(0.8, pov.altitude - 0.4);
    globeInstanceRef.current.pointOfView({ ...pov, altitude: nextAlt }, 600);
  };

  const handleZoomOut = () => {
    if (!globeInstanceRef.current) return;
    const pov = globeInstanceRef.current.pointOfView();
    const nextAlt = Math.min(3.5, pov.altitude + 0.4);
    globeInstanceRef.current.pointOfView({ ...pov, altitude: nextAlt }, 600);
  };

  const handleResetView = () => {
    if (!globeInstanceRef.current) return;
    globeInstanceRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1000);
    setSelectedFeature(null);
  };

  const handleSearchSelect = (countryName: string) => {
    const item = FEATURE_DATABASE[countryName];
    if (item && globeInstanceRef.current) {
      setSelectedFeature(item);
      globeInstanceRef.current.pointOfView({ lat: item.lat, lng: item.lng, altitude: 1.4 }, 1200);
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
            Hover to inspect country borders, click any country to fill with color and zoom in.
          </p>
        </div>
        <div className="lg:col-span-5">
          <AdBanner slotId="globe-explorer-header-slot" className="my-0" />
        </div>
      </header>

      {/* Map Card Shell */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden p-0 h-[650px] md:h-[720px] flex items-center justify-center">
        {/* Top Floating Search & Quiz Bar */}
        <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-gray-900/80 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl shadow-2xl">
            <Search className="w-4 h-4 text-gray-400" />
            <select
              onChange={(e) => handleSearchSelect(e.target.value)}
              value={selectedFeature?.name || ""}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-gray-900 text-gray-400">Select country to explore...</option>
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

        {/* 3D Globe Container */}
        <div ref={globeContainerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Control Overlay Instructions */}
        <div className="absolute bottom-5 left-5 z-30 flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
          <span className="text-geoCyan font-bold">hover</span> highlight • <span className="text-geoCyan font-bold">click</span> select & fill • <span className="text-geoCyan font-bold">drag</span> rotate
        </div>

        {/* Bottom Left Floating Zoom Buttons */}
        <div className="absolute bottom-16 left-5 z-30 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60 text-lg font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60 text-lg font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleResetView}
            className="w-10 h-10 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-geoYellow" />
          </button>
        </div>

        {/* Compact Popup Card Above Map */}
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-20 z-30 max-w-sm w-[90%] bg-gray-950/95 text-white rounded-3xl p-4 border border-geoYellow/40 shadow-2xl backdrop-blur-2xl flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              {selectedFeature.type === "country" ? (
                <img src={`https://flagcdn.com/w320/${selectedFeature.code.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
              ) : selectedFeature.type === "water" ? (
                <Waves className="w-6 h-6 text-geoCyan" />
              ) : (
                <Snowflake className="w-6 h-6 text-cyan-200" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <span className="text-[10px] font-bold text-geoYellow uppercase tracking-wider block">{selectedFeature.region}</span>
              <h4 className="font-extrabold text-sm text-white truncate">{selectedFeature.name}</h4>
              <p className="text-[11px] text-gray-400 truncate">{selectedFeature.capital || selectedFeature.area}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-3.5 py-2 rounded-full text-xs shrink-0 transition-all cursor-pointer shadow-md"
            >
              Read More ➔
            </button>
          </motion.div>
        )}
      </div>

      {/* Video Preview Modal Style Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedFeature && (
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
                    {selectedFeature.type === "country" ? (
                      <img src={`https://flagcdn.com/w320/${selectedFeature.code.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                    ) : selectedFeature.type === "water" ? (
                      <div className="w-full h-full bg-geoCyan/20 flex items-center justify-center text-geoCyan"><Waves className="w-5 h-5" /></div>
                    ) : (
                      <div className="w-full h-full bg-cyan-200/20 flex items-center justify-center text-cyan-200"><Snowflake className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedFeature.name}</h3>
                    <span className="text-xs font-mono text-geoCyan font-bold uppercase">{selectedFeature.region}</span>
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
                {selectedFeature.capital && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Capital</span>
                    <span className="font-bold text-white">{selectedFeature.capital}</span>
                  </div>
                )}
                {selectedFeature.population && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Population</span>
                    <span className="font-bold text-white">{selectedFeature.population}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Total Area</span>
                  <span className="font-bold text-white">{selectedFeature.area}</span>
                </div>
                {selectedFeature.languages && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Language(s)</span>
                    <span className="font-bold text-white">{selectedFeature.languages}</span>
                  </div>
                )}
                {selectedFeature.desc && (
                  <div className="pt-1">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold block mb-1">Geographic Overview</span>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedFeature.desc}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 bg-black/40 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/map?lat=${selectedFeature.lat}&lng=${selectedFeature.lng}&from=explorer`);
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
