import { useEffect, useRef } from "react";
import { motion } from "motion/react";

// Declare L globally since it's loaded via CDN
declare const L: any;

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize the Leaflet map centered on Africa/Europe
      mapInstance.current = L.map(mapRef.current).setView([20.0, 20.0], 3);

      // Dark Theme Tiles: CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      // Marker 1 (Ilemi Triangle)
      const marker1 = L.marker([4.9, 35.3]).addTo(mapInstance.current);
      marker1.bindPopup(`
        <div class="text-gray-900">
          <b class="text-lg">Ilemi Triangle</b><br>
          <span class="text-sm">Disputed border region.</span><br>
          <a href="#" class="text-blue-600 font-bold hover:underline inline-block mt-1">Watch Video ▶</a>
        </div>
      `);

      // Marker 2 (Baarle-Hertog)
      const marker2 = L.marker([51.44, 4.93]).addTo(mapInstance.current);
      marker2.bindPopup(`
        <div class="text-gray-900">
          <b class="text-lg">Baarle-Hertog</b><br>
          <span class="text-sm">The craziest border in Europe.</span><br>
          <a href="#" class="text-blue-600 font-bold hover:underline inline-block mt-1">Watch Video ▶</a>
        </div>
      `);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full pb-20"
    >
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-5xl text-geoCyan font-bold mb-2">
          Explore the GeoGlobe
        </h1>
        <p className="text-gray-300 text-lg">
          Click the pins to uncover geographical mysteries and watch the related videos.
        </p>
      </header>

      {/* Map Container */}
      <div 
        id="map" 
        ref={mapRef}
        className="w-full h-[350px] md:h-[550px] rounded-2xl shadow-2xl border-2 border-gray-700 z-0 relative overflow-hidden"
      ></div>
    </motion.div>
  );
}
