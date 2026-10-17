import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { X, Globe as GlobeIcon, Search, ZoomIn, ZoomOut, RotateCcw, Trophy, ArrowLeft, MapPin, Waves, Snowflake, Compass, Layers } from "lucide-react";
import AdBanner from "./AdBanner";

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
  "Colombia": { name: "Colombia", code: "CO", type: "country", capital: "Bogotá", population: "51,520,000 people", region: "Americas • South America", area: "1,141,748 km²", languages: "Spanish", desc: "A tropical South American nation marked by rainforests, Andes mountains, and coffee plantations.", lat: 4.5709, lng: -74.2973 },
  "Nigeria": { name: "Nigeria", code: "NG", type: "country", capital: "Abuja", population: "218,541,212 people", region: "Africa • Western Africa", area: "923,768 km²", languages: "English", desc: "Most people know Nigeria, but few know about its northern neighbor — Niger. It's one of Africa's largest countries.", lat: 9.082, lng: 8.6753 },
  "Mali": { name: "Mali", code: "ML", type: "country", capital: "Bamako", population: "21,900,000 people", region: "Africa • Western Africa", area: "1,240,192 km²", languages: "French, Bambara", desc: "A landlocked West African nation rich in history, ancient trading cities like Timbuktu, and vibrant Saharan cultures.", lat: 17.5707, lng: -3.9962 },
  "Algeria": { name: "Algeria", code: "DZ", type: "country", capital: "Algiers", population: "44,900,000 people", region: "Africa • Northern Africa", area: "2,381,741 km²", languages: "Arabic, Berber", desc: "The largest country in Africa by land area, dominated by the vast Sahara Desert and Mediterranean coastline.", lat: 28.0339, lng: 1.6596 },
  "Niger": { name: "Niger", code: "NE", type: "country", capital: "Niamey", population: "25,250,000 people", region: "Africa • Western Africa", area: "1,267,000 km²", languages: "French, Hausa", desc: "Shaped by the Sahara Desert and the mighty Niger River. Rich in uranium, gold, coal, and oil.", lat: 17.6078, lng: 8.0817 },
  "Chad": { name: "Chad", code: "TD", type: "country", capital: "N'Djamena", population: "17,180,000 people", region: "Africa • Central Africa", area: "1,284,000 km²", languages: "French, Arabic", desc: "A landlocked country in north-central Africa known for Lake Chad and the Tibesti Mountains.", lat: 15.4542, lng: 18.7322 },
  "Sudan": { name: "Sudan", code: "SD", type: "country", capital: "Khartoum", population: "45,660,000 people", region: "Africa • Northern Africa", area: "1,886,068 km²", languages: "Arabic, English", desc: "Located where the White and Blue Nile rivers meet, famous for having more pyramids than Egypt.", lat: 12.8628, lng: 30.2176 },
  "Senegal": { name: "Senegal", code: "SN", type: "country", capital: "Dakar", population: "16,880,000 people", region: "Africa • Western Africa", area: "196,712 km²", languages: "French, Wolof", desc: "The westernmost mainland African country, renowned for Dakar, Teranga hospitality, and rich music.", lat: 14.4974, lng: -14.4524 },
  "Ghana": { name: "Ghana", code: "GH", type: "country", capital: "Accra", population: "32,830,000 people", region: "Africa • Western Africa", area: "238,535 km²", languages: "English", desc: "A bustling West African country on the Gulf of Guinea known for cocoa, gold, and vibrant Atlantic heritage.", lat: 7.9465, lng: -1.0232 },
  "Morocco": { name: "Morocco", code: "MA", type: "country", capital: "Rabat", population: "37,080,000 people", region: "Africa • Northern Africa", area: "446,550 km²", languages: "Arabic, Berber", desc: "A North African kingdom defined by Arabian, Berber, and European influences with imperial cities.", lat: 31.7917, lng: -7.0926 },
  "Ethiopia": { name: "Ethiopia", code: "ET", type: "country", capital: "Addis Ababa", population: "120,300,000 people", region: "Africa • Eastern Africa", area: "1,104,300 km²", languages: "Amharic", desc: "A rugged, landlocked Horn of Africa country divided by the Great Rift Valley, with ancient origins.", lat: 9.145, lng: 40.4897 },
  "Kenya": { name: "Kenya", code: "KE", type: "country", capital: "Nairobi", population: "53,010,000 people", region: "Africa • Eastern Africa", area: "580,367 km²", languages: "Swahili, English", desc: "An East African nation with coastlines on the Indian Ocean, famous for Maasai Mara wildlife safaris.", lat: -0.0236, lng: 37.9062 },
  "United States of America": { name: "United States", code: "US", type: "country", capital: "Washington, D.C.", population: "333,287,557 people", region: "Americas • North America", area: "9,833,520 km²", languages: "English", desc: "A vast North American country spanning 50 states with diverse landscapes from Atlantic to Pacific.", lat: 37.0902, lng: -95.7129 },
  "United Kingdom": { name: "United Kingdom", code: "GB", type: "country", capital: "London", population: "67,596,281 people", region: "Europe • Northern Europe", area: "242,495 km²", languages: "English", desc: "An island nation in northwestern Europe made up of England, Scotland, Wales, and Northern Ireland.", lat: 55.3781, lng: -3.4360 },
  "France": { name: "France", code: "FR", type: "country", capital: "Paris", population: "64,756,584 people", region: "Europe • Western Europe", area: "551,695 km²", languages: "French", desc: "A Western European nation encompassing medieval cities, alpine villages, and Mediterranean beaches.", lat: 46.2276, lng: 2.2137 },
  "Germany": { name: "Germany", code: "DE", type: "country", capital: "Berlin", population: "83,369,843 people", region: "Europe • Central Europe", area: "357,022 km²", languages: "German", desc: "A Western European country with a landscape of forests, rivers, mountain ranges, and 2 millennia of history.", lat: 51.1657, lng: 10.4515 },
  "Spain": { name: "Spain", code: "ES", type: "country", capital: "Madrid", population: "47,420,000 people", region: "Europe • Southern Europe", area: "505,990 km²", languages: "Spanish", desc: "A European country on the Iberian Peninsula with diverse geography and Mediterranean coastlines.", lat: 40.4637, lng: -3.7492 },
  "Italy": { name: "Italy", code: "IT", type: "country", capital: "Rome", population: "59,110,000 people", region: "Europe • Southern Europe", area: "301,340 km²", languages: "Italian", desc: "A boot-shaped peninsula in southern Europe with long Mediterranean coastline and rich historical heritage.", lat: 41.8719, lng: 12.5674 },
  "Japan": { name: "Japan", code: "JP", type: "country", capital: "Tokyo", population: "123,951,692 people", region: "Asia • Eastern Asia", area: "377,975 km²", languages: "Japanese", desc: "An island nation in East Asia in the Pacific Ocean with dense cities, imperial palaces, and mountainous national parks.", lat: 36.2048, lng: 138.2529 },
  "Brazil": { name: "Brazil", code: "BR", type: "country", capital: "Brasília", population: "215,313,498 people", region: "Americas • South America", area: "8,515,767 km²", languages: "Portuguese", desc: "The largest country in South America and Latin America, famous for the Amazon Rainforest and Rio de Janeiro.", lat: -14.2350, lng: -51.9253 },

  // Water Bodies & Oceans
  "Atlantic Ocean": { name: "Atlantic Ocean", code: "AO", type: "water", region: "Global Water Basin", area: "106,460,000 km²", desc: "The world's second-largest ocean basin, separating Europe and Africa from the Americas. Average depth: 3,646 meters.", lat: 14.59, lng: -28.67 },
  "Pacific Ocean": { name: "Pacific Ocean", code: "PO", type: "water", region: "Global Water Basin", area: "165,250,000 km²", desc: "The world's largest and deepest ocean basin, covering one-third of the Earth's surface and containing the Mariana Trench.", lat: 0, lng: -160 },
  "Indian Ocean": { name: "Indian Ocean", code: "IO", type: "water", region: "Global Water Basin", area: "70,560,000 km²", desc: "Bounded by Asia, Africa, Australia, and the Southern Ocean. Known for ancient monsoon sea trading routes.", lat: -20, lng: 80 },
  "Arctic Ocean": { name: "Arctic Ocean", code: "AO", type: "water", region: "North Polar Zone", area: "14,060,000 km²", desc: "The smallest and shallowest ocean, covered by sea ice year-round and surrounding the North Pole.", lat: 85, lng: 0 },
  "Southern Ocean": { name: "Southern Ocean", code: "SO", type: "water", region: "South Polar Zone", area: "20,327,000 km²", desc: "Encircles Antarctica with extreme polar currents, marine ecosystems, and iceberg fields.", lat: -65, lng: 0 },
  "Mediterranean Sea": { name: "Mediterranean Sea", code: "MS", type: "water", region: "Southern Europe • Northern Africa", area: "2,500,000 km²", desc: "Intercontinental sea connected to the Atlantic Ocean, cradling ancient Mediterranean civilizations.", lat: 35, lng: 18 },
  "Red Sea": { name: "Red Sea", code: "RS", type: "water", region: "Middle East • East Africa", area: "438,000 km²", desc: "Seawater inlet of the Indian Ocean between Africa and Asia, linked to the Suez Canal.", lat: 20, lng: 38 },
  "Arabian Sea": { name: "Arabian Sea", code: "AS", type: "water", region: "Asia • Northern Indian Ocean", area: "3,862,000 km²", desc: "Region of the northern Indian Ocean bounded by Pakistan, Iran, the Arabian Peninsula, and India.", lat: 15.0, lng: 65.0 },
  "Bay of Bengal": { name: "Bay of Bengal", code: "BB", type: "water", region: "Asia • Southern Asia", area: "2,172,000 km²", desc: "The northeastern part of the Indian Ocean, bounded by India, Bangladesh, Myanmar, and Sri Lanka.", lat: 15.0, lng: 88.0 },
  "Black Sea": { name: "Black Sea", code: "BS", type: "water", region: "Europe • Western Asia", area: "436,402 km²", desc: "A marginal sea of the Atlantic Ocean between Southeastern Europe and Western Asia.", lat: 43.5, lng: 34.5 },
  "Greenland Sea": { name: "Greenland Sea", code: "GS", type: "water", region: "North Atlantic • Arctic", area: "1,205,000 km²", desc: "A body of water that borders Greenland, Svalbard, and Iceland.", lat: 76.0, lng: -8.0 },
  "Norwegian Sea": { name: "Norwegian Sea", code: "NS", type: "water", region: "Europe • North Atlantic", area: "1,383,000 km²", desc: "Marginal sea in the North Atlantic Ocean, northwest of Norway.", lat: 69.0, lng: 0.0 },
  "Barents Sea": { name: "Barents Sea", code: "BS", type: "water", region: "Europe • Arctic Ocean", area: "1,400,000 km²", desc: "A marginal sea of the Arctic Ocean, located off the northern coasts of Norway and Russia.", lat: 75.0, lng: 40.0 },
  "Weddell Sea": { name: "Weddell Sea", code: "WS", type: "water", region: "Antarctica • Southern Ocean", area: "2,800,000 km²", desc: "A sea forming part of the Southern Ocean, bounded by the Antarctic Peninsula.", lat: -73.0, lng: -45.0 },
  "Tasman Sea": { name: "Tasman Sea", code: "TS", type: "water", region: "Oceania • South Pacific", area: "2,300,000 km²", desc: "A marginal sea of the South Pacific Ocean, situated between Australia and New Zealand.", lat: -37.0, lng: 160.0 },

  // Rivers & Lakes
  "River Niger": { name: "River Niger", code: "RN", type: "water", region: "Africa • Western Africa", area: "4,180 km length", desc: "The principal river of West Africa, extending 4,180 km through Guinea, Mali, Niger, and Nigeria into the Gulf of Guinea.", lat: 13.8, lng: -0.8 },
  "Nile River": { name: "Nile River", code: "NR", type: "water", region: "Africa • Eastern & Northern Africa", area: "6,650 km length", desc: "The world's longest river system (6,650 km), flowing north through 11 African nations into the Mediterranean Sea.", lat: 15.5, lng: 32.5 },
  "Amazon River": { name: "Amazon River", code: "AR", type: "water", region: "Americas • South America", area: "6,400 km length", desc: "The world's largest river drainage system by discharge volume of water, draining 40% of South America.", lat: -3.46, lng: -62.21 },
  "Mississippi River": { name: "Mississippi River", code: "MR", type: "water", region: "Americas • North America", area: "3,766 km length", desc: "The chief river of the second-largest drainage system on the North American continent.", lat: 37.0, lng: -89.1 },
  "Danube River": { name: "Danube River", code: "DR", type: "water", region: "Europe • Central & Eastern Europe", area: "2,850 km length", desc: "Europe's second-longest river, flowing through 10 countries into the Black Sea.", lat: 45.2, lng: 29.7 },
  "Yangtze River": { name: "Yangtze River", code: "YR", type: "water", region: "Asia • China", area: "6,300 km length", desc: "The longest river in Asia and third-longest in the world, flowing through China into the East China Sea.", lat: 31.2, lng: 121.5 },
  "Congo River": { name: "Congo River", code: "CR", type: "water", region: "Africa • Central Africa", area: "4,700 km length", desc: "The world's deepest recorded river (over 220m deep) and second-largest by discharge volume.", lat: -6.0, lng: 12.4 },
  "Lake Victoria": { name: "Lake Victoria", code: "LV", type: "water", region: "Africa • Eastern Africa", area: "59,947 km²", desc: "Africa's largest lake by surface area and the main reservoir of the River Nile.", lat: -1.0, lng: 33.0 },
  "Lake Chad": { name: "Lake Chad", code: "LC", type: "water", region: "Africa • Central Africa", area: "17,000 km²", desc: "A historically crucial endorheic lake providing fresh water to Chad, Niger, Nigeria, and Cameroon.", lat: 13.0, lng: 14.0 },
  "Caspian Sea": { name: "Caspian Sea", code: "CS", type: "water", region: "Europe • Asia", area: "371,000 km²", desc: "The world's largest inland body of water, classed as both a lake and an inland sea.", lat: 41.5, lng: 50.5 },
  "Lake Superior": { name: "Lake Superior", code: "LS", type: "water", region: "Americas • North America", area: "82,100 km²", desc: "The largest freshwater lake in the world by surface area, located in North America.", lat: 47.7, lng: -87.5 },

  // Ice / Polar Regions
  "Antarctica": { name: "Antarctica", code: "AQ", type: "ice", region: "South Polar Zone", area: "14,200,000 km²", desc: "Earth's southernmost continent containing 90% of global ice.", lat: -82.86, lng: 135.0 },
  "Greenland": { name: "Greenland", code: "GL", type: "ice", capital: "Nuuk", population: "56,000 people", region: "North Polar Zone", area: "2,166,086 km²", languages: "Greenlandic", desc: "Massive autonomous polar island covered by the Greenland Ice Sheet.", lat: 71.70, lng: -42.60 }
};

