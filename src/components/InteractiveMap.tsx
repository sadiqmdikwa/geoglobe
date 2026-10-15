import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { initialVideos, loadLiveVideos, VideoItem } from "../data/videos";
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
  Maximize2,
  Minimize2,
  Layers
} from "lucide-react";
import MapSkeleton from "./skeletons/MapSkeleton";
import VideoPreviewModal from "./VideoPreviewModal";

// Public ArcGIS World Street Map tiles provide English labels without a client API key.
const BASE_TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const BASE_ATTRIBUTION = 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>; Sources: Esri, HERE, Garmin, and <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const focusMarkerRef = useRef<any>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);

  useEffect(() => {
    let isMounted = true;
    loadLiveVideos()
      .then((loaded) => {
        if (isMounted) setVideos(loaded);
      })
      .catch((err) => console.error("Error loading live videos for map:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Read URL query coordinates (from Video or Game)
  const focusLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
  const focusLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
  const focusQuestion = searchParams.get("question") || "";
  const focusAnswer = searchParams.get("answer") || searchParams.get("title") || "";
  const focusTitle = focusAnswer || focusQuestion || "Target Location";
  const focusId = searchParams.get("id") || "";
  const fromSource = searchParams.get("from");
  const previewVideo = videos.find((video) => video.id === searchParams.get("preview")) || null;
  const initialSelectedLocationId = videos.find((video) =>
    video.id === focusId ||
    (focusLat !== null && focusLng !== null &&
      Math.abs(video.lat - focusLat) < 0.005 && Math.abs(video.lng - focusLng) < 0.005),
  )?.id || "";

  const [isMapReady, setIsMapReady] = useState(false);
  const [activeMapVideo, setActiveMapVideo] = useState<VideoItem | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapTheme, setMapTheme] = useState<"dark" | "clean">("dark");
  const [currentZoom, setCurrentZoom] = useState<number>(3);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const selectedLocationIdRef = useRef(initialSelectedLocationId);
  const hasFocusedPinRef = useRef(Boolean(initialSelectedLocationId) || (focusLat !== null && focusLng !== null));
  const updatePinIconsRef = useRef<((zoom: number) => void) | null>(null);

  // If launched with coordinates: initial state is focused mode (shows only that location)
  // When user zooms out (zoom <= 5), show all locations dynamically
  const [isFocusedOnly, setIsFocusedOnly] = useState<boolean>(focusLat !== null && focusLng !== null);

  // Search & Filter States (Card-free, Google-style transparent pill)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const hasFocusCoordinates = focusLat !== null && focusLng !== null && Number.isFinite(focusLat) && Number.isFinite(focusLng);
    selectedLocationIdRef.current = initialSelectedLocationId;
    hasFocusedPinRef.current = Boolean(initialSelectedLocationId) || hasFocusCoordinates;
    setIsFocusedOnly(hasFocusCoordinates);
    updatePinIconsRef.current?.(mapInstance.current?.getZoom() ?? 3);
  }, [focusLat, focusLng, initialSelectedLocationId]);

  // Extract unique categories & regions
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(videos.map((v) => v.category)))];
  }, [videos]);

  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(videos.map((v) => v.region)))];
  }, [videos]);

  // Filtered list of locations
  const filteredVideos = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return videos.filter((v) => {
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
  }, [videos, searchTerm, selectedCategory, selectedRegion]);

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

    // Multi-stage invalidateSize to ensure full-bleed tiles render immediately
    if (mapInstance.current) {
      mapInstance.current.invalidateSize({ animate: false });
      requestAnimationFrame(() => {
        mapInstance.current?.invalidateSize({ animate: false });
      });
      const timer1 = setTimeout(() => {
        mapInstance.current?.invalidateSize({ animate: false });
      }, 60);
      const timer2 = setTimeout(() => {
        mapInstance.current?.invalidateSize({ animate: false });
      }, 180);
      const timer3 = setTimeout(() => {
        mapInstance.current?.invalidateSize({ animate: false });
        baseTileLayerRef.current?.redraw();
      }, 350);

      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  // Style only the basemap tiles, leaving markers and map controls unchanged.
  useEffect(() => {
    const tileContainer = baseTileLayerRef.current?.getContainer();
    tileContainer?.classList.toggle("map-tiles-dark", mapTheme === "dark");
  }, [mapTheme]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Safety check: clear any leftover Leaflet container ID to prevent "Map container is already initialized"
    if ((mapRef.current as any)._leaflet_id) {
      delete (mapRef.current as any)._leaflet_id;
    }

    if (mapInstance.current) {
      try {
        mapInstance.current.remove();
      } catch (e) {
        console.warn("Leaflet remove error:", e);
      }
      mapInstance.current = null;
    }

    // Determine initial center
    const hasCoords = focusLat !== null && focusLng !== null && !isNaN(focusLat) && !isNaN(focusLng);
    const initialCenter: [number, number] = hasCoords ? [focusLat, focusLng] : [20.0, 15.0];
    const initialZoomLevel = hasCoords ? 7 : 3;

    setCurrentZoom(initialZoomLevel);

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 19,
    }).setView(initialCenter, initialZoomLevel);

    mapInstance.current = map;

    const baseLayer = L.tileLayer(BASE_TILES, {
      attribution: BASE_ATTRIBUTION,
      maxZoom: 19,
      minZoom: 2,
    }).addTo(map);

    baseTileLayerRef.current = baseLayer;
    baseLayer.getContainer()?.classList.toggle("map-tiles-dark", mapTheme === "dark");

    // Responsive ResizeObserver for instant container adaptation
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize({ animate: false });
      }
    });
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    // Track cursor position for live coordinate HUD
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setCoords({
        lat: parseFloat(e.latlng.lat.toFixed(4)),
        lng: parseFloat(e.latlng.lng.toFixed(4)),
      });
    });

    // Track zoom level: if user zooms out (zoom <= 5), reveal surrounding locations
    map.on("zoomend", () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      updatePinIconsRef.current?.(zoom);
      if (zoom <= 5) {
        setIsFocusedOnly(false);
      }
    });

    const createPinIcon = (color: string, size: [number, number]) =>
      L.divIcon({
        className: "custom-map-pin",
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 32 44" aria-hidden="true" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))">
            <path d="M16 1C7.72 1 1 7.72 1 16c0 10.45 15 27 15 27s15-16.55 15-27C31 7.72 24.28 1 16 1Z" fill="${color}" stroke="#e8fbff" stroke-width="1.5" />
            <circle cx="16" cy="16" r="5" fill="#f8fafc" />
          </svg>
        `,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1] - 1],
        popupAnchor: [0, -(size[1] - 1)],
      });

    const customIcon = createPinIcon("#2999d4", [32, 44]);
    const focusedTargetIcon = createPinIcon("#f4d03f", [36, 50]);
    const compactIcon = createPinIcon("#2999d4", [22, 30]);
    const compactFocusedIcon = createPinIcon("#f4d03f", [26, 36]);
    const mediumIcon = createPinIcon("#2999d4", [27, 37]);
    const mediumFocusedIcon = createPinIcon("#f4d03f", [32, 44]);
    const updatePinIcons = (zoom: number) => {
      const size = zoom <= 4 ? "compact" : zoom <= 7 ? "medium" : "large";
      const icons = {
        compact: { normal: compactIcon, selected: compactFocusedIcon },
        medium: { normal: mediumIcon, selected: mediumFocusedIcon },
        large: { normal: customIcon, selected: focusedTargetIcon },
      }[size];

      Object.entries(markersRef.current).forEach(([id, marker]) => {
        marker.setIcon(id === selectedLocationIdRef.current ? icons.selected : icons.normal);
      });

      if (focusMarkerRef.current && !Object.values(markersRef.current).includes(focusMarkerRef.current)) {
        const isSelected = hasFocusedPinRef.current && !selectedLocationIdRef.current;
        focusMarkerRef.current.setIcon(isSelected ? icons.selected : icons.normal);
      }
    };
    updatePinIconsRef.current = updatePinIcons;

    // Crucial: Invalidate size after layout settles so tiles never turn gray
    const resizeTimer1 = setTimeout(() => {
      map.invalidateSize();
      setIsMapReady(true);
    }, 150);

    const resizeTimer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {
          console.warn("Leaflet cleanup error:", e);
        }
        mapInstance.current = null;
      }
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }
    };
  }, [focusLat, focusLng, focusId, focusTitle]);

  // Re-sync markers dynamically whenever `videos` or map readiness changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !isMapReady) return;

    // Clear existing marker layers
    Object.values(markersRef.current).forEach((marker) => {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    });
    markersRef.current = {};
    focusMarkerRef.current = null;

    const zoom = map.getZoom();
    const isCompact = zoom <= 4;
    const isMedium = zoom > 4 && zoom <= 7;

    const createPinIcon = (color: string, size: [number, number]) =>
      L.divIcon({
        className: "custom-map-pin",
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}" viewBox="0 0 32 44" aria-hidden="true" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))">
            <path d="M16 1C7.72 1 1 7.72 1 16c0 10.45 15 27 15 27s15-16.55 15-27C31 7.72 24.28 1 16 1Z" fill="${color}" stroke="#e8fbff" stroke-width="1.5" />
            <circle cx="16" cy="16" r="5" fill="#f8fafc" />
          </svg>
        `,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1] - 1],
        popupAnchor: [0, -(size[1] - 1)],
      });

    const customIcon = createPinIcon("#2999d4", [32, 44]);
    const focusedTargetIcon = createPinIcon("#f4d03f", [36, 50]);
    const compactIcon = createPinIcon("#2999d4", [22, 30]);
    const compactFocusedIcon = createPinIcon("#f4d03f", [26, 36]);
    const mediumIcon = createPinIcon("#2999d4", [27, 37]);
    const mediumFocusedIcon = createPinIcon("#f4d03f", [32, 44]);

    const activeIds = new Set(filteredVideos.map((v) => v.id));

    videos.forEach((video) => {
      const isTarget =
        (focusId && video.id === focusId) ||
        (focusLat !== null && focusLng !== null && Math.abs(video.lat - focusLat) < 0.005 && Math.abs(video.lng - focusLng) < 0.005);

      const marker = L.marker([video.lat, video.lng], {
        icon: video.id === selectedLocationIdRef.current
          ? isCompact ? compactFocusedIcon : isMedium ? mediumFocusedIcon : focusedTargetIcon
          : isCompact ? compactIcon : isMedium ? mediumIcon : customIcon,
        title: video.title,
      });

      const popupDiv = document.createElement("div");
      popupDiv.className = "p-4 bg-gray-950/95 text-white rounded-xl font-sans max-w-xs border border-white/10 shadow-2xl backdrop-blur-xl";
      popupDiv.innerHTML = `
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
          ${video.youtubeId ? `
            <button id="pin-watch-btn-${video.id}" class="text-geoCyan hover:text-geoYellow font-bold flex items-center gap-1 transition-colors uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer">
              Watch Video &rarr;
            </button>
          ` : `
            <span class="text-geoYellow font-bold text-[10px] uppercase">Atlas Location Pin</span>
          `}
        </div>
      `;

      marker.bindPopup(popupDiv, {
        className: "custom-leaflet-popup",
        maxWidth: 320,
      });

      marker.on("popupopen", () => {
        const watchBtn = popupDiv.querySelector(`#pin-watch-btn-${video.id}`);
        if (watchBtn) {
          (watchBtn as HTMLElement).onclick = (e) => {
            e.preventDefault();
            setActiveMapVideo(video);
          };
        }
      });

      marker.on("click", () => {
        selectedLocationIdRef.current = video.id;
        hasFocusedPinRef.current = true;
        updatePinIconsRef.current?.(map.getZoom());
      });

      markersRef.current[video.id] = marker;

      if (isTarget) {
        focusMarkerRef.current = marker;
      }

      if (!isFocusedOnly && activeIds.has(video.id)) {
        marker.addTo(map);
      }
    });

    // Handle target location pin if coming from GeoGame or coordinate link
    const hasFocusCoords = focusLat !== null && focusLng !== null && !isNaN(focusLat) && !isNaN(focusLng);

    if (hasFocusCoords && !focusMarkerRef.current) {
      const standaloneMarker = L.marker([focusLat, focusLng], {
        icon: focusedTargetIcon,
        title: focusTitle,
      });

      const tempPopup = `
        <div class="p-4 bg-gray-950/95 text-white rounded-2xl font-sans max-w-xs border border-geoYellow/30 shadow-2xl backdrop-blur-xl">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-geoYellow/20 text-geoYellow border border-geoYellow/30">
              🎯 Geo Game Location
            </span>
          </div>

          ${focusAnswer ? `
            <div class="mb-2">
              <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Answer</span>
              <h4 class="font-black text-base text-geoCyan leading-tight">${focusAnswer}</h4>
            </div>
          ` : ""}

          ${focusQuestion ? `
            <div class="mb-3">
              <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Question</span>
              <p class="text-xs text-gray-200 leading-relaxed font-medium">${focusQuestion}</p>
            </div>
          ` : ""}

          <div class="pt-2 border-t border-white/10 text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>📍 ${focusLat.toFixed(4)}°, ${focusLng.toFixed(4)}°</span>
          </div>
        </div>
      `;

      standaloneMarker.bindPopup(tempPopup, { className: "custom-leaflet-popup", maxWidth: 320 });
      markersRef.current["standalone-target"] = standaloneMarker;
      focusMarkerRef.current = standaloneMarker;
    }

    if (isFocusedOnly && focusMarkerRef.current) {
      focusMarkerRef.current.addTo(map);
      setTimeout(() => {
        if (focusMarkerRef.current) focusMarkerRef.current.openPopup();
      }, 300);
    }
  }, [videos, filteredVideos, isMapReady, isFocusedOnly, focusLat, focusLng, focusId, focusTitle, focusQuestion, focusAnswer]);

  // Quick Jump camera to anomaly
  const handleFlyTo = (video: VideoItem) => {
    setIsFocusedOnly(false);
    selectedLocationIdRef.current = video.id;
    hasFocusedPinRef.current = true;
    if (mapInstance.current) {
      updatePinIconsRef.current?.(mapInstance.current.getZoom());
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
    selectedLocationIdRef.current = "";
    hasFocusedPinRef.current = false;
    if (mapInstance.current) {
      updatePinIconsRef.current?.(mapInstance.current.getZoom());
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

  const modalVideo = activeMapVideo || previewVideo;

  const handleClosePreview = useCallback(() => {
    setActiveMapVideo(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("preview");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePreviewMap = useCallback(() => {
    setActiveMapVideo(null);
    if (modalVideo) {
      handleFlyTo(modalVideo);
    }
  }, [modalVideo, handleFlyTo]);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      style={isExpanded ? { transform: "none" } : undefined}
      className="w-full pb-20"
    >
      {/* Top Navigation Row */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleBackNavigation}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 active:scale-95 shadow-sm group"
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

      {/* Map Search and Status */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-400">
            <Compass className="h-3.5 w-3.5 shrink-0 text-geoCyan" />
            {isFocusedOnly ? (
              <span className="truncate">
                Focusing on <strong className="font-semibold text-geoYellow">{focusTitle || "Target Location"}</strong>
              </span>
            ) : (
              <span className="shrink-0">
                Atlas Pins: <strong className="font-mono text-white">{filteredVideos.length}</strong> active locations
              </span>
            )}
            {isFocusedOnly && (
              <button
                onClick={handleResetView}
                className="shrink-0 text-xs font-semibold text-geoCyan transition-colors hover:text-geoYellow"
              >
                Show All Locations
              </button>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2 md:flex-1 md:justify-end">
            <div className="relative flex min-w-0 flex-1 items-center rounded-full border border-white/15 bg-gray-900/30 px-4 py-2 transition-all backdrop-blur-xl hover:bg-gray-900/50 focus-within:border-geoCyan/60 focus-within:bg-gray-900/65 focus-within:ring-2 focus-within:ring-geoCyan/20 md:max-w-[420px]">
              <Search className="mr-3 h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search locations..."
                className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder-gray-400/70 sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 p-1 text-gray-400 transition-colors hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setIsFocusedOnly(false);
                if (filteredVideos.length > 0) handleFlyTo(filteredVideos[0]);
              }}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-geoCyan px-4 py-2.5 text-xs font-bold uppercase text-gray-950 shadow-md transition-all hover:bg-geoYellow active:scale-95 sm:px-5"
              aria-label="Search map locations"
            >
              <Search className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex shrink-0 items-center justify-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-semibold backdrop-blur-xl transition-all sm:px-4 ${
                isFilterOpen || hasActiveDropdownFilters
                  ? "border-geoCyan bg-geoCyan/15 text-geoCyan"
                  : "border-white/15 bg-gray-900/30 text-gray-300 hover:border-white/30 hover:text-white"
              }`}
              title="Toggle Region and Category Filters"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveDropdownFilters && <span className="h-2 w-2 rounded-full bg-geoYellow" />}
            </button>

            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gray-900/30 text-gray-300 backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-white"
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
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

        {searchTerm.trim() && (
          <div
            className="map-search-results mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs"
            aria-label="Map search results"
          >
            <span className="shrink-0 pr-1 font-semibold uppercase text-gray-500">
              {filteredVideos.length} {filteredVideos.length === 1 ? "result" : "results"}
            </span>
            {filteredVideos.length > 0 ? filteredVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => handleFlyTo(video)}
                className={`max-w-[280px] shrink-0 truncate rounded-full border px-3 py-1.5 transition-colors ${
                  selectedLocationIdRef.current === video.id
                    ? "border-geoCyan/50 bg-geoCyan/15 font-semibold text-geoCyan"
                    : "border-white/5 bg-gray-900/50 text-gray-300 hover:border-white/15 hover:bg-gray-800 hover:text-white"
                }`}
                title={video.title}
              >
                {video.title}
              </button>
            )) : (
              <span className="shrink-0 text-gray-500">No matching locations</span>
            )}
          </div>
        )}

      </div>

      {/* Map Card — Same styling as Portfolio hero card (rounded-[2.5rem], border-white/10, bg-gray-900/50, backdrop-blur-xl, shadow-2xl), with p-0 (no padding) and expandable full-screen toggle */}
      <div 
        className={
          isExpanded 
            ? `map-shell map-shell-expanded fixed inset-0 w-screen h-screen z-[9999] bg-[#090d16] flex flex-col p-3 sm:p-5 m-0 ${
                mapTheme === "dark" ? "minimalist-dark-map" : "minimalist-clean-map"
              }`
                : `map-shell relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden p-0 ${
                mapTheme === "dark" ? "minimalist-dark-map" : "minimalist-clean-map"
              }`
        }
      >
        {/* Map Controls */}
        <div
          className={`absolute right-3 sm:right-5 ${isExpanded ? "top-16" : "top-3 sm:top-5"} z-30 flex items-center gap-1.5 sm:gap-2`}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-900/80 hover:bg-gray-800 px-2.5 sm:px-3.5 py-2 rounded-full border border-white/10 backdrop-blur-xl transition-all"
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

          <button
            onClick={() => setMapTheme(mapTheme === "dark" ? "clean" : "dark")}
            className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-300 hover:text-white bg-gray-900/80 hover:bg-gray-800 px-2.5 sm:px-3.5 py-2 rounded-full border border-white/10 backdrop-blur-xl transition-all"
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

          <button
            onClick={handleResetView}
            className="flex items-center gap-1 sm:gap-1.5 text-xs text-gray-300 hover:text-geoCyan bg-gray-900/80 hover:bg-gray-800 px-2.5 sm:px-3.5 py-2 rounded-full border border-white/10 backdrop-blur-xl transition-all"
            title="Reset to global view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Fullscreen Header Overlay (when expanded) */}
        {isExpanded && (
          <div className="flex items-center justify-between gap-3 mb-3 px-2 shrink-0">
            <div className="flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-geoCyan animate-ping"></span>
              <span className="text-sm font-bold tracking-tight">GeoGlobe Fullscreen Atlas</span>
              {isFocusedOnly && focusTitle && (
                <span className="hidden sm:inline-block text-xs font-mono text-geoYellow bg-geoYellow/10 border border-geoYellow/30 px-2 py-0.5 rounded-full">
                  {focusTitle}
                </span>
              )}
            </div>

          </div>
        )}

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
              onClick={handleResetView}
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
          className="map-canvas w-full overflow-hidden z-0"
        ></div>
      </div>
    </motion.div>
    {modalVideo && (
      <VideoPreviewModal
        video={modalVideo}
        onClose={handleClosePreview}
        onViewMap={handlePreviewMap}
      />
    )}
    </>
  );
}
