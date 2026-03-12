import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { motion } from "motion/react";

declare const L: any;

export default function PreviewMap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");

  useEffect(() => {
    if (mapRef.current) {
      const map = L.map(mapRef.current).setView([lat, lng], 8);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(map);
      
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b class="text-gray-900">Mission Target</b>`)
        .openPopup();
      
      return () => map.remove();
    }
  }, [lat, lng]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-geoCyan mb-4 transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Mission
          </button>
          <h1 className="text-3xl md:text-5xl text-geoCyan font-bold flex items-center gap-3">
            <MapPin className="w-10 h-10" />
            Satellite Preview
          </h1>
        </div>
      </header>

      {/* PRO CARD WRAPPER */}
      <div className="bg-gray-900 border-2 border-gray-700 rounded-[2rem] overflow-hidden shadow-2xl h-[500px] md:h-[650px] relative">
        <div ref={mapRef} className="w-full h-full z-0" />
      </div>
    </motion.div>
  );
}
