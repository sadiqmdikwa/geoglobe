import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Globe, { GlobeInstance } from "globe.gl";
import { X, Globe as GlobeIcon, Search, ZoomIn, ZoomOut, RotateCcw, Trophy, ArrowLeft, MapPin } from "lucide-react";

export interface CountryData {
  name: string;
  code: string;
  capital: string;
  population: string;
  region: string;
  area: string;
  languages: string;
  lat: number;
  lng: number;
  color: string;
}

const COUNTRY_DATABASE: { [key: string]: CountryData } = {
  "Nigeria": { name: "Nigeria", code: "NG", capital: "Abuja", population: "218,541,212 people", region: "Africa • Western Africa", area: "923,768 km²", languages: "English", lat: 9.082, lng: 8.6753, color: "#F4D03F" },
  "United States of America": { name: "United States", code: "US", capital: "Washington, D.C.", population: "333,287,557 people", region: "Americas • North America", area: "9,833,520 km²", languages: "English", lat: 37.0902, lng: -95.7129, color: "#42C2CB" },
  "United Kingdom": { name: "United Kingdom", code: "GB", capital: "London", population: "67,596,281 people", region: "Europe • Northern Europe", area: "242,495 km²", languages: "English", lat: 55.3781, lng: -3.4360, color: "#34d399" },
  "France": { name: "France", code: "FR", capital: "Paris", population: "64,756,584 people", region: "Europe • Western Europe", area: "551,695 km²", languages: "French", lat: 46.2276, lng: 2.2137, color: "#fb7185" },
  "Germany": { name: "Germany", code: "DE", capital: "Berlin", population: "83,369,843 people", region: "Europe • Central Europe", area: "357,022 km²", languages: "German", lat: 51.1657, lng: 10.4515, color: "#a78bfa" },
  "Japan": { name: "Japan", code: "JP", capital: "Tokyo", population: "123,951,692 people", region: "Asia • Eastern Asia", area: "377,975 km²", languages: "Japanese", lat: 36.2048, lng: 138.2529, color: "#38bdf8" },
  "Brazil": { name: "Brazil", code: "BR", capital: "Brasília", population: "215,313,498 people", region: "Americas • South America", area: "8,515,767 km²", languages: "Portuguese", lat: -14.2350, lng: -51.9253, color: "#facc15" },
  "Australia": { name: "Australia", code: "AU", capital: "Canberra", population: "26,068,792 people", region: "Oceania • Australasia", area: "7,692,024 km²", languages: "English", lat: -25.2744, lng: 133.7751, color: "#fb923c" },
  "South Africa": { name: "South Africa", code: "ZA", capital: "Pretoria / Cape Town", population: "59,392,255 people", region: "Africa • Southern Africa", area: "1,221,037 km²", languages: "Zulu, Xhosa, Afrikaans, English", lat: -30.5595, lng: 22.9375, color: "#e879f9" },
  "Canada": { name: "Canada", code: "CA", capital: "Ottawa", population: "38,250,000 people", region: "Americas • North America", area: "9,984,670 km²", languages: "English, French", lat: 56.1304, lng: -106.3468, color: "#34d399" },
  "Egypt": { name: "Egypt", code: "EG", capital: "Cairo", population: "110,990,103 people", region: "Africa • Northern Africa", area: "1,010,408 km²", languages: "Arabic", lat: 26.8206, lng: 30.8025, color: "#f4d03f" },
  "India": { name: "India", code: "IN", capital: "New Delhi", population: "1,428,627,663 people", region: "Asia • Southern Asia", area: "3,287,263 km²", languages: "Hindi, English", lat: 20.5937, lng: 78.9629, color: "#fb7185" },
  "China": { name: "China", code: "CN", capital: "Beijing", population: "1,412,000,000 people", region: "Asia • Eastern Asia", area: "9,596,961 km²", languages: "Mandarin Chinese", lat: 35.8617, lng: 104.1954, color: "#42C2CB" }
};