// Interpolate dense Great Circle geodesic arc points between two coordinates (makes ocean lines curve naturally around sphere)
function interpolateGreatCircle(start: [number, number], end: [number, number], steps = 30): [number, number][] {
  const interpolator = d3.geoInterpolate(start, end);
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    points.push(interpolator(i / steps));
  }
  return points;
}

// Ocean Boundary Divider Paths (Curved Geodesic Lines Separating Oceans & Seas)
const OCEAN_BOUNDARIES = [
  interpolateGreatCircle([-67, -90], [-67, -56]), // Atlantic - Pacific
  interpolateGreatCircle([[20, -90], [20, -34.8]][0], [[20, -90], [20, -34.8]][1]), // Atlantic - Indian
  interpolateGreatCircle([[147, -90], [147, -43.6]][0], [[147, -90], [147, -43.6]][1]), // Indian - Pacific
  interpolateGreatCircle([-180, -60], [180, -60]), // Southern Ocean
  interpolateGreatCircle([-180, 66], [180, 66]), // Arctic Ocean
  interpolateGreatCircle([-5.6, 36], [-5.6, 35.8]), // Mediterranean / Gibraltar
  interpolateGreatCircle([43.3, 12.6], [43.5, 12.8]), // Red Sea / Bab-el-Mandeb
  interpolateGreatCircle([80, 0], [80, 10]) // Arabian Sea / Bay of Bengal
];

