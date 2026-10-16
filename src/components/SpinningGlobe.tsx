import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3-geo";
import * as topojson from "topojson-client";
import { Sparkles } from "lucide-react";

const COUNTRY_COLORS = ["#388e3c", "#fbc02d", "#d32f2f", "#1976d2", "#7b1fa2", "#e65100", "#00796b", "#0288d1", "#c2185b", "#512da8"];

function getCountryColor(name: string): string {
  if (!name) return "#388e3c";
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COUNTRY_COLORS[hash % COUNTRY_COLORS.length];
}

export default function SpinningGlobe() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any | null>(null);
  const rotationRef = useRef<[number, number, number]>([0, -15, 0]);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(res => res.json())
      .then(topology => {
        const geojson = topojson.feature(topology, topology.objects.countries);
        setWorldGeoJson(geojson);
      })
      .catch(err => console.warn("Failed to load world topology:", err));
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !worldGeoJson) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const projection = d3.geoOrthographic()
      .scale(150)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current)
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule10();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Ocean Base
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "#081420";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(66, 194, 203, 0.5)";
      ctx.stroke();

      // Graticule Lines
      ctx.beginPath();
      path(graticule);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.stroke();

      // Country Polygons
      if (worldGeoJson && worldGeoJson.features) {
        worldGeoJson.features.forEach((feature: any) => {
          const countryName = feature.properties?.name || "Country";
          ctx.beginPath();
          path(feature);
          ctx.fillStyle = getCountryColor(countryName);
          ctx.fill();
          ctx.lineWidth = 0.4;
          ctx.strokeStyle = "rgba(10, 20, 30, 0.6)";
          ctx.stroke();
        });
      }

      // Smooth Auto Rotation
      rotationRef.current[0] += 0.4;
      projection.rotate(rotationRef.current);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldGeoJson]);

  return (
    <div
      className="relative w-full aspect-square max-w-[360px] mx-auto flex items-center justify-center cursor-pointer group select-none"
      onClick={() => navigate("/explorer")}
      title="Click to open 3D Globe Explorer"
    >
      {/* Outer Rotating Star/Text Ring */}
      <div className="absolute inset-0 animate-[spin_35s_linear_infinite] pointer-events-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 400 400">
          <defs>
            <path id="globePath" d="M 50, 200 a 150,150 0 1,1 300,0 a 150,150 0 1,1 -300,0" />
          </defs>
          <text className="text-[11px] font-mono tracking-[0.3em] uppercase opacity-90" fill="#F4D03F">
            <textPath href="#globePath" startOffset="0%">
              ★ GEO-GLOBE ★ 3D WORLD ATLAS ★ EXPLORE COUNTRIES ★
            </textPath>
          </text>
        </svg>
      </div>

      {/* 2D Vector Globe Canvas */}
      <div className="relative rounded-full overflow-hidden shadow-[0_0_50px_rgba(66,194,203,0.3)] border-2 border-geoCyan/40 group-hover:scale-105 transition-transform duration-300">
        <canvas ref={canvasRef} width={320} height={320} className="w-[280px] h-[280px] md:w-[320px] md:h-[320px]" />
      </div>

      {/* Explore Hint Badge */}
      <div className="absolute -bottom-2 bg-gray-950/90 border border-geoCyan/40 text-geoCyan px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-3 h-3 text-geoYellow animate-spin" />
        <span>Click to Open 3D Globe</span>
      </div>
    </div>
  );
}