export default function GlobeExplorer() {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<GlobeInstance | null>(null);
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(COUNTRY_DATABASE["Nigeria"]);
  const [hoveredPolygon, setHoveredPolygon] = useState<any>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any[]>([]);

  useEffect(() => {
    if (!globeContainerRef.current) return;

    // Fetch Natural Earth 110m countries GeoJSON
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
    if (!globeContainerRef.current || countriesGeoJson.length === 0) return;

    const globe = Globe()(globeContainerRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .showAtmosphere(true)
      .atmosphereColor("#42C2CB")
      .atmosphereAltitude(0.18)
      .polygonsData(countriesGeoJson)
      .polygonAltitude(d => d === hoveredPolygon ? 0.04 : (selectedCountry && (d as any).properties?.NAME === selectedCountry.name ? 0.03 : 0.01))
      .polygonCapColor(d => {
        const name = (d as any).properties?.NAME;
        if (selectedCountry && name === selectedCountry.name) return selectedCountry.color;
        if (d === hoveredPolygon) return "rgba(244, 208, 63, 0.6)";
        // Harmonious rich matte colors based on name hash
        const colors = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#457b9d", "#1d3557", "#6a040f", "#38bdf8", "#a78bfa"];
        const hash = name ? name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
        return colors[hash % colors.length];
      })
      .polygonSideColor(() => "rgba(15, 23, 42, 0.8)")
      .polygonStrokeColor(d => {
        const name = (d as any).properties?.NAME;
        if (selectedCountry && name === selectedCountry.name) return "#F4D03F";
        if (d === hoveredPolygon) return "#F4D03F";
        return "rgba(66, 194, 203, 0.35)";
      })
      .onPolygonHover(polygon => {
        setHoveredPolygon(polygon);
      })
      .onPolygonClick(polygon => {
        const props = (polygon as any).properties;
        const name = props?.NAME;
        const country = COUNTRY_DATABASE[name] || {
          name: name || "Unknown Territory",
          code: props?.ISO_A2 || "UN",
          capital: "Capital Region",
          population: "Estimated 10M+ people",
          region: "Global Frontier",
          area: "50,000+ km²",
          languages: "Official / Regional",
          lat: 0,
          lng: 0,
          color: "#42C2CB"
        };
        setSelectedCountry(country);
        if (globeInstanceRef.current) {
          globeInstanceRef.current.pointOfView({ lat: country.lat || 10, lng: country.lng || 10, altitude: 1.4 }, 1200);
        }
      });

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = true;

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
        if (globeContainerRef.current) globeContainerRef.current.innerHTML = "";
      } catch (e) {
        // cleanup
      }
    };
  }, [countriesGeoJson, selectedCountry, hoveredPolygon]);

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
    setSelectedCountry(null);
  };

  const handleSearchSelect = (countryName: string) => {
    const country = COUNTRY_DATABASE[countryName];
    if (country && globeInstanceRef.current) {
      setSelectedCountry(country);
      globeInstanceRef.current.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.4 }, 1200);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b14] font-sans text-white select-none">
      {/* 3D Globe Canvas Container */}
      <div ref={globeContainerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Navigation & Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-4 pointer-events-none">
        {/* Left: Back Button & Branding */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-gray-900/80 hover:bg-gray-900 text-gray-200 hover:text-white px-4 py-2.5 rounded-full border border-white/15 transition-all text-xs font-bold backdrop-blur-xl hover:border-geoCyan/60 shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-geoCyan" />
            <span>Home</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-gray-900/80 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg">
            <GlobeIcon className="w-4 h-4 text-geoCyan" />
            <span className="font-bold text-sm tracking-tight text-geoCyan">GeoGlobe 3D Explorer</span>
          </div>
        </div>

        {/* Center: Country Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-900/80 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <Search className="w-4 h-4 text-gray-400" />
          <select
            onChange={(e) => handleSearchSelect(e.target.value)}
            defaultValue=""
            className="bg-transparent text-white text-xs outline-none cursor-pointer"
          >
            <option value="" disabled className="bg-gray-900 text-gray-400">Select country to explore...</option>
            {Object.keys(COUNTRY_DATABASE).map(name => (
              <option key={name} value={name} className="bg-gray-900 text-white">
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Quiz Mode Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => navigate("/game")}
            className="inline-flex items-center gap-2 bg-geoYellow hover:bg-geoCyan text-gray-950 px-5 py-2.5 rounded-full border border-geoYellow/40 transition-all text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>

      {/* Floating Map Controls (+ / - / Reset) on Bottom Left */}
      <div className="absolute bottom-6 left-6 z-30 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-11 h-11 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-geoCyan" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-11 h-11 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-geoCyan" />
        </button>
        <button
          onClick={handleResetView}
          className="w-11 h-11 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-white/15 text-white flex items-center justify-center shadow-xl backdrop-blur-xl transition-all cursor-pointer hover:border-geoCyan/60"
          title="Reset View"
        >
          <RotateCcw className="w-5 h-5 text-geoYellow" />
        </button>
      </div>

      {/* Right Side Detail Drawer (Matching Screenshot 2) */}
      {selectedCountry && (
        <div className="absolute top-20 right-4 bottom-4 w-full max-w-sm z-40 bg-[#080e1a]/95 backdrop-blur-2xl border border-white/15 rounded-[2.5rem] shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto video-preview-scroll animate-fadeIn">
          {/* Top Close Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setSelectedCountry(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Circular Stamp Badge with Flag */}
          <div className="flex flex-col items-center text-center my-4">
            <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-geoYellow/60 flex items-center justify-center p-3 shadow-inner bg-black/40">
              <div className="absolute inset-0 flex items-center justify-center animate-[spin_25s_linear_infinite] pointer-events-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 140 140">
                  <defs>
                    <path id="stampPath" d="M 15, 70 a 55,55 0 1,1 110,0 a 55,55 0 1,1 -110,0" />
                  </defs>
                  <text className="text-[9px] font-mono tracking-[0.25em] uppercase" fill="#F4D03F">
                    <textPath href="#stampPath" startOffset="0%">
                      ★ GEO-GLOBE ★ EXPLORATION ★ DISCOVERY ★
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Country Flag Image */}
              <div className="w-16 h-12 rounded-lg overflow-hidden shadow-md border border-white/20">
                <img
                  src={`https://flagcdn.com/w320/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mt-4 tracking-tight">{selectedCountry.name}</h2>
            <span className="text-xs font-mono font-bold text-geoCyan uppercase tracking-widest mt-0.5">{selectedCountry.code}</span>
          </div>

          {/* Country Detailed Stats */}
          <div className="space-y-4 my-6 divide-y divide-white/10 text-sm">
            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] font-semibold">Capital</span>
              <span className="font-bold text-white text-right">{selectedCountry.capital}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] font-semibold">Population</span>
              <span className="font-bold text-white text-right">{selectedCountry.population}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] font-semibold">Region</span>
              <span className="font-bold text-geoYellow text-right text-xs">{selectedCountry.region}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] font-semibold">Area</span>
              <span className="font-bold text-white text-right">{selectedCountry.area}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-gray-400 uppercase tracking-wider text-[11px] font-semibold">Language(s)</span>
              <span className="font-bold text-white text-right">{selectedCountry.languages}</span>
            </div>
          </div>

          {/* Action Button to launch Interactive Map */}
          <div className="pt-2">
            <button
              onClick={() => navigate(`/map?lat=${selectedCountry.lat}&lng=${selectedCountry.lng}&from=explorer`)}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3.5 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              View on Interactive Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