const WATER_LABELS = [
  { name: "Atlantic Ocean", lat: 14.59, lng: -28.67 },
  { name: "Pacific Ocean", lat: 0, lng: -160 },
  { name: "Indian Ocean", lat: -20, lng: 80 },
  { name: "Arctic Ocean", lat: 82, lng: 0 },
  { name: "Southern Ocean", lat: -65, lng: 0 },
  { name: "Mediterranean Sea", lat: 35, lng: 18 },
  { name: "Red Sea", lat: 20, lng: 38 },
  { name: "Arabian Sea", lat: 15, lng: 65 },
  { name: "Bay of Bengal", lat: 15, lng: 88 },
  { name: "Black Sea", lat: 43.5, lng: 34.5 },
  { name: "Greenland Sea", lat: 76, lng: -8 },
  { name: "Norwegian Sea", lat: 69, lng: 0 },
  { name: "Barents Sea", lat: 75, lng: 40 },
  { name: "Weddell Sea", lat: -73, lng: -45 },
  { name: "Tasman Sea", lat: -37, lng: 160 }
];

const COUNTRY_COLORS = ["#388e3c", "#fbc02d", "#d32f2f", "#1976d2", "#7b1fa2", "#e65100", "#00796b", "#0288d1", "#c2185b", "#512da8"];

