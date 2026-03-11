import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { videoData } from "../data/videos"; // Import our master list!

declare const L: any;

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize the map
      mapInstance.current = L.map(mapRef.current).setView([20.0, 20.0], 3);

      // Dark Theme Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      // Loop through our master data and create pins automatically!
      videoData.forEach((video) => {
        const marker = L.marker([video.lat, video.lng]).addTo(mapInstance.current);
        
        // We use a <button> instead of <a> so we can catch the click with JavaScript
        marker.bindPopup(`
          <div class="text-gray-900 pb-1">
            <b class="text-lg">${video.title}</b><br>
            <span class="text-sm">${video.description}</span><br>
            <button class="watch-video-btn text-blue-600 font-bold hover:underline inline-block mt-2" data-id="${video.id}">
              Watch Video ▶
            </button>
          </div>
        `);
      });

      // This is the magic bridge between Leaflet's HTML and React Router
      mapInstance.current.on('popupopen', (e: any) => {
        const popupNode = e.popup._contentNode;
        const btn = popupNode.querySelector('.watch-video-btn');
        
        if (btn) {
          btn.onclick = () => {
            // Send them to the video page! 
            // (Later, we can make it open the exact video using the data-id)
            navigate('/videos');
          };
        }
      });
    }

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
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-2">
          Explore the GeoGlobe
        </h1>
        <p className="text-gray-300 text-lg">
          Click the pins to uncover geographical mysteries and watch the related videos.
        </p>
      </header>

      <div 
        id="map" 
        ref={mapRef}
        className="w-full h-[350px] md:h-[550px] rounded-2xl shadow-2xl border-2 border-gray-700 z-0 relative overflow-hidden"
      ></div>
    </motion.div>
  );
}
