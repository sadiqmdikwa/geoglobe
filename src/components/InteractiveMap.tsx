import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

declare const L: any;

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 1. PASTE YOUR GOOGLE SHEET CSV LINK HERE 👇
  const SHEET_CSV_URL = "YOUR_PUBLISHED_CSV_LINK_HERE";

  useEffect(() => {
    const loadMapData = async () => {
      if (!mapRef.current || mapInstance.current) return;

      // Initialize the map
      mapInstance.current = L.map(mapRef.current).setView([20.0, 20.0], 3);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1);
        
        rows.forEach((row) => {
          const columns = row.split(',');
          if (columns.length < 5) return;

          const title = columns[1]?.replace(/"/g, "");
          const lat = parseFloat(columns[2]);
          const lng = parseFloat(columns[3]);
          const ytId = columns[4]?.replace(/"/g, "").trim();

          if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng]).addTo(mapInstance.current);
            
            marker.bindPopup(`
              <div class="text-gray-900 pb-1">
                <b class="text-lg">${title}</b><br>
                <button class="watch-video-btn text-blue-600 font-bold hover:underline inline-block mt-2" data-id="${ytId}">
                  Watch Video ▶
                </button>
              </div>
            `);
          }
        });
      } catch (error) {
        console.error("Error loading map pins:", error);
      } finally {
        setLoading(false);
      }

      // Pro Navigation Logic
      mapInstance.current.on('popupopen', (e: any) => {
        const btn = e.popup._contentNode.querySelector('.watch-video-btn');
        if (btn) {
          btn.onclick = () => {
            const ytId = btn.getAttribute('data-id');
            // Navigate with the ID in the URL
            navigate(`/videos?id=${ytId}`);
          };
        }
      });
    };

    loadMapData();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full pb-20"
    >
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-2">Explore the GeoGlobe</h1>
        <p className="text-gray-300 text-lg">
          {loading ? "Syncing with live database..." : "Pins are loaded directly from your database."}
        </p>
      </header>

      <div 
        ref={mapRef}
        className="w-full h-[350px] md:h-[550px] rounded-2xl shadow-2xl border-2 border-gray-700 z-0 relative overflow-hidden"
      ></div>
    </motion.div>
  );
}