function getCountryColor(name: string): string {
  if (!name) return "#388e3c";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COUNTRY_COLORS[hash % COUNTRY_COLORS.length];
}

export default function GlobeExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const [selectedFeature, setSelectedFeature] = useState<FeatureData | null>(null);
  const [hoveredFeatureName, setHoveredFeatureName] = useState<string | null>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any | null>(null);
  const [riversGeoJson, setRiversGeoJson] = useState<any | null>(null);
  const [lakesGeoJson, setLakesGeoJson] = useState<any | null>(null);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [focusMode, setFocusMode] = useState<"all" | "countries" | "water">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const targetRotationRef = useRef<[number, number, number]>([-10, -15, 0]);
  const scaleRef = useRef<number>(280);
  const targetScaleRef = useRef<number>(280);
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fetch datasets
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(res => res.json())
      .then(topology => {
        const geojson = topojson.feature(topology, topology.objects.countries);
        setWorldGeoJson(geojson);
      })
      .catch(err => console.warn("Failed to load world topology:", err));

    fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_rivers_lake_centerlines.geojson")
      .then(res => res.json())
      .then(data => setRiversGeoJson(data))
      .catch(err => console.warn("Failed to load rivers:", err));

    fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_lakes.geojson")
      .then(res => res.json())
      .then(data => setLakesGeoJson(data))
      .catch(err => console.warn("Failed to load lakes:", err));
  }, []);

  // Native non-passive wheel event listener allowing DEEP VECTOR ZOOM
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAutoSpinning(false);
      if (e.deltaY < 0) {
        targetScaleRef.current = Math.min(1400, targetScaleRef.current + 80);
      } else {
        targetScaleRef.current = Math.max(140, targetScaleRef.current - 80);
      }
    };

    canvas.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth || 1000;
        canvas.height = parent.clientHeight || 750;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Shortest modulo 360 angle path interpolation
      let dLat = targetRotationRef.current[1] - rotationRef.current[1];
      let dLng = (targetRotationRef.current[0] - rotationRef.current[0]) % 360;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;

      scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.08;
      rotationRef.current[0] += dLng * 0.08;
      rotationRef.current[1] += dLat * 0.08;

      const projection = d3.geoOrthographic()
        .scale(scaleRef.current)
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const path = d3.geoPath().projection(projection).context(ctx);
      const graticule = d3.geoGraticule10();

      // 1. Ocean Base Sphere
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = focusMode === "water" || selectedFeature?.type === "water" ? "#0a2540" : "#081420";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(66, 194, 203, 0.4)";
      ctx.stroke();

      // 2. Ocean Boundary Separator Lines (Solid Curved White Separators matching reference photo)
      OCEAN_BOUNDARIES.forEach(boundaryCoords => {
        ctx.beginPath();
        path({ type: "LineString", coordinates: boundaryCoords } as any);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      });

      // 3. Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = focusMode === "water" ? "rgba(0, 180, 216, 0.18)" : "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      // 4. Country Polygons (NO hover highlight in Waterways mode!)
      if (worldGeoJson && worldGeoJson.features) {
        worldGeoJson.features.forEach((feature: any) => {
          const countryName = feature.properties?.name || "Country";
          const isSelected = selectedFeature && selectedFeature.type === "country" && (selectedFeature.name === countryName || countryName.includes(selectedFeature.name));
          const isHovered = focusMode !== "water" && hoveredFeatureName && countryName === hoveredFeatureName;

          ctx.beginPath();
          path(feature);

          if (focusMode === "water") {
            ctx.fillStyle = isSelected ? "#F4D03F" : "#0f2027";
          } else {
            ctx.fillStyle = isSelected ? "#F4D03F" : isHovered ? "rgba(66, 194, 203, 0.8)" : getCountryColor(countryName);
          }

          ctx.fill();
          ctx.lineWidth = isSelected || isHovered ? 1.8 : 0.4;
          ctx.strokeStyle = isSelected || isHovered ? "#ffffff" : focusMode === "water" ? "rgba(0, 180, 216, 0.4)" : "rgba(10, 20, 30, 0.6)";
          ctx.stroke();
        });
      }

      // 5. Render Lakes
      if (lakesGeoJson && lakesGeoJson.features) {
        lakesGeoJson.features.forEach((feature: any) => {
          const lakeName = feature.properties?.name || "Lake";
          const isSelected = selectedFeature && selectedFeature.name.includes(lakeName);
          const isHovered = hoveredFeatureName && lakeName === hoveredFeatureName;

          ctx.beginPath();
          path(feature);
          ctx.fillStyle = isSelected ? "#F4D03F" : isHovered ? "#00f0ff" : "#0077b6";
          ctx.fill();
          ctx.lineWidth = isSelected || isHovered ? 2.0 : 0.8;
          ctx.strokeStyle = isSelected || isHovered ? "#ffffff" : "#00b4d8";
          ctx.stroke();
        });
      }

      // 6. Render Rivers
      if (riversGeoJson && riversGeoJson.features) {
        riversGeoJson.features.forEach((feature: any) => {
          const riverName = feature.properties?.name || "River";
          const isSelected = selectedFeature && selectedFeature.name.includes(riverName);
          const isHovered = hoveredFeatureName && riverName === hoveredFeatureName;

          ctx.beginPath();
          path(feature);
          ctx.lineWidth = isSelected || isHovered ? 2.8 : 1.2;
          ctx.strokeStyle = isSelected ? "#F4D03F" : isHovered ? "#ffffff" : "#00f0ff";
          ctx.stroke();
        });
      }

      // 7. On-Map Water Body Labels
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.textAlign = "center";
      WATER_LABELS.forEach(water => {
        const pt = projection([water.lng, water.lat]);
        if (pt && d3.geoDistance([water.lng, water.lat], [-rotationRef.current[0], -rotationRef.current[1]]) < 1.57) {
          ctx.fillText(water.name, pt[0], pt[1]);
        }
      });

      if (isAutoSpinning && !isDraggingRef.current) {
        targetRotationRef.current[0] += 0.2;
        rotationRef.current[0] = targetRotationRef.current[0];
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldGeoJson, riversGeoJson, lakesGeoJson, selectedFeature, hoveredFeatureName, isAutoSpinning, focusMode]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsAutoSpinning(false);
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    lastMouseRef.current = { x: clientX, y: clientY };
    startMouseRef.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    if (isDraggingRef.current) {
      const dx = clientX - lastMouseRef.current.x;
      const dy = clientY - lastMouseRef.current.y;

      if (Math.abs(clientX - startMouseRef.current.x) > 5 || Math.abs(clientY - startMouseRef.current.y) > 5) {
        hasDraggedRef.current = true;
      }

      targetRotationRef.current[0] += dx * 0.4;
      targetRotationRef.current[1] -= dy * 0.4;
      rotationRef.current[0] = targetRotationRef.current[0];
      rotationRef.current[1] = targetRotationRef.current[1];

      lastMouseRef.current = { x: clientX, y: clientY };
    }

    // Dynamic Hover Detection (NO hover on land in Waterways Mode!)
    if (canvasRef.current && worldGeoJson) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const projection = d3.geoOrthographic()
        .scale(scaleRef.current)
        .translate([canvasRef.current.width / 2, canvasRef.current.height / 2])
        .rotate(rotationRef.current);

      const coords = projection.invert?.([x, y]);
      if (coords) {
        if (focusMode === "water") {
          // In Waterways Mode: Hover on land is DISABLED! Only rivers/lakes
          if (lakesGeoJson && lakesGeoJson.features) {
            const hoveredLake = lakesGeoJson.features.find((f: any) => d3.geoContains(f, coords));
            if (hoveredLake && hoveredLake.properties?.name) {
              setHoveredFeatureName(hoveredLake.properties.name);
              return;
            }
          }
          setHoveredFeatureName(null);
          return;
        }

        // Check Countries hover
        const hoveredCountry = worldGeoJson.features.find((f: any) => d3.geoContains(f, coords));
        if (hoveredCountry && hoveredCountry.properties?.name) {
          setHoveredFeatureName(hoveredCountry.properties.name);
          return;
        }

        setHoveredFeatureName(null);
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    setIsAutoSpinning(false);

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !worldGeoJson) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const projection = d3.geoOrthographic()
      .scale(scaleRef.current)
      .translate([canvas.width / 2, canvas.height / 2])
      .rotate(rotationRef.current);

    const coords = projection.invert?.([x, y]);
    if (!coords) return;

    // 1. Check Lake click
    if (lakesGeoJson && lakesGeoJson.features) {
      const clickedLake = lakesGeoJson.features.find((f: any) => d3.geoContains(f, coords));
      if (clickedLake && clickedLake.properties?.name) {
        const name = clickedLake.properties.name;
        const item: FeatureData = FEATURE_DATABASE[name] || {
          name,
          code: "LK",
          type: "water",
          region: "Inland Freshwater Lake",
          area: "Major Lake Basin",
          desc: `${name} is a major inland freshwater lake.`,
          lat: coords[1],
          lng: coords[0]
        };
        setSelectedFeature(item);
        targetScaleRef.current = 650;
        targetRotationRef.current = [-item.lng, -item.lat, 0];
        return;
      }
    }

    // 2. Check River click (Centroid or distance threshold)
    if (riversGeoJson && riversGeoJson.features) {
      const clickedRiver = riversGeoJson.features.find((f: any) => {
        const centroid = d3.geoCentroid(f);
        return d3.geoDistance(coords, centroid) < 0.08; // Click near river centerline
      });

      if (clickedRiver && clickedRiver.properties?.name) {
        const name = clickedRiver.properties.name;
        const item: FeatureData = FEATURE_DATABASE[name] || {
          name: name.includes("River") ? name : `${name} River`,
          code: "RV",
          type: "water",
          region: "Major World River System",
          area: "Trans-continental River Basin",
          desc: `${name} is a major river system and vital freshwater ecosystem.`,
          lat: coords[1],
          lng: coords[0]
        };
        setSelectedFeature(item);
        targetScaleRef.current = 650;
        targetRotationRef.current = [-item.lng, -item.lat, 0];
        return;
      }
    }

    // 3. Check Country or Ocean click
    const clickedCountry = worldGeoJson.features.find((f: any) => d3.geoContains(f, coords));

    if (clickedCountry) {
      const rawName = clickedCountry.properties?.name || "";
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
      targetScaleRef.current = 850;
      targetRotationRef.current = [-country.lng, -country.lat, 0];
    } else {
      let waterFeature: FeatureData = FEATURE_DATABASE["Atlantic Ocean"];
      if (coords[0] < -100 || coords[0] > 120) {
        waterFeature = FEATURE_DATABASE["Pacific Ocean"];
      } else if (coords[0] > 40 && coords[0] < 110 && coords[1] < 15) {
        waterFeature = FEATURE_DATABASE["Indian Ocean"];
      } else if (coords[1] < -60) {
        waterFeature = FEATURE_DATABASE["Southern Ocean"];
      } else if (coords[1] > 70) {
        waterFeature = FEATURE_DATABASE["Arctic Ocean"];
      } else if (coords[0] > -18 && coords[0] < 15 && coords[1] > 8 && coords[1] < 20) {
        waterFeature = FEATURE_DATABASE["Niger River Basin"];
      } else if (coords[0] > 25 && coords[0] < 35 && coords[1] > 3 && coords[1] < 31) {
        waterFeature = FEATURE_DATABASE["Nile River Basin"];
      } else if (coords[0] > -80 && coords[0] < -50 && coords[1] > -15 && coords[1] < 5) {
        waterFeature = FEATURE_DATABASE["Amazon River Basin"];
      }

      setSelectedFeature(waterFeature);
      targetScaleRef.current = 600;
      targetRotationRef.current = [-coords[0], -coords[1], 0];
    }
  };

  const handleZoomIn = () => {
    setIsAutoSpinning(false);
    targetScaleRef.current = Math.min(1400, targetScaleRef.current + 120);
  };

  const handleZoomOut = () => {
    setIsAutoSpinning(false);
    targetScaleRef.current = Math.max(140, targetScaleRef.current - 120);
  };

  const handleResetView = () => {
    targetRotationRef.current = [-10, -15, 0];
    targetScaleRef.current = 280;
    setSelectedFeature(null);
    setIsAutoSpinning(true);
  };

  const handleSearchSelect = (countryName: string) => {
    setIsAutoSpinning(false);
    const country = FEATURE_DATABASE[countryName];
    if (country) {
      setSelectedFeature(country);
      targetScaleRef.current = 850;
      targetRotationRef.current = [-country.lng, -country.lat, 0];
    }
  };

  const getCanvasCursor = () => {
    if (focusMode === "water") {
      // In Waterways mode: Cursor over land is ALWAYS Grab Hand! Pointer finger only on hovered rivers/lakes
      return hoveredFeatureName ? "cursor-pointer" : "cursor-grab";
    } else {
      return hoveredFeatureName ? "cursor-pointer" : "cursor-grab";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full pb-20 font-sans text-white"
    >
      {/* Top Navigation Row */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-gray-900/40 hover:bg-gray-900/80 text-gray-300 hover:text-white px-4 py-2 rounded-full border border-white/10 transition-all text-xs font-semibold backdrop-blur-xl hover:border-geoCyan/40 active:scale-95 shadow-sm group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-geoCyan group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Minimalist Page Header */}
      <header className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-geoCyan font-semibold uppercase tracking-wider text-xs mb-2 bg-geoCyan/10 px-3 py-1 rounded-full border border-geoCyan/20">
            <GlobeIcon className="w-3.5 h-3.5" />
            Cartographic Atlas
          </div>
          <h1 className="text-3xl md:text-5xl text-white font-extrabold tracking-tight mb-2">
            3D Vector Globe Atlas
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Explore countries, ocean boundaries, rivers, and lakes on a 3D vector globe.
          </p>
        </div>
        <div className="lg:col-span-5">
          <AdBanner slotId="globe-explorer-header-slot" className="my-0" />
        </div>
      </header>

      {/* Map Card Shell */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-xl overflow-hidden p-0 h-[650px] md:h-[720px] flex items-center justify-center">
        {/* Top Floating Search, Focus Mode Toggle & Quiz Bar */}
        <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between gap-3 pointer-events-none">
          {/* Search Dropdown */}
          <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-gray-900/80 border border-white/15 rounded-full px-4 py-2 backdrop-blur-xl shadow-2xl">
            <Search className="w-4 h-4 text-gray-400" />
            <select
              onChange={(e) => handleSearchSelect(e.target.value)}
              value={selectedFeature?.name || ""}
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

          {/* Mode Switcher: All (Land & Water) vs Countries vs Waterways */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/15 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => setFocusMode("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                focusMode === "all"
                  ? "bg-geoYellow text-gray-950 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All</span>
            </button>
            <button
              onClick={() => setFocusMode("countries")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                focusMode === "countries"
                  ? "bg-geoYellow text-gray-950 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Countries</span>
            </button>
            <button
              onClick={() => setFocusMode("water")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                focusMode === "water"
                  ? "bg-geoCyan text-gray-950 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Waterways</span>
            </button>
          </div>

          <div className="pointer-events-auto ml-auto hidden sm:block">
            <button
              onClick={() => navigate("/game")}
              className="inline-flex items-center gap-2 bg-geoYellow hover:bg-geoCyan text-gray-950 px-5 py-2 rounded-full border border-geoYellow/40 transition-all text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Start Quiz</span>
            </button>
          </div>
        </div>

        {/* 2D/3D Canvas Vector Globe */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onClick={handleCanvasClick}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            touchAction: "none"
          }}
          className={`w-full h-full object-contain ${getCanvasCursor()} active:cursor-grabbing`}
        />

        {/* Floating Cartographic Map Legend (Matching Reference Image) */}
        {(focusMode === "water" || focusMode === "all") && (
          <div className="absolute bottom-5 left-5 z-30 bg-black/80 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md shadow-2xl text-xs space-y-2 font-mono max-w-[220px] pointer-events-none">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-2.5 rounded-sm bg-[#0077b6] border border-[#00b4d8]"></span>
              <span className="text-gray-200 text-[11px]">Ocean (separated by borders)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-0.5 bg-[#00f0ff]"></span>
              <span className="text-gray-200 text-[11px]">Rivers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-2.5 rounded-full bg-[#00b4d8] border border-white/30"></span>
              <span className="text-gray-200 text-[11px]">Lakes</span>
            </div>
          </div>
        )}

        {/* Bottom Left Floating Zoom Buttons */}
        <div className="absolute bottom-28 left-5 z-30 flex flex-col gap-2">
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

        {/* Compact Popup Card Above Map */}
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-sm bg-[#080d1a]/95 text-white rounded-2xl p-4 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3"
          >
            {/* Top Row: Region & Category Badges + Close Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase">
                <span className="px-2.5 py-0.5 rounded-full bg-geoCyan/15 text-geoCyan border border-geoCyan/30">
                  {selectedFeature.region.split("•")[0]?.trim() || "GLOBAL"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-geoYellow/15 text-geoYellow border border-geoYellow/30">
                  {selectedFeature.type === "country" ? "COUNTRIES & NATIONS" : selectedFeature.type === "water" ? "WATER BASIN" : "POLAR ICE"}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedFeature(null);
                  targetScaleRef.current = 280;
                }}
                className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-white tracking-tight leading-tight">
              {selectedFeature.name}
            </h3>

            {/* Overview Box */}
            <div className="max-h-24 overflow-y-auto video-preview-scroll pr-1 text-xs text-gray-300 leading-relaxed font-normal">
              {selectedFeature.desc || `${selectedFeature.name} is a sovereign country in ${selectedFeature.region} with capital ${selectedFeature.capital || "N/A"} and a population of ${selectedFeature.population || "N/A"}.`}
            </div>

            {/* Footer Row: Coordinates + Read More Button */}
            <div className="pt-1 flex items-center justify-between text-xs border-t border-white/10">
              <span className="font-mono text-[11px] text-gray-400">
                📍 {selectedFeature.lat.toFixed(2)}°, {selectedFeature.lng.toFixed(2)}°
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-geoCyan hover:text-geoYellow font-extrabold uppercase tracking-wider text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Read More</span>
                <span>➔</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Video Preview Modal Style Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedFeature && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#080e1a] border border-white/20 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Banner / Modal Header */}
              <div className="relative p-6 bg-gradient-to-br from-gray-900 to-black border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/20 shadow">
                    {selectedFeature.type === "country" ? (
                      <img src={`https://flagcdn.com/w320/${selectedFeature.code.toLowerCase()}.png`} alt="" className="w-full h-full object-cover" />
                    ) : selectedFeature.type === "water" ? (
                      <div className="w-full h-full bg-geoCyan/20 flex items-center justify-center text-geoCyan"><Waves className="w-5 h-5" /></div>
                    ) : (
                      <div className="w-full h-full bg-cyan-200/20 flex items-center justify-center text-cyan-200"><Snowflake className="w-5 h-5" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{selectedFeature.name}</h3>
                    <span className="text-xs font-mono text-geoCyan font-bold uppercase">{selectedFeature.region}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Stats */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto video-preview-scroll text-sm">
                {selectedFeature.capital && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Capital</span>
                    <span className="font-bold text-white">{selectedFeature.capital}</span>
                  </div>
                )}
                {selectedFeature.population && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Population</span>
                    <span className="font-bold text-white">{selectedFeature.population}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Total Area</span>
                  <span className="font-bold text-white">{selectedFeature.area}</span>
                </div>
                {selectedFeature.languages && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold">Language(s)</span>
                    <span className="font-bold text-white">{selectedFeature.languages}</span>
                  </div>
                )}
                {selectedFeature.desc && (
                  <div className="pt-1">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-semibold block mb-1">Geographic Overview</span>
                    <p className="text-xs text-gray-300 leading-relaxed">{selectedFeature.desc}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 bg-black/40 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/map?lat=${selectedFeature.lat}&lng=${selectedFeature.lng}&from=explorer`);
                  }}
                  className="w-full bg-geoCyan hover:bg-geoYellow text-gray-950 font-extrabold py-3.5 rounded-full transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  View on Interactive Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
