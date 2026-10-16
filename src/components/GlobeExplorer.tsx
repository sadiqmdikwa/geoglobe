import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { X, Globe as GlobeIcon, Search, ZoomIn, ZoomOut, RotateCcw, Trophy, ArrowLeft, MapPin, Waves, Snowflake } from "lucide-react";

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
  // Countries
  "Nigeria": { name: "Nigeria", code: "NG", type: "country", capital: "Abuja", population: "218,541,212 people", region: "Africa • Western Africa", area: "923,768 km²", languages: "English", lat: 9.082, lng: 8.6753 },
  "United States of America": { name: "United States", code: "US", type: "country", capital: "Washington, D.C.", population: "333,287,557 people", region: "Americas • North America", area: "9,833,520 km²", languages: "English", lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { name: "United Kingdom", code: "GB", type: "country", capital: "London", population: "67,596,281 people", region: "Europe • Northern Europe", area: "242,495 km²", languages: "English", lat: 55.3781, lng: -3.4360 },
  "France": { name: "France", code: "FR", type: "country", capital: "Paris", population: "64,756,584 people", region: "Europe • Western Europe", area: "551,695 km²", languages: "French", lat: 46.2276, lng: 2.2137 },
  "Germany": { name: "Germany", code: "DE", type: "country", capital: "Berlin", population: "83,369,843 people", region: "Europe • Central Europe", area: "357,022 km²", languages: "German", lat: 51.1657, lng: 10.4515 },
  "Japan": { name: "Japan", code: "JP", type: "country", capital: "Tokyo", population: "123,951,692 people", region: "Asia • Eastern Asia", area: "377,975 km²", languages: "Japanese", lat: 36.2048, lng: 138.2529 },
  "Brazil": { name: "Brazil", code: "BR", type: "country", capital: "Brasília", population: "215,313,498 people", region: "Americas • South America", area: "8,515,767 km²", languages: "Portuguese", lat: -14.2350, lng: -51.9253 },
  "Australia": { name: "Australia", code: "AU", type: "country", capital: "Canberra", population: "26,068,792 people", region: "Oceania • Australasia", area: "7,692,024 km²", languages: "English", lat: -25.2744, lng: 133.7751 },
  "South Africa": { name: "South Africa", code: "ZA", type: "country", capital: "Pretoria / Cape Town", population: "59,392,255 people", region: "Africa • Southern Africa", area: "1,221,037 km²", languages: "Zulu, Xhosa, Afrikaans, English", lat: -30.5595, lng: 22.9375 },
  "Canada": { name: "Canada", code: "CA", type: "country", capital: "Ottawa", population: "38,250,000 people", region: "Americas • North America", area: "9,984,670 km²", languages: "English, French", lat: 56.1304, lng: -106.3468 },
  "Egypt": { name: "Egypt", code: "EG", type: "country", capital: "Cairo", population: "110,990,103 people", region: "Africa • Northern Africa", area: "1,010,408 km²", languages: "Arabic", lat: 26.8206, lng: 30.8025 },
  "India": { name: "India", code: "IN", type: "country", capital: "New Delhi", population: "1,428,627,663 people", region: "Asia • Southern Asia", area: "3,287,263 km²", languages: "Hindi, English", lat: 20.5937, lng: 78.9629 },
  "China": { name: "China", code: "CN", type: "country", capital: "Beijing", population: "1,412,000,000 people", region: "Asia • Eastern Asia", area: "9,596,961 km²", languages: "Mandarin Chinese", lat: 35.8617, lng: 104.1954 },

  // Water Bodies & Polar Ice
  "Atlantic Ocean": { name: "Atlantic Ocean", code: "AO", type: "water", region: "Global Water Basin", area: "106,460,000 km²", desc: "The world's second-largest ocean basin, separating Europe and Africa from the Americas.", lat: 14.59, lng: -28.67 },
  "Pacific Ocean": { name: "Pacific Ocean", code: "PO", type: "water", region: "Global Water Basin", area: "165,250,000 km²", desc: "The world's largest and deepest ocean basin, covering one-third of the Earth's surface.", lat: 0, lng: -160 },
  "Indian Ocean": { name: "Indian Ocean", code: "IO", type: "water", region: "Global Water Basin", area: "70,560,000 km²", desc: "Bounded by Asia, Africa, Australia, and the Southern Ocean.", lat: -20, lng: 80 },
  "Antarctica": { name: "Antarctica", code: "AQ", type: "ice", region: "South Polar Zone", area: "14,200,000 km²", desc: "Earth's southernmost continent containing 90% of global ice.", lat: -82.86, lng: 135.0 },
  "Greenland": { name: "Greenland", code: "GL", type: "ice", capital: "Nuuk", population: "56,000 people", region: "North Polar Zone", area: "2,166,086 km²", languages: "Greenlandic", desc: "Massive autonomous polar island covered by the Greenland Ice Sheet.", lat: 71.70, lng: -42.60 }
};

