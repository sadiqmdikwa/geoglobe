import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

declare const L: any;

export default function PreviewMap() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");

  useEffect(() => {
    if (mapRef.current) {
      const map = L.map(mapRef.current).setView([lat, lng], 5);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup("<b>Target Location</b>").openPopup();
      
      return () => map.remove();
    }
  }, [lat, lng]);

  return (
    <div className="w-full h-screen relative">
      <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-[1000] bg-geoCyan text-black p-3 rounded-xl font-bold flex items-center gap-2 shadow-2xl">
        <ArrowLeft /> Back to Game
      </button>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
