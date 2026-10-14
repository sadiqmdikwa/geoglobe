import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { initialVideos, VideoItem } from "../data/videos";
import { 
  Map as MapIcon, 
  RotateCcw, 
  Crosshair, 
  Sun, 
  Moon, 
  Search, 
  SlidersHorizontal, 
  X, 
  Compass, 
  ArrowLeft, 
  MapPin, 
  Eye,
  Maximize2,
  Minimize2
} from "lucide-react";
import MapSkeleton from "./skeletons/MapSkeleton";

declare const L: any;

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const focusMarkerRef = useRef<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read URL query coordinates (from Video or Game)
  const focusLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const focusLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
  const focusTitle = searchParams.get("title") || "";
  const focusId = searchParams.get("id") || "";
  const fromSource = searchParams.get("from");

  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(focusId || "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapTheme, setMapTheme] = useState<"dark" | "clean">("dark");
  const [currentZoom, setCurrentZoom] = useState<number>(3);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // If launched with coordinates: initial state is focused mode (shows only that location)
  // When user zooms out (zoom <= 5), show all locations dynamically
  const [isFocusedOnly, setIsFocusedOnly] = useState<boolean>(focusLat !== null && focusLng !== null);

  // Search & Filter States (Card-free, Google-style transparent pill)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique categories & regions
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(initialVideos.map((v) => v.category)))];
  }, []);

  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(initialVideos.map((v) => v.region)))];
  }, []);

  // Filtered list of locations
  const filteredVideos = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return initialVideos.filter((v) => {
      const matchesSearch =
        q === "" ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.region.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q);

      const matchesCat = selectedCategory === "All" || v.category === selectedCategory;
      const matchesReg = selectedRegion === "All" || v.region === selectedRegion;

      return matchesSearch && matchesCat && matchesReg;
    });
  }, [searchTerm, selectedCategory, selectedRegion]);

  const hasActiveDropdownFilters = selectedCategory !== "All" || selectedRegion !== "All";
  const isFiltered = searchTerm !== "" || selectedCategory !== "All" || selectedRegion !== "All";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedRegion("All");
  };

  // Expand / Contract handling & Leaflet resize
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    const timer1 = setTimeout(() => {
      mapInstance.current?.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      mapInstance.current?.invalidateSize();
    }, 300);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!mapRef.current) return;

    let timer: NodeJS.Timeout;

    if (!mapInstance.current) {
      // Determine initial map center and zoom:
      // If coordinates are provided in URL, zoom into that specific place
      const hasCoords = focusLat !== null && focusLng !== null && !isNaN(focusLat) && !isNaN(focusLng);
      const initialCenter = hasCoords ? [focusLat, focusLng] : [20.0, 15.0];
      const initialZoomLevel = hasCoords ? 7 : 3;

      setCurrentZoom(initialZoomLevel);

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(initialCenter, initialZoomLevel);

      mapInstance.current = map;

      // English World Basemap (Esri World Street Map - No API key, English labels globally)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a>, HERE, Garmin, USGS, NGA',
        maxZoom: 18,
      }).addTo(map);

      // Track cursor position for live coordinate HUD
      map.on("mousemove", (e: any) => {
        setCoords({
          lat: parseFloat(e.latlng.lat.toFixed(4)),
          lng: parseFloat(e.latlng.lng.toFixed(4)),
        });
      });

      // Track zoom level: if user zooms out (zoom <= 5), reveal surrounding locations
      map.on("zoomend", () => {
        const zoom = map.getZoom();
        setCurrentZoom(zoom);
        if (zoom <= 5) {
          setIsFocusedOnly(false);
        }
      });

      // Custom Glowing Cyan Icon for Normal Pins
      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-geoCyan/20 animate-ping absolute"></div>
            <div class="w-6 h-6 rounded-full bg-geoCyan border-2 border-white flex items-center justify-center shadow-[0_0_15px_#42C2CB] text-gray-950">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      // Special Golden-Cyan Icon for the Focused/Queried Anomaly
      const focusedTargetIcon = L.divIcon({
        className: "custom-focused-pin",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-geoYellow/30 animate-ping absolute"></div>
            <div class="w-8 h-8 rounded-full bg-geoYellow border-2 border-white flex items-center justify-center shadow-[0_0_20px_#F4D03F] text-gray-950 font-bold scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Add pins for all videos
      initialVideos.forEach((video) => {
        const isTarget =
          (focusId && video.id === focusId) ||
          (hasCoords && Math.abs(video.lat - focusLat!) < 0.005 && Math.abs(video.lng - focusLng!) < 0.005);

        const marker = L.marker([video.lat, video.lng], {
          icon: isTarget ? focusedTargetIcon : customIcon,
          title: video.title,
        });

        // Professional glassmorphic popup
        const popupContent = `
          <div class="p-4 bg-gray-950/95 text-white rounded-xl font-sans max-w-xs border border-white/10 shadow-2xl backdrop-blur-xl">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-geoCyan/15 text-geoCyan border border-geoCyan/30">
                ${video.region}
              </span>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-geoYellow/15 text-geoYellow border border-geoYellow/30">
                ${video.category}
              </span>
            </div>
            <h4 class="font-bold text-sm text-white mb-1.5 leading-snug">${video.title}</h4>
            <p class="text-xs text-gray-300 mb-3 line-clamp-3 leading-relaxed">${video.description}</p>
            <div class="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-gray-400">
              <span>${video.lat.toFixed(2)}°, ${video.lng.toFixed(2)}°</span>
              <a 
                href="#/videos?search=${encodeURIComponent(video.title)}" 
                class="text-geoCyan hover:text-geoYellow font-bold flex items-center gap-1 transition-colors uppercase tracking-wider text-[10px]"
              >
                Watch Video &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "custom-leaflet-popup",
          maxWidth: 320,
        });

        marker.on("click", () => {
          setSelectedLocationId(video.id);
        });

        markersRef.current[video.id] = marker;

        if (isTarget) {
          focusMarkerRef.current = marker;
        }

        // If NOT in isolated focus mode, attach to map
        if (!hasCoords) {
          marker.addTo(map);
        }
      });

      // If URL coordinates exist: show only the target marker initially
      if (hasCoords) {
        if (focusMarkerRef.current) {
          focusMarkerRef.current.addTo(map);
          setTimeout(() => {
            focusMarkerRef.current.openPopup();
          }, 800);
        } else {
          // Dynamic standalone marker if coordinates don't match existing video id
          const tempMarker = L.marker([focusLat!, focusLng!], {
            icon: focusedTargetIcon,
            title: focusTitle || "Target Anomaly",
          }).addTo(map);

          const tempPopup = `
            <div class="p-4 bg-gray-950/95 text-white rounded-xl font-sans max-w-xs border border-geoYellow/30 shadow-2xl backdrop-blur-xl">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-geoYellow/20 text-geoYellow border border-geoYellow/30 mb-2 inline-block">
                Target Location
              </span>
              <h4 class="font-bold text-sm text-white mb-1">${focusTitle || "Selected Coordinate"}</h4>
              <p class="text-xs text-gray-300 font-mono mb-2">${focusLat!.toFixed(4)}°, ${focusLng!.toFixed(4)}°</p>
            </div>
          `;
          tempMarker.bindPopup(tempPopup, { className: "custom-leaflet-popup" });
          setTimeout(() => {
            tempMarker.openPopup();
          }, 800);
          focusMarkerRef.current = tempMarker;
        }
      }

      timer = setTimeout(() => {
        setIsMapReady(true);
      }, 350);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [focusLat, focusLng, focusId, focusTitle]);

  // Handle Dynamic Marker Visibility (Isolated Focus vs Full Atlas Pins)
  useEffect(() => {
    if (!mapInstance.current) return;

    if (isFocusedOnly) {
      // Remove all generic markers to keep the view focused ONLY on the requested place
      initialVideos.forEach((video) => {
        const marker = markersRef.current[video.id];
        if (marker && mapInstance.current.hasLayer(marker)) {
          mapInstance.current.removeLayer(marker);
        }
      });
      // Ensure target marker is on map
      if (focusMarkerRef.current && !mapInstance.current.hasLayer(focusMarkerRef.current)) {
        focusMarkerRef.current.addTo(mapInstance.current);
      }
    } else {
      // Show filtered markers
      const activeIds = new Set(filteredVideos.map((v) => v.id));
      initialVideos.forEach((video) => {
        const marker = markersRef.current[video.id];
        if (marker) {
          if (activeIds.has(video.id)) {
            if (!mapInstance.current.hasLayer(marker)) {
              marker.addTo(mapInstance.current);
            }
          } else {
            if (mapInstance.current.hasLayer(marker)) {
              mapInstance.current.removeLayer(marker);
            }
          }
        }
      });
    }
  }, [isFocusedOnly, filteredVideos]);

  // Quick Jump camera to anomaly
  const handleFlyTo = (video: VideoItem) => {
    setIsFocusedOnly(false);
    setSelectedLocationId(video.id);
    if (mapInstance.current) {
      mapInstance.current.flyTo([video.lat, video.lng], 8, {
        duration: 1.5,
        easeLinearity: 0.25,
      });

      const targetMarker = markersRef.current[video.id];
      if (targetMarker) {
        setTimeout(() => {
          targetMarker.openPopup();
        }, 1550);
      }
    }
  };

  // Reset to global overview
  const handleResetView = () => {
    setIsFocusedOnly(false);
    setSelectedLocationId("");
    if (mapInstance.current) {
      mapInstance.current.closePopup();
      mapInstance.current.flyTo([20.0, 15.0], 3, {
        duration: 1.3,
      });
    }
  };

  const handleBackNavigation = () => {
    if (fromSource === "game") {
      navigate("/game");
    } else if (fromSource === "videos") {
      navigate("/videos");
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20"
    >
      {/* Top Navigation Row: Back Navigation Button + Controls */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={handleBackNavigation}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/15 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/50 active:scale-95 shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>
            {fromSource === "game"
              ? "Back to Game"
              : fromSource === "videos"
              ? "Back to Videos"
              : "Back"}
          </span>
        </button>

        {/* Minimalist Controls */}
        <div className="flex items-center gap-2">
          {/* Expand / Fullscreen Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-900/40 hover:bg-gray-900/80 px-3.5 py-2 rounded-full border border-white/15 backdrop-blur-xl transition-all"
            title={isExpanded ? "Contract map (Esc)" : "Expand map to fullscreen"}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-geoYellow" />
                <span>Contract</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-geoCyan" />
                <span>Expand</span>
              </>
            )}
          </button>

          {/* Map Style Toggle */}
          <button
            onClick={() => setMapTheme(mapTheme === "dark" ? "clean" : "dark")}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-900/40 hover:bg-gray-900/80 px-3.5 py-2 rounded-full border border-white/15 backdrop-blur-xl transition-all"
            title="Toggle Map Style"
          >
            {mapTheme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-geoYellow" />
                <span>Natural</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-geoCyan" />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-geoCyan bg-gray-900/40 hover:bg-gray-900/80 px-3.5 py-2 rounded-full border border-white/15 backdrop-blur-xl transition-all"
            title="Reset to global view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Minimalist Page Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 text-geoCyan font-semibold uppercase tracking-wider text-xs mb-2">
          <MapIcon className="w-3.5 h-3.5" />
          Cartographic Atlas
        </div>
        <h1 className="text-3xl md:text-4xl text-white font-extrabold tracking-tight">
          Interactive Map
        </h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xl leading-relaxed">
          Explore border anomalies, enclaves, and geopolitical frontiers with high-precision cartography.
        </p>
      </header>

      {/* Google-Style Circular & Transparent Search & Filter Bar */}
      <div className="mb-6">
        {/* Row 1: Google-style pill search input + Search button + Filter button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Circular Google-Style Transparent Search Box */}
          <div className="relative flex-1 flex items-center bg-gray-900/30 hover:bg-gray-900/50 focus-within:bg-gray-900/65 border border-white/15 focus-within:border-geoCyan/60 focus-within:ring-2 focus-within:ring-geoCyan/20 rounded-full transition-all backdrop-blur-xl shadow-lg px-4 py-2 sm:py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0 mr-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search map locations, regions, or borders..."
              className="w-full bg-transparent outline-none text-white text-xs sm:text-sm placeholder-gray-400/70"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-white transition-colors p-1 ml-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Button (Circular Pill) */}
          <button
            onClick={() => {
              setIsFocusedOnly(false);
              if (filteredVideos.length > 0) {
                handleFlyTo(filteredVideos[0]);
              }
            }}
            className="bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Filter Toggle Button (Circular Pill) */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs font-semibold border backdrop-blur-xl transition-all shrink-0 ${
              isFilterOpen || hasActiveDropdownFilters
                ? "bg-geoCyan/15 border-geoCyan text-geoCyan"
                : "bg-gray-900/30 border-white/15 text-gray-300 hover:text-white hover:border-white/30"
            }`}
            title="Toggle Region and Category Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveDropdownFilters && (
              <span className="w-2 h-2 rounded-full bg-geoYellow"></span>
            )}
          </button>

          {/* Reset Filters (Circular Pill) */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="bg-gray-900/30 hover:bg-white/10 text-gray-300 hover:text-white border border-white/15 w-10 h-10 rounded-full transition-colors flex items-center justify-center shrink-0 backdrop-blur-xl"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Animated Expandable Filter Row (Region & Category) */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 pb-1">
                {/* Category Dropdown */}
                <div className="flex items-center gap-2 bg-gray-900/40 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                    Category:
                  </span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setIsFocusedOnly(false);
                      setSelectedCategory(e.target.value);
                    }}
                    className="w-full bg-transparent text-white text-xs md:text-sm outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-[#0f172a] text-white">All Categories</option>
                    {categories.filter(c => c !== "All").map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0f172a] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region Dropdown */}
                <div className="flex items-center gap-2 bg-gray-900/40 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                    Region:
                  </span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => {
                      setIsFocusedOnly(false);
                      setSelectedRegion(e.target.value);
                    }}
                    className="w-full bg-transparent text-white text-xs md:text-sm outline-none cursor-pointer"
                  >
                    <option value="All" className="bg-[#0f172a] text-white">All Regions</option>
                    {regions.filter(r => r !== "All").map((reg) => (
                      <option key={reg} value={reg} className="bg-[#0f172a] text-white">
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: Location Index */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-geoCyan" />
            {isFocusedOnly ? (
              <span>Focusing on <strong className="text-geoYellow font-semibold">{focusTitle || "Target Location"}</strong></span>
            ) : (
              <span>Atlas Pins: <strong className="text-white font-mono">{filteredVideos.length}</strong> active locations</span>
            )}
          </div>

          {isFocusedOnly && (
            <button
              onClick={() => setIsFocusedOnly(false)}
              className="text-xs text-geoCyan hover:text-geoYellow font-semibold flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show All Locations</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Jump Bar for Filtered Locations */}
      {!isFocusedOnly && filteredVideos.length > 0 && (
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          <span className="text-gray-500 font-semibold uppercase tracking-wider text-[11px] shrink-0 mr-1">
            Jump to:
          </span>
          {filteredVideos.map((video) => (
            <button
              key={video.id}
              onClick={() => handleFlyTo(video)}
              className={`px-3 py-1.5 rounded-full border shrink-0 transition-all text-xs ${
                selectedLocationId === video.id
                  ? "bg-geoCyan text-gray-950 border-geoCyan font-semibold"
                  : "bg-gray-900/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20 backdrop-blur-md"
              }`}
            >
              {video.title.replace("The Truth About the ", "").replace("The Most Complex Border in the World ", "").replace("Why Bir Tawil is Unclaimed Land", "Bir Tawil")}
            </button>
          ))}
        </div>
      )}

      {/* Map Card — Same styling as Portfolio hero card (rounded-[2.5rem], border-white/10, bg-gray-900/50, backdrop-blur-xl, shadow-2xl), with p-0 (no padding) and expandable full-screen toggle */}
      <div 
        className={
          isExpanded 
            ? "fixed inset-0 z-50 bg-[#090d16] flex flex-col p-3 sm:p-5 transition-all"
            : `relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden p-0 transition-all ${
                mapTheme === "dark" ? "minimalist-dark-map" : "minimalist-clean-map"
              }`
        }
      >
        {/* Fullscreen Header Overlay (when expanded) */}
        {isExpanded && (
          <div className="flex items-center justify-between gap-3 mb-3 px-2">
            <div className="flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-geoCyan animate-ping"></span>
              <span className="text-sm font-bold tracking-tight">GeoGlobe Fullscreen Atlas</span>
              {isFocusedOnly && focusTitle && (
                <span className="hidden sm:inline-block text-xs font-mono text-geoYellow bg-geoYellow/10 border border-geoYellow/30 px-2 py-0.5 rounded-full">
                  {focusTitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Map Theme Toggle */}
              <button
                onClick={() => setMapTheme(mapTheme === "dark" ? "clean" : "dark")}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-900/70 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-xl"
              >
                {mapTheme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-geoYellow" />
                    <span className="hidden sm:inline">Natural</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-geoCyan" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>

              {/* Reset View */}
              <button
                onClick={handleResetView}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-geoCyan bg-gray-900/70 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Contract Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="inline-flex items-center gap-1.5 bg-geoCyan hover:bg-geoYellow text-gray-950 font-bold px-4 py-1.5 rounded-full text-xs transition-all shadow-md active:scale-95"
                title="Contract map (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Contract Map</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Expand/Contract Button inside Map Corner */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs text-gray-200 hover:text-white bg-gray-950/85 hover:bg-gray-900 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-xl transition-all active:scale-95"
          title={isExpanded ? "Contract map back (Esc)" : "Expand map to fullscreen"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-geoYellow" />
              <span className="text-[11px] font-medium">Contract</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-geoCyan" />
              <span className="text-[11px] font-medium hidden sm:inline">Expand</span>
            </>
          )}
        </button>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {!isMapReady && (
            <motion.div
              key="map-skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20"
            >
              <MapSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focused Location Active Notification Pill (Zoom out text removed as requested) */}
        {isFocusedOnly && isMapReady && (
          <div className="absolute top-4 left-4 right-16 sm:right-auto z-10 flex items-center justify-between sm:justify-start gap-3 bg-gray-950/90 border border-geoCyan/40 px-4 py-2 rounded-full text-xs shadow-xl backdrop-blur-xl animate-fadeIn">
            <div className="flex items-center gap-2 text-white truncate">
              <span className="w-2 h-2 rounded-full bg-geoYellow animate-ping"></span>
              <span className="truncate">
                Showing <strong>{focusTitle || "Target Location"}</strong> only
              </span>
            </div>
            <button
              onClick={() => setIsFocusedOnly(false)}
              className="text-geoCyan hover:text-geoYellow font-bold text-xs shrink-0 underline ml-1"
            >
              Reveal All
            </button>
          </div>
        )}

        {/* Live Coordinate HUD */}
        {coords && isMapReady && (
          <div className="absolute bottom-6 left-6 z-10 hidden sm:flex items-center gap-2 bg-gray-950/80 border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-gray-400 backdrop-blur-md pointer-events-none">
            <Crosshair className="w-3 h-3 text-geoCyan" />
            <span>{coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°</span>
          </div>
        )}

        {/* Leaflet Map Container — Flush edge-to-edge inside rounded card */}
        <div
          ref={mapRef}
          className={
            isExpanded
              ? "w-full h-full flex-1 rounded-2xl md:rounded-3xl overflow-hidden z-0"
              : "w-full h-[520px] md:h-[660px] lg:h-[700px] overflow-hidden z-0"
          }
        ></div>
      </div>
    </motion.div>
  );
}