const COUNTRY_COLORS = ["#388e3c", "#fbc02d", "#d32f2f", "#1976d2", "#7b1fa2", "#e65100", "#00796b", "#0288d1", "#c2185b", "#512da8"];

function getCountryColor(name: string): string {
  if (!name) return "#388e3c";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COUNTRY_COLORS[hash % COUNTRY_COLORS.length];
}

export default function GlobeExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const [selectedFeature, setSelectedFeature] = useState<FeatureData | null>(FEATURE_DATABASE["Nigeria"]);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any | null>(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);

  // Projection state
  const rotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const scaleRef = useRef<number>(260);
  const targetScaleRef = useRef<number>(260);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fetch 110m TopoJSON world atlas
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(res => res.json())
      .then(topology => {
        const geojson = topojson.feature(topology, topology.objects.countries);
        setWorldGeoJson(geojson);
      })
      .catch(err => console.warn("Failed to load world topology:", err));
  }, []);

  // Main Render Loop
  useEffect(() => {
    if (!canvasRef.current || !worldGeoJson) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth zoom interpolation
      scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.1;

      // Adjust translation center so globe is never hidden by side drawer on desktop
      const isCardOpen = selectedFeature !== null;
      const isDesktop = window.innerWidth >= 1024;
      const centerX = isCardOpen && isDesktop ? width * 0.32 : width / 2;

      const projection = d3.geoOrthographic()
        .scale(scaleRef.current)
        .translate([centerX, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3.geoPath().projection(projection).context(ctx);
      const graticule = d3.geoGraticule10();

      // 1. Render Globe Sphere Atmosphere / Ocean Base (#081420)
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = selectedFeature?.type === "water" ? "#0a2540" : "#081420";
      ctx.fill();
      ctx.lineWidth = selectedFeature?.type === "water" ? 2.5 : 1.5;
      ctx.strokeStyle = selectedFeature?.type === "water" ? "#F4D03F" : "rgba(66, 194, 203, 0.4)";
      ctx.stroke();

      // 2. Render Latitude & Longitude Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      // 3. Render Country & Landmass Polygons
      if (worldGeoJson && worldGeoJson.features) {
        worldGeoJson.features.forEach((feature: any) => {
          const countryName = feature.properties?.name || "Country";
          const isSelected = selectedFeature && selectedFeature.type === "country" && (selectedFeature.name === countryName || countryName.includes(selectedFeature.name));
          const isHovered = hoveredCountryName && countryName === hoveredCountryName;

          ctx.beginPath();
          path(feature);

          if (isSelected) {
            ctx.fillStyle = "#F4D03F"; // Solid Gold Fill on Tap
          } else if (isHovered) {
            ctx.fillStyle = "rgba(66, 194, 203, 0.8)"; // Bright Cyan Fill on Hover
          } else {
            ctx.fillStyle = getCountryColor(countryName);
          }

          ctx.fill();

          // Draw Border Lines
          ctx.lineWidth = isSelected || isHovered ? 1.8 : 0.4;
          ctx.strokeStyle = isSelected || isHovered ? "#ffffff" : "rgba(10, 20, 30, 0.6)";
          ctx.stroke();
        });
      }

      // Auto rotation only if auto-spin is enabled and user is not dragging
      if (isAutoSpinning && !isDraggingRef.current) {
        rotationRef.current[0] += 0.2;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldGeoJson, selectedFeature, hoveredCountryName, isAutoSpinning]);

  // Drag Controls & Stop Auto-Spin on Interaction
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsAutoSpinning(false); // Stop auto-spinning on interaction!
    isDraggingRef.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;

    rotationRef.current[0] += dx * 0.4;
    rotationRef.current[1] -= dy * 0.4;

    lastMouseRef.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Canvas Click Detection (Countries & Ocean Water Bodies)
  const handleCanvasClick = (e: React.MouseEvent) => {
    setIsAutoSpinning(false); // Stop auto-spin permanently when user taps!
    if (!canvasRef.current || !worldGeoJson) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isCardOpen = selectedFeature !== null;
    const isDesktop = window.innerWidth >= 1024;
    const centerX = isCardOpen && isDesktop ? canvasRef.current.width * 0.32 : canvasRef.current.width / 2;

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([centerX, canvasRef.current.height / 2])
      .rotate(rotationRef.current);

    const coords = projection.invert?.([x, y]);
    if (!coords) return;

    // Check if clicked inside a country polygon
    const clickedFeature = worldGeoJson.features.find((f: any) => d3.geoContains(f, coords));

    if (clickedFeature) {
      const rawName = clickedFeature.properties?.name || "";
      const country: FeatureData = FEATURE_DATABASE[rawName] || {
        name: rawName || "Selected Territory",
        code: rawName.substring(0, 2).toUpperCase() || "UN",
        type: rawName === "Antarctica" || rawName === "Greenland" ? "ice" : "country",
        capital: "Capital Region",
        population: "Estimated 10M+ people",
        region: "Global Frontier",
        area: "50,000+ km²",
        languages: "Official / Regional",
        lat: coords[1],
        lng: coords[0]
      };
      setSelectedFeature(country);
      targetScaleRef.current = 420; // Smooth Zoom In on Country Tap!
      rotationRef.current = [-country.lng, -country.lat, 0]; // Rotate to center!
    } else {
      // Clicked on Ocean / Water Body
      let waterFeature: FeatureData = FEATURE_DATABASE["Atlantic Ocean"];
      if (coords[0] < -100 || coords[0] > 120) {
        waterFeature = FEATURE_DATABASE["Pacific Ocean"];
      } else if (coords[0] > 40 && coords[0] < 110 && coords[1] < 15) {
        waterFeature = FEATURE_DATABASE["Indian Ocean"];
      } else if (coords[1] < -60) {
        waterFeature = FEATURE_DATABASE["Southern Ocean"];
      } else if (coords[1] > 70) {
        waterFeature = FEATURE_DATABASE["Arctic Ocean"];
      }

      setSelectedFeature(waterFeature);
      targetScaleRef.current = 360; // Zoom in on Water Body!
      rotationRef.current = [-coords[0], -coords[1], 0];
    }
  };

  const handleZoomIn = () => {
    setIsAutoSpinning(false);
    targetScaleRef.current = Math.min(550, targetScaleRef.current + 60);
  };

  const handleZoomOut = () => {
    setIsAutoSpinning(false);
    targetScaleRef.current = Math.max(140, targetScaleRef.current - 60);
  };

  const handleResetView = () => {
    rotationRef.current = [-10, -15, 0];
    targetScaleRef.current = 260;
    setSelectedFeature(null);
    setIsAutoSpinning(true);
  };

  const handleSearchSelect = (countryName: string) => {
    setIsAutoSpinning(false);
    const country = FEATURE_DATABASE[countryName];
    if (country) {
      setSelectedFeature(country);
      targetScaleRef.current = 420;
      rotationRef.current = [-country.lng, -country.lat, 0];
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] max-h-[850px] rounded-[2.5rem] overflow-hidden bg-[#070b14] font-sans text-white border border-white/10 shadow-2xl flex items-center justify-center select-none">
      {/* 2D/3D Canvas Vector Globe */}
      <canvas
        ref={canvasRef}
        width={900}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onClick={handleCanvasClick}
        className="cursor-grab active:cursor-grabbing max-w-full max-h-full object-contain"
      />

      {/* Top Floating Controls */}
      <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-gray-900/80 hover:bg-gray-900 text-gray-200 hover:text-white px-4 py-2 rounded-full border border-white/15 transition-all text-xs font-bold backdrop-blur-xl hover:border-geoCyan/60 shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-geoCyan" />
            <span>Home</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-gray-900/80 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl shadow-lg text-xs font-bold text-geoCyan">
            <GlobeIcon className="w-4 h-4" />
            <span>3D Vector Globe Atlas</span>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-900/80 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl shadow-2xl pointer-events-auto">
          <Search className="w-4 h-4 text-gray-400" />
          <select
            onChange={(e) => handleSearchSelect(e.target.value)}
            defaultValue=""
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

        {/* Quiz Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => navigate("/game")}
            className="inline-flex items-center gap-2 bg-geoYellow hover:bg-geoCyan text-gray-950 px-5 py-2 rounded-full border border-geoYellow/40 transition-all text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>

      {/* Control Overlay Instructions (Matching Reference Photo) */}
      <div className="absolute bottom-5 left-5 z-30 flex items-center gap-2 text-[11px] font-mono text-gray-400 bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
        <span className="text-geoCyan font-bold">click</span> select • <span className="text-geoCyan font-bold">drag</span> pan • <span className="text-geoCyan font-bold">scroll</span> zoom
      </div>

      {/* Bottom Right Floating Zoom Buttons */}
      <div className="absolute bottom-5 right-5 z-30 flex flex-col gap-2">
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

      {/* Right Side Detail Drawer (Does NOT hide the map!) */}
      {selectedFeature && (
        <div className="absolute top-4 right-4 bottom-4 w-full max-w-sm z-40 bg-[#080e1a]/95 backdrop-blur-2xl border border-white/15 rounded-[2.5rem] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto video-preview-scroll animate-fadeIn">
          {/* Top Close Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => {
                setSelectedFeature(null);
                targetScaleRef.current = 260;
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Circular Stamp Badge: Flag for Country, GeoGlobe Emblem for Water, Ice Emblem for Polar */}
          <div className="flex flex-col items-center text-center my-2">
            <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-geoYellow/60 flex items-center justify-center p-3 shadow-inner bg-black/40">
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

              {/* Emblem rendering based on feature type */}
              {selectedFeature.type === "country" ? (
                <div className="w-14 h-10 rounded-lg overflow-hidden shadow-md border border-white/20">
                  <img
                    src={`https://flagcdn.com/w320/${selectedFeature.code.toLowerCase()}.png`}
                    alt={selectedFeature.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : selectedFeature.type === "water" ? (
                <div className="w-14 h-14 rounded-2xl bg-geoCyan/15 text-geoCyan flex items-center justify-center border border-geoCyan/30 shadow-inner">
                  <Waves className="w-8 h-8 text-geoCyan animate-pulse" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-cyan-100/15 text-cyan-200 flex items-center justify-center border border-cyan-200/30 shadow-inner">
                  <Snowflake className="w-8 h-8 text-cyan-200 animate-spin" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-white mt-3 tracking-tight">{selectedFeature.name}</h2>
            <span className="text-xs font-mono font-bold text-geoCyan uppercase tracking-widest mt-0.5">{selectedFeature.code}</span>
          </div>

          {/* Feature Detailed Stats */}
          <div className="space-y-3.5 my-4 divide-y divide-white/10 text-xs md:text-sm">
            {selectedFeature.capital && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Capital</span>
                <span className="font-bold text-white text-right">{selectedFeature.capital}</span>
              </div>
            )}
            {selectedFeature.population && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Population</span>
                <span className="font-bold text-white text-right">{selectedFeature.population}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Region</span>
              <span className="font-bold text-geoYellow text-right text-xs">{selectedFeature.region}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Area</span>
              <span className="font-bold text-white text-right">{selectedFeature.area}</span>
            </div>
            {selectedFeature.languages && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Language(s)</span>
                <span className="font-bold text-white text-right">{selectedFeature.languages}</span>
              </div>
            )}
            {selectedFeature.desc && (
              <div className="pt-2">
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Description</span>
                <p className="text-xs text-gray-300 leading-relaxed font-normal">{selectedFeature.desc}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => navigate(`/map?lat=${selectedFeature.lat}&lng=${selectedFeature.lng}&from=explorer`)}
              className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
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
