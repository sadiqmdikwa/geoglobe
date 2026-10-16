import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
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
}

const COUNTRY_DATABASE: { [key: string]: CountryData } = {
  "Nigeria": { name: "Nigeria", code: "NG", capital: "Abuja", population: "218,541,212 people", region: "Africa • Western Africa", area: "923,768 km²", languages: "English", lat: 9.082, lng: 8.6753 },
  "United States of America": { name: "United States", code: "US", capital: "Washington, D.C.", population: "333,287,557 people", region: "Americas • North America", area: "9,833,520 km²", languages: "English", lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { name: "United Kingdom", code: "GB", capital: "London", population: "67,596,281 people", region: "Europe • Northern Europe", area: "242,495 km²", languages: "English", lat: 55.3781, lng: -3.4360 },
  "France": { name: "France", code: "FR", capital: "Paris", population: "64,756,584 people", region: "Europe • Western Europe", area: "551,695 km²", languages: "French", lat: 46.2276, lng: 2.2137 },
  "Germany": { name: "Germany", code: "DE", capital: "Berlin", population: "83,369,843 people", region: "Europe • Central Europe", area: "357,022 km²", languages: "German", lat: 51.1657, lng: 10.4515 },
  "Japan": { name: "Japan", code: "JP", capital: "Tokyo", population: "123,951,692 people", region: "Asia • Eastern Asia", area: "377,975 km²", languages: "Japanese", lat: 36.2048, lng: 138.2529 },
  "Brazil": { name: "Brazil", code: "BR", capital: "Brasília", population: "215,313,498 people", region: "Americas • South America", area: "8,515,767 km²", languages: "Portuguese", lat: -14.2350, lng: -51.9253 },
  "Australia": { name: "Australia", code: "AU", capital: "Canberra", population: "26,068,792 people", region: "Oceania • Australasia", area: "7,692,024 km²", languages: "English", lat: -25.2744, lng: 133.7751 },
  "South Africa": { name: "South Africa", code: "ZA", capital: "Pretoria / Cape Town", population: "59,392,255 people", region: "Africa • Southern Africa", area: "1,221,037 km²", languages: "Zulu, Xhosa, Afrikaans, English", lat: -30.5595, lng: 22.9375 },
  "Canada": { name: "Canada", code: "CA", capital: "Ottawa", population: "38,250,000 people", region: "Americas • North America", area: "9,984,670 km²", languages: "English, French", lat: 56.1304, lng: -106.3468 },
  "Egypt": { name: "Egypt", code: "EG", capital: "Cairo", population: "110,990,103 people", region: "Africa • Northern Africa", area: "1,010,408 km²", languages: "Arabic", lat: 26.8206, lng: 30.8025 },
  "India": { name: "India", code: "IN", capital: "New Delhi", population: "1,428,627,663 people", region: "Asia • Southern Asia", area: "3,287,263 km²", languages: "Hindi, English", lat: 20.5937, lng: 78.9629 },
  "China": { name: "China", code: "CN", capital: "Beijing", population: "1,412,000,000 people", region: "Asia • Eastern Asia", area: "9,596,961 km²", languages: "Mandarin Chinese", lat: 35.8617, lng: 104.1954 }
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

  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(COUNTRY_DATABASE["Nigeria"]);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any | null>(null);

  // Projection state
  const rotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const scaleRef = useRef<number>(260);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fetch lightweight 110m TopoJSON world atlas (~150KB)
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

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current)
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule10();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render Globe Sphere Atmosphere / Ocean Base (#081420)
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "#081420";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(66, 194, 203, 0.4)";
      ctx.stroke();

      // 2. Render Latitude & Longitude Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      // 3. Render Country Polygons with Distinct Matte Fill Colors
      if (worldGeoJson && worldGeoJson.features) {
        worldGeoJson.features.forEach((feature: any) => {
          const countryName = feature.properties?.name || "Country";
          const isSelected = selectedCountry && (selectedCountry.name === countryName || countryName.includes(selectedCountry.name));
          const isHovered = hoveredCountryName && countryName === hoveredCountryName;

          ctx.beginPath();
          path(feature);

          if (isSelected) {
            ctx.fillStyle = "#F4D03F"; // Gold highlight for tapped/selected country
          } else if (isHovered) {
            ctx.fillStyle = "rgba(66, 194, 203, 0.8)"; // Bright cyan highlight for hovered country
          } else {
            ctx.fillStyle = getCountryColor(countryName);
          }

          ctx.fill();

          // Border stroke
          ctx.lineWidth = isSelected || isHovered ? 1.5 : 0.4;
          ctx.strokeStyle = isSelected || isHovered ? "#ffffff" : "rgba(10, 20, 30, 0.6)";
          ctx.stroke();
        });
      }

      // Auto rotation when not dragging
      if (!isDraggingRef.current) {
        rotationRef.current[0] += 0.2; // Smooth auto rotation
        projection.rotate(rotationRef.current);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldGeoJson, selectedCountry, hoveredCountryName]);

  // Drag Rotation Controls
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
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

  // Canvas Click Detection
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !worldGeoJson) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([canvasRef.current.width / 2, canvasRef.current.height / 2])
      .rotate(rotationRef.current);

    const coords = projection.invert?.([x, y]);
    if (!coords) return;

    // Find clicked feature
    const clickedFeature = worldGeoJson.features.find((f: any) => d3.geoContains(f, coords));
    if (clickedFeature) {
      const rawName = clickedFeature.properties?.name || "";
      const country = COUNTRY_DATABASE[rawName] || {
        name: rawName || "Selected Country",
        code: rawName.substring(0, 2).toUpperCase() || "UN",
        capital: "Capital Region",
        population: "Estimated 10M+ people",
        region: "Global Frontier",
        area: "50,000+ km²",
        languages: "Official / Regional",
        lat: coords[1],
        lng: coords[0]
      };
      setSelectedCountry(country);

      // Smooth rotate to center country
      rotationRef.current = [-country.lng, -country.lat, 0];
    }
  };

  const handleZoomIn = () => {
    scaleRef.current = Math.min(500, scaleRef.current + 50);
  };

  const handleZoomOut = () => {
    scaleRef.current = Math.max(140, scaleRef.current - 50);
  };

  const handleResetView = () => {
    rotationRef.current = [-10, -15, 0];
    scaleRef.current = 260;
    setSelectedCountry(null);
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

      {/* Right Side Detail Drawer (Matching Reference Screenshot 2) */}
      {selectedCountry && (
        <div className="absolute top-4 right-4 bottom-4 w-full max-w-sm z-40 bg-[#080e1a]/95 backdrop-blur-2xl border border-white/15 rounded-[2.5rem] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto video-preview-scroll animate-fadeIn">
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

              {/* Country Flag Image */}
              <div className="w-14 h-10 rounded-lg overflow-hidden shadow-md border border-white/20">
                <img
                  src={`https://flagcdn.com/w320/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mt-3 tracking-tight">{selectedCountry.name}</h2>
            <span className="text-xs font-mono font-bold text-geoCyan uppercase tracking-widest mt-0.5">{selectedCountry.code}</span>
          </div>

          {/* Country Detailed Stats */}
          <div className="space-y-3.5 my-4 divide-y divide-white/10 text-xs md:text-sm">
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Capital</span>
              <span className="font-bold text-white text-right">{selectedCountry.capital}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Population</span>
              <span className="font-bold text-white text-right">{selectedCountry.population}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Region</span>
              <span className="font-bold text-geoYellow text-right text-xs">{selectedCountry.region}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Area</span>
              <span className="font-bold text-white text-right">{selectedCountry.area}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">Language(s)</span>
              <span className="font-bold text-white text-right">{selectedCountry.languages}</span>
            </div>
          </div>

          {/* Action Button to launch Interactive Map */}
          <div className="pt-2">
            <button
              onClick={() => navigate(`/map?lat=${selectedCountry.lat}&lng=${selectedCountry.lng}&from=explorer`)}
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
