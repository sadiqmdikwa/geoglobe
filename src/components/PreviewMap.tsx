import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import MapSkeleton from "./skeletons/MapSkeleton";

declare const L: any;

export default function PreviewMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isMapReady, setIsMapReady] = useState(false);

  const lat = parseFloat(searchParams.get("lat") || "20");
  const lng = parseFloat(searchParams.get("lng") || "20");
  const title = searchParams.get("title") || "Target Location";

  useEffect(() => {
    if (!mapRef.current) return;
    let timer: NodeJS.Timeout;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([lat, lng], 6);

      mapInstance.current = map;

      // 100% Free Forever English Basemap (Esri World Street Map - No API key required, pure English labels)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        attribution: '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a>, HERE, Garmin, USGS, NGA',
        maxZoom: 18,
      }).addTo(map);

      // Glowing Pulsing Circle
      L.circle([lat, lng], {
        color: "#42C2CB",
        fillColor: "#42C2CB",
        fillOpacity: 0.2,
        radius: 80000,
        weight: 1.5,
      }).addTo(map);

      // Single Pulsing Cyan Pin
      const pulsingIcon = L.divIcon({
        className: "preview-pulse-pin",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 30px; height: 30px; background: rgba(66, 194, 203, 0.3); border-radius: 50%; animation: pulse-ring 2s infinite ease-in-out;"></div>
            <div style="width: 20px; height: 20px; background: #42C2CB; border: 2.5px solid #090d16; border-radius: 50%; box-shadow: 0 0 15px #42C2CB; display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; background: #F4D03F; border-radius: 50%;"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lng], { icon: pulsingIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 4px;">
          <h4 style="color: #ffffff; font-size: 13px; font-weight: 700; margin: 0 0 2px 0;">${title}</h4>
          <p style="color: #94a3b8; font-size: 10px; margin: 0;">${lat.toFixed(4)}°, ${lng.toFixed(4)}°</p>
        </div>
      `).openPopup();

      timer = setTimeout(() => {
        setIsMapReady(true);
        map.invalidateSize();
      }, 350);
    }

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng, title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20"
    >
      {/* Top Header with Back Navigation Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/15 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/50 active:scale-95 shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900/40 px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-xl">
          <MapPin className="w-3.5 h-3.5 text-geoCyan" />
          <span><b>{title}</b> ({lat.toFixed(2)}°, {lng.toFixed(2)}°)</span>
        </div>
      </div>

      {/* Minimalist Map Wrapper */}
      <div className="relative rounded-3xl border border-white/10 p-3 bg-gray-900/70 shadow-xl backdrop-blur-xl overflow-hidden minimalist-dark-map">
        <AnimatePresence>
          {!isMapReady && (
            <motion.div
              key="preview-map-skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20"
            >
              <MapSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={mapRef}
          className="w-full h-[450px] md:h-[600px] rounded-2xl overflow-hidden z-0"
        ></div>
      </div>
    </motion.div>
  );
}
